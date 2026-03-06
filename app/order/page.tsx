'use client';

import { useState, useEffect, Suspense } from 'react';
import { createOrder } from '@/app/actions/orders';
import { restaurants, menuItems, MenuItemLocal } from '@/lib/restaurants';
import { ShoppingBag, Plus, Minus, CheckCircle, Loader2, ChevronLeft, Mic, Search, Store } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function OrderPageInner() {
    const searchParams = useSearchParams();
    const restaurantParam = searchParams.get('restaurant');

    const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(restaurantParam);
    const [cart, setCart] = useState<{ item: MenuItemLocal; quantity: number }[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState<'menu' | 'checkout' | 'success'>('menu');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [search, setSearch] = useState('');

    const selectedRestaurant = restaurants.find(r => r.id === selectedRestaurantId) || null;

    const visibleItems = menuItems.filter(item => {
        const matchesRestaurant = selectedRestaurantId ? item.restaurantId === selectedRestaurantId : true;
        const matchesSearch = search
            ? item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.restaurantName.toLowerCase().includes(search.toLowerCase())
            : true;
        return matchesRestaurant && matchesSearch && item.available;
    });

    function addToCart(item: MenuItemLocal) {
        setCart(curr => {
            const existing = curr.find(i => i.item.id === item.id);
            if (existing) return curr.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            return [...curr, { item, quantity: 1 }];
        });
    }

    function removeFromCart(itemId: string) {
        setCart(curr => {
            const existing = curr.find(i => i.item.id === itemId);
            if (existing && existing.quantity > 1) return curr.map(i => i.item.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
            return curr.filter(i => i.item.id !== itemId);
        });
    }

    const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
    const total = cart.reduce((sum, i) => sum + i.item.price * i.quantity, 0);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createOrder({
                customer_name: customerName,
                customer_phone: customerPhone,
                order_items: cart.map(i => ({
                    id: i.item.id,
                    name: i.item.name,
                    quantity: i.quantity,
                    price: i.item.price,
                    restaurant: i.item.restaurantName,
                })),
                order_type: 'Pickup',
                total_amount: total,
                status: 'pending',
                source: `online_${selectedRestaurantId || 'all'}`,
            });
            setStep('success');
            setCart([]);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between gap-4">
                <Link href="/" className="flex items-center gap-1.5 text-blue-600 font-black text-lg">
                    <ChevronLeft className="w-5 h-5" />
                    <span>AtlanticDelivery</span>
                </Link>
                <Link
                    href="/voice-order"
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors"
                >
                    <Mic className="w-3.5 h-3.5" /> Voice
                </Link>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">
                {step === 'menu' && (
                    <>
                        {/* Restaurant Filter Tabs */}
                        <div className="mb-5">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Filter by Restaurant</p>
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => setSelectedRestaurantId(null)}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${!selectedRestaurantId
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                                        }`}
                                >
                                    <Store className="w-3.5 h-3.5" /> All Restaurants
                                </button>
                                {restaurants.map(r => (
                                    <button
                                        key={r.id}
                                        onClick={() => setSelectedRestaurantId(r.id)}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${selectedRestaurantId === r.id
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                                            }`}
                                    >
                                        {r.emoji} {r.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Selected restaurant info */}
                        {selectedRestaurant && (
                            <div
                                className="rounded-2xl p-4 text-white mb-5 flex items-center gap-3"
                                style={{ background: selectedRestaurant.gradient }}
                            >
                                <span className="text-4xl">{selectedRestaurant.emoji}</span>
                                <div>
                                    <h2 className="font-black text-lg leading-tight">{selectedRestaurant.name}</h2>
                                    <p className="text-white/80 text-xs">{selectedRestaurant.tagline}</p>
                                </div>
                            </div>
                        )}

                        {/* Search */}
                        <div className="relative mb-5">
                            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder={`Search ${selectedRestaurant ? selectedRestaurant.name : 'all restaurants'}...`}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        {/* Menu Items */}
                        <div className="space-y-3 pb-32">
                            {visibleItems.length === 0 ? (
                                <p className="text-center text-gray-400 py-12">No items found.</p>
                            ) : (
                                visibleItems.map(item => {
                                    const inCart = cart.find(i => i.item.id === item.id);
                                    const restaurant = restaurants.find(r => r.id === item.restaurantId);
                                    return (
                                        <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm flex gap-4 p-4 hover:shadow-md transition-all">
                                            {item.image_url && (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="w-20 h-20 object-cover rounded-xl flex-shrink-0 bg-gray-100"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-0.5">
                                                    <h3 className="font-bold text-gray-900 text-base">{item.name}</h3>
                                                    <span className="font-black text-blue-600 whitespace-nowrap">${item.price.toFixed(2)}</span>
                                                </div>
                                                {/* Restaurant badge — shown when viewing all */}
                                                {!selectedRestaurantId && restaurant && (
                                                    <span
                                                        className="inline-block text-[10px] font-black uppercase tracking-wide text-white px-2 py-0.5 rounded-md mb-1"
                                                        style={{ background: restaurant.gradient }}
                                                    >
                                                        {item.restaurantName}
                                                    </span>
                                                )}
                                                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{item.description}</p>
                                                <div className="flex justify-end">
                                                    {inCart ? (
                                                        <div className="flex items-center gap-3 bg-blue-50 px-3 py-1.5 rounded-xl">
                                                            <button onClick={() => removeFromCart(item.id)} className="text-blue-700 hover:bg-blue-200 rounded-lg p-0.5 transition-colors">
                                                                <Minus className="w-4 h-4" />
                                                            </button>
                                                            <span className="font-bold text-blue-900 w-5 text-center text-sm">{inCart.quantity}</span>
                                                            <button onClick={() => addToCart(item)} className="text-blue-700 hover:bg-blue-200 rounded-lg p-0.5 transition-colors">
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => addToCart(item)}
                                                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors"
                                                        >
                                                            <Plus className="w-4 h-4" /> Add
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Floating Cart */}
                        {cartCount > 0 && (
                            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-50">
                                <button
                                    onClick={() => setStep('checkout')}
                                    className="w-full bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-between hover:bg-gray-800 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-black">
                                            {cartCount}
                                        </div>
                                        <span className="font-bold">View Order</span>
                                    </div>
                                    <span className="font-black text-lg">${total.toFixed(2)}</span>
                                </button>
                            </div>
                        )}
                    </>
                )}

                {step === 'checkout' && (
                    <div>
                        <button onClick={() => setStep('menu')} className="flex items-center gap-1 text-gray-500 hover:text-gray-900 mb-6 font-medium text-sm">
                            <ChevronLeft className="w-4 h-4" /> Back to Menu
                        </button>

                        <h2 className="text-2xl font-black text-gray-900 mb-6">Your Order</h2>

                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                            <div className="p-5 border-b border-gray-100 bg-gray-50">
                                <div className="space-y-3">
                                    {cart.map(({ item, quantity }) => (
                                        <div key={item.id} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-3">
                                                <span className="bg-white border border-gray-200 px-2 py-0.5 rounded text-xs font-bold text-gray-600">{quantity}x</span>
                                                <div>
                                                    <p className="text-gray-800 font-medium">{item.name}</p>
                                                    <p className="text-xs text-gray-400">{item.restaurantName}</p>
                                                </div>
                                            </div>
                                            <span className="font-semibold text-gray-900">${(item.price * quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                    <div className="border-t border-gray-200 pt-3 flex justify-between font-black text-base">
                                        <span>Total</span>
                                        <span className="text-blue-600">${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={customerName}
                                        onChange={e => setCustomerName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                                    <input
                                        required
                                        type="tel"
                                        value={customerPhone}
                                        onChange={e => setCustomerPhone(e.target.value)}
                                        placeholder="(555) 123-4567"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 text-base"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Order'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {step === 'success' && (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-3">Order Received!</h2>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                            Thanks {customerName}! The restaurant has your order and will have it ready soon.
                        </p>
                        <div className="flex justify-center gap-3">
                            <Link href="/" className="px-6 py-3 border border-gray-200 bg-white text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors">
                                Home
                            </Link>
                            <button
                                onClick={() => { setStep('menu'); setCustomerName(''); setCustomerPhone(''); }}
                                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                            >
                                Order Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function OrderPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
            <OrderPageInner />
        </Suspense>
    );
}
