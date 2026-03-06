import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '';
const taxiDispatchNumber = process.env.TAXI_DISPATCH_PHONE_NUMBER || '';

let twilioClient: twilio.Twilio | null = null;
if (accountSid && authToken) {
    twilioClient = twilio(accountSid, authToken);
}

export async function sendTaxiDispatchSMS(orderData: any) {
    console.log('Attempting to send Taxi Dispatch SMS...', { to: taxiDispatchNumber });

    if (!twilioClient || !twilioPhoneNumber || !taxiDispatchNumber) {
        console.warn('Twilio credentials or dispatch phone number are missing. Skipping SMS notification.');
        return false;
    }

    try {
        const orderId = orderData.id ? orderData.id.toString().slice(-4) : 'NEW';
        const address = orderData.delivery_address || 'Pickup from Restaurant';
        const customerPhone = orderData.customer_phone || 'Not provided';

        let itemsSummary = '';
        if (Array.isArray(orderData.order_items)) {
            itemsSummary = orderData.order_items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ');
        }

        const messageBody = `🚨 NEW DISPATCH ALERTT 🚨\n\nRestaurant Order #${orderId} ready soon.\n\n📍 Delivery To:\n${address}\n\n📞 Customer Phone:\n${customerPhone}\n\n🍔 Items:\n${itemsSummary}\n\nPlease assign a driver.`;

        const message = await twilioClient.messages.create({
            body: messageBody,
            from: twilioPhoneNumber,
            to: taxiDispatchNumber
        });

        console.log(`Successfully sent SMS to ${taxiDispatchNumber}. Message SID: ${message.sid}`);
        return true;
    } catch (error) {
        console.error('Failed to send Twilio SMS:', error);
        return false;
    }
}
