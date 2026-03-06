'use server';

import { revalidatePath } from 'next/cache';
import { getPhoneOrders, createPhoneOrder, updateOrderStatus } from '@/lib/supabase';
import { sendTaxiDispatchSMS } from '@/lib/twilio';
import { initiateTaxiDispatchCall } from '@/lib/taxi-vapi';

export async function createOrder(orderData: any) {
    try {
        const newOrder = await createPhoneOrder(orderData);

        if (orderData.order_type === 'Delivery') {
            console.log('Order is for delivery. Dispatch will be triggered when marked complete in dashboard.');
        }

        // Trigger revalidation without waiting for it to finish (improves response time)
        revalidatePath('/dashboard/orders', 'page');
        return newOrder;
    } catch (error) {
        console.error('Failed to create order action:', error);
        throw error;
    }
}

export async function getOrders() {
    try {
        return await getPhoneOrders();
    } catch (error) {
        console.error('Failed to get orders action:', error);
        return [];
    }
}

export async function updateOrder(id: string, status: string) {
    try {
        const updatedOrder = await updateOrderStatus(id, status);

        if (status === 'completed' && updatedOrder?.order_type === 'Delivery') {
            console.log('Order completed and is for delivery. Triggering Taxi Dispatch...');
            // Asynchronous dispatch notification
            Promise.all([
                sendTaxiDispatchSMS(updatedOrder).catch(e => console.error(e)),
                initiateTaxiDispatchCall(updatedOrder).catch(e => console.error(e))
            ]).then(() => console.log('Taxi Dispatch notifications initiated.'));
        }

        revalidatePath('/dashboard/orders', 'page');
        return updatedOrder;
    } catch (error) {
        console.error('Failed to update order action:', error);
        throw error;
    }
}
