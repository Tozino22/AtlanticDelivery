import { NextRequest, NextResponse } from 'next/server';
import { createPhoneOrder, getMenuItems } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const { transcript } = await req.json();

        if (!transcript) {
            return NextResponse.json({ reply: 'I did not hear anything. Please try again.' });
        }

        // Get the live menu items
        const menuItems = await getMenuItems();

        // Simple AI parsing: match menu items mentioned in transcript
        const lowerTranscript = transcript.toLowerCase();
        const orderedItems: any[] = [];

        for (const item of menuItems) {
            if (lowerTranscript.includes(item.name.toLowerCase())) {
                // Try to extract a quantity like "two", "2", "one", "1", etc.
                const quantityWords: Record<string, number> = {
                    one: 1, two: 2, three: 3, four: 4, five: 5,
                    '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
                };
                let quantity = 1;
                for (const [word, val] of Object.entries(quantityWords)) {
                    const idx = lowerTranscript.indexOf(word);
                    if (idx !== -1) {
                        // Check if it appears close to the item name
                        const itemIdx = lowerTranscript.indexOf(item.name.toLowerCase());
                        if (Math.abs(idx - itemIdx) < 20) {
                            quantity = val;
                            break;
                        }
                    }
                }
                orderedItems.push({ id: item.id, name: item.name, quantity, price: item.price });
            }
        }

        if (orderedItems.length === 0) {
            return NextResponse.json({
                reply: `I heard: "${transcript}" but could not match any items on our menu. Please try saying the exact name of what you'd like to order.`,
            });
        }

        const total = orderedItems.reduce((s, i) => s + i.price * i.quantity, 0);

        // Save the order
        await createPhoneOrder({
            customer_name: 'Voice Customer',
            customer_phone: 'Voice Order',
            order_items: JSON.stringify(orderedItems),
            order_type: 'Pickup',
            total_amount: total,
            status: 'pending',
            source: 'voice_order',
        });

        const itemList = orderedItems.map(i => `${i.quantity}x ${i.name}`).join(', ');
        const reply = `Got it! I've placed your order for ${itemList}. Your total is $${total.toFixed(2)}. We'll have it ready for you shortly!`;

        return NextResponse.json({ reply });
    } catch (error) {
        console.error('Voice order error:', error);
        return NextResponse.json({ reply: 'Sorry, something went wrong. Please try again.' });
    }
}
