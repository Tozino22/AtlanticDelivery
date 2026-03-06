'use server';

import OpenAI from 'openai';
import { getPhoneOrders, getSalesData, getMenuItems, updateMenuItem } from '@/lib/supabase';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function askAnalytics(query: string, tenantId?: string) {
    try {
        // Multi-tenant check: filter by tenantId in production
        // For now, we fetch everything as a platform-level view
        console.log(`[AI Analytics] Processing query for tenant: ${tenantId || 'global'}`);

        const [orders, sales, menu] = await Promise.all([
            getPhoneOrders(),
            getSalesData(),
            getMenuItems()
        ]);

        const now = new Date();
        const todayDateStr = now.toISOString().split('T')[0];

        // Lenient check: match today's date prefix OR any order in the last 24 hours
        // This solves timezone mismatch issues where an order at 11pm might be tagged as tomorrow UTC
        const isRecent = (dateStr: string) => {
            if (!dateStr) return false;
            if (dateStr.includes(todayDateStr)) return true;
            const d = new Date(dateStr);
            const diffHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);
            return diffHours >= 0 && diffHours < 24;
        };

        const todayOrders = orders.filter((o: any) => isRecent(o.created_at));
        const todaySales = sales.filter((s: any) => isRecent(s.transaction_date));

        console.log(`[AI Logic] Snapshot: Total=${orders.length}, TodayMatch=${todayOrders.length}`);
        orders.forEach((o: any, i: number) => console.log(`[AI Debug] Order #${i} Date: ${o.created_at}`));

        const dataContext = {
            metadata: {
                current_time: now.toISOString(),
                today_date: todayDateStr,
                note: "Pre-calculated 'today' includes anything from the last 24 hours to handle late-night shifts and timezones."
            },
            financials: {
                total_orders: orders.length + sales.length,
                pending_orders: orders.filter((o: any) => o.status === 'pending').length,
                today: {
                    revenue:
                        todayOrders.filter((o: any) => o.status === 'completed').reduce((sum: number, o: any) => sum + Number(o.total_amount), 0) +
                        todaySales.reduce((sum: number, s: any) => sum + Number(s.total_amount), 0),
                    order_count: todayOrders.length + todaySales.length,
                    status_breakdown: {
                        completed: todayOrders.filter((o: any) => o.status === 'completed').length,
                        pending: todayOrders.filter((o: any) => o.status === 'pending').length,
                        manual_pos: todaySales.length
                    }
                },
                completed_revenue:
                    orders.filter((o: any) => o.status === 'completed').reduce((sum: number, o: any) => sum + Number(o.total_amount), 0) +
                    sales.reduce((sum: number, s: any) => sum + Number(s.total_amount), 0),
                channel_breakdown: {
                    voice_and_phone: orders.filter((o: any) => o.source === 'VAPI' || o.source === 'Phone').length,
                    voice_and_phone_revenue: orders.filter((o: any) => (o.source === 'VAPI' || o.source === 'Phone') && o.status === 'completed').reduce((sum: number, o: any) => sum + Number(o.total_amount), 0),
                    online_website: orders.filter((o: any) => o.source === 'online_website' || o.source === 'Website').length,
                    online_website_revenue: orders.filter((o: any) => (o.source === 'online_website' || o.source === 'Website') && o.status === 'completed').reduce((sum: number, o: any) => sum + Number(o.total_amount), 0),
                    manual_pos_and_ocr: sales.length,
                    manual_pos_and_ocr_revenue: sales.reduce((sum: number, s: any) => sum + Number(s.total_amount), 0)
                }
            },
            menu: menu.map(item => ({
                id: item.id,
                name: item.name,
                category: item.category,
                price: item.price,
                available: item.available,
                stock_status: item.available ? 'Good' : 'Out of Stock'
            })),
            recent_activity: [
                ...orders.slice(0, 20).map((o: any) => ({ type: 'Order', amount: o.total_amount, source: o.source, status: o.status, date: o.created_at })),
                ...sales.slice(0, 10).map((s: any) => ({ type: 'Sale (POS/OCR)', amount: s.total_amount, source: s.source, date: s.transaction_date }))
            ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        };

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `ROLE:
You are a restaurant operations intelligence system. You can analyze data AND perform actions on the menu.

DATA CONTEXT:
${JSON.stringify(dataContext, null, 2)}

CAPABILITIES:
1. Analysis: Calculate revenue, orders, trends, and risks.
2. Menu Management: You can update the availability of items. If a user says "Jollof is finished" or "Set pizza to out of stock", use the update_menu_item tool.

GUIDELINES:
- Be precise with numbers. Tell the user exactly what you see.
- IMPORTANT: If pre-calculated 'today' stats are 0, look at the 'recent_activity' list and see if any occurred very recently relative to current_time.
- Use a professional, executive tone.
- Confirm any menu actions clearly.`
                },
                {
                    role: "user",
                    content: query
                },
            ],
            tools: [
                {
                    type: "function",
                    function: {
                        name: "update_menu_item",
                        description: "Update the availability of a menu item (e.g., mark as out of stock)",
                        parameters: {
                            type: "object",
                            properties: {
                                itemId: { type: "string", description: "The ID of the menu item" },
                                itemName: { type: "string", description: "The name of the menu item (used for confirmation)" },
                                available: { type: "boolean", description: "Whether the item is available or not" }
                            },
                            required: ["itemId", "itemName", "available"]
                        }
                    }
                }
            ],
            tool_choice: "auto",
        });

        const message = response.choices[0].message;

        if (message.tool_calls) {
            for (const toolCall of message.tool_calls) {
                if (toolCall.function.name === "update_menu_item") {
                    const { itemId, available, itemName } = JSON.parse(toolCall.function.arguments);
                    await updateMenuItem(itemId, { available });
                    return `✅ Action Confirmed: I have updated ${itemName} to be ${available ? 'available' : 'out of stock'}.`;
                }
            }
        }

        return message.content;
    } catch (error) {
        console.error('Advanced Analytics AI Error:', error);
        return "The Intelligence System encountered an error. Please check your connection.";
    }
}
