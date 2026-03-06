const vapiSecret = process.env.VAPI_SECRET_KEY || '';
const vapiPublicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '';
const taxiDispatchNumber = process.env.TAXI_DISPATCH_PHONE_NUMBER || '';
const restaurantPhoneNumber = process.env.RESTAURANT_PHONE_NUMBER || ''; // A verified phone number on Vapi

export async function initiateTaxiDispatchCall(orderData: any) {
    console.log('Attempting to initiate Taxi Dispatch Call...', { to: taxiDispatchNumber });

    if (!vapiSecret || !taxiDispatchNumber) {
        console.warn('Vapi secret or taxi dispatch number missing. Skipping outbound call.');
        return false;
    }

    try {
        const orderId = orderData.id ? orderData.id.toString().slice(-4) : 'NEW';
        const address = orderData.delivery_address || 'Customer Location (Check SMS)';

        const systemPrompt = `You are an automated dispatch AI working for a restaurant. 
You are speaking to a taxi dispatch operator. Your ONLY job is to notify them of a new delivery.
Be professional and concise.

When they answer the phone, say exactly this:
"Hello, this is the automated dispatch from the restaurant. We have a new delivery order, Order Number ${orderId}, that needs a driver. The delivery is going to: ${address}. I have also sent these full details to you via text message. Please confirm you have received this and will assign a driver."

If they ask questions, politely inform them you are an automated system and refer them to the text message. If they agree, thank them and end the call.`;

        const response = await fetch('https://api.vapi.ai/call/phone', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${vapiSecret}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID || "", // Will need this configured in Vapi dashboard for outbound calling
                customer: {
                    number: taxiDispatchNumber,
                },
                assistant: {
                    model: {
                        provider: 'openai',
                        model: 'gpt-4o',
                        messages: [
                            {
                                role: 'system',
                                content: systemPrompt
                            }
                        ]
                    },
                    voice: {
                        provider: '11labs',
                        voiceId: '21m00Tcm4TlvDq8ikWAM' // Rachel Voice ID from other config
                    },
                    firstMessage: "Hello, this is the automated dispatch from the restaurant.",
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Vapi API error: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        console.log(`Successfully initiated Vapi call to ${taxiDispatchNumber}. Call ID: ${data.id}`);
        return true;

    } catch (error) {
        console.error('Failed to initiate Vapi outbound call:', error);
        return false;
    }
}
