'use client';

import { useState } from 'react';
import { PhoneOrder } from '@/types';
import { Phone, MapPin, Truck, Clock, CheckCircle, FileText } from 'lucide-react';
import { updateOrder } from '@/app/actions/orders';
import { format } from 'date-fns';

interface OrderCardProps {
    order: PhoneOrder;
    onUpdate: () => void;
}

export default function OrderCard({ order, onUpdate }: OrderCardProps) {
    const [isUpdating, setIsUpdating] = useState(false);

    async function handleComplete() {
        try {
            setIsUpdating(true);
            await updateOrder(order.id, 'completed');
            onUpdate();
        } catch (error) {
            console.error('Error completing order:', error);
        } finally {
            setIsUpdating(false);
        }
    }

    const isPending = order.status === 'pending';

    return (
        <div className={`card animate-slide-up ${isPending ? 'border-l-4 border-l-orange-500' : ''}`}>
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Section - Customer Info */}
                <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-xl font-bold mb-1">{order.customer_name}</h3>
                            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                <Phone className="w-4 h-4" />
                                <span>{order.customer_phone}</span>
                            </div>
                        </div>
                        <div className={`badge ${isPending ? 'badge-warning' : 'badge-success'}`}>
                            {isPending ? (
                                <>
                                    <Clock className="w-3 h-3 mr-1" />
                                    Pending
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Completed
                                </>
                            )}
                        </div>
                    </div>

                    {/* Order Type & Source */}
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            {order.order_type === 'Delivery' ? (
                                <Truck className="w-4 h-4 text-[var(--accent-500)]" />
                            ) : (
                                <MapPin className="w-4 h-4 text-[var(--accent-500)]" />
                            )}
                            <span className="font-medium">{order.order_type}</span>
                        </div>

                        <div className="flex items-center gap-2 px-2 py-0.5 bg-[var(--bg-tertiary)] rounded text-xs font-medium border border-[var(--border-primary)]">
                            {order.source === 'VAPI' ? (
                                <>
                                    <Phone className="w-3 h-3 text-blue-400" />
                                    <span className="text-[var(--text-secondary)]">Voice Order</span>
                                </>
                            ) : (
                                <>
                                    <FileText className="w-3 h-3 text-orange-400" />
                                    <span className="text-[var(--text-secondary)]">Online Order</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2 mb-4">
                        <h4 className="font-semibold text-sm text-[var(--text-tertiary)]">ORDER ITEMS</h4>
                        {order.order_items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-[var(--bg-tertiary)] rounded">
                                <div className="flex-1">
                                    <span className="font-medium">{item.name}</span>
                                    <span className="text-[var(--text-tertiary)] ml-2">x{item.quantity}</span>
                                </div>
                                <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Special Instructions */}
                    {order.special_instructions && (
                        <div className="p-3 bg-[var(--bg-tertiary)] rounded-lg mb-4">
                            <div className="flex items-start gap-2">
                                <FileText className="w-4 h-4 text-[var(--accent-500)] mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Special Instructions</h4>
                                    <p className="text-sm text-[var(--text-secondary)]">{order.special_instructions}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Timestamp */}
                    <div className="text-sm text-[var(--text-tertiary)]">
                        Ordered: {format(new Date(order.created_at), 'MMM dd, yyyy - hh:mm a')}
                        {order.completed_at && (
                            <> • Completed: {format(new Date(order.completed_at), 'MMM dd, yyyy - hh:mm a')}</>
                        )}
                    </div>
                </div>

                {/* Right Section - Total & Actions */}
                <div className="lg:w-48 flex flex-col justify-between">
                    <div className="text-center lg:text-right mb-4">
                        <p className="text-sm text-[var(--text-tertiary)] mb-1">Total Amount</p>
                        <p className="text-3xl font-bold gradient-text">
                            ${order.total_amount.toFixed(2)}
                        </p>
                    </div>

                    {isPending && (
                        <button
                            onClick={handleComplete}
                            disabled={isUpdating}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            <CheckCircle className="w-5 h-5" />
                            {isUpdating ? 'Completing...' : 'Mark Complete'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
