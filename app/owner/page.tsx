'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { getPhoneOrders, updateOrderStatus } from '@/lib/supabase';
import { restaurants } from '@/lib/restaurants';
import {
    CheckCircle, XCircle, RefreshCw, ShoppingBag,
    ChevronDown, ChevronUp, Loader2, Bell, TrendingUp,
    Clock, Link2, Copy, Check, LayoutGrid
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';

type Order = {
    id: string;
    customer_name: string;
    customer_phone: string;
    order_items: any;
    total_amount: number;
    status: string;
    source: string;
    created_at: string;
};

// ── Helper: does an order belong to a restaurant? ────────────────
function orderBelongsTo(order: Order, restaurantId: string): boolean {
    if (!order.source) return false;
    return order.source.toLowerCase().includes(restaurantId.toLowerCase());
}

// ── Copy-link pill ────────────────────────────────────────────────
function CopyLink({ url }: { url: string }) {
    const [copied, setCopied] = useState(false);
    function copy() {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    }
    return (
        <button
            onClick={copy}
            className="flex items-center gap-2 text-xs font-bold px-3 py-2 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-slate-600 hover:text-blue-700 max-w-full"
            title={url}
        >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> : <Copy className="w-3.5 h-3.5 flex-shrink-0" />}
            <span className="truncate">{copied ? 'Copied!' : url}</span>
        </button>
    );
}

// ── Status badge colours ──────────────────────────────────────────
const statusBadge: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    completed: 'bg-blue-100  text-blue-700  border-blue-200',
    cancelled: 'bg-red-100   text-red-600   border-red-200',
};

// ── Main dashboard content ────────────────────────────────────────
function DashboardContent() {
    const searchParams = useSearchParams();
    const restaurantParam = searchParams.get('restaurant'); // e.g. "moes-kitchen"

    const restaurant = restaurantParam
        ? restaurants.find(r => r.id === restaurantParam)
        : null;

    const isAdmin = !restaurantParam; // no param = platform admin view

    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('pending');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const load = useCallback(async (silent = false) => {
        if (!silent) setLoading(true); else setRefreshing(true);
        try { const data = await getPhoneOrders(); setAllOrders(data as Order[]); }
        finally { setLoading(false); setRefreshing(false); }
    }, []);

    useEffect(() => {
        load();
        const interval = setInterval(() => load(true), 30000);
        return () => clearInterval(interval);
    }, [load]);

    async function handleStatus(id: string, status: string) {
        setUpdatingId(id);
        try { await updateOrderStatus(id, status); await load(true); }
        finally { setUpdatingId(null); }
    }

    // Filter orders to this restaurant's orders (or all for admin)
    const myOrders = isAdmin
        ? allOrders
        : allOrders.filter(o => orderBelongsTo(o, restaurantParam!));

    const filtered = myOrders.filter(o => filter === 'all' || o.status === filter);
    const pendingCount = myOrders.filter(o => o.status === 'pending').length;
    const totalRevenue = myOrders.filter(o => o.status === 'completed')
        .reduce((s, o) => s + Number(o.total_amount), 0);

    // Generate owner links for admin panel
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

    // If a restaurant param is given but doesn't match any known restaurant
    if (restaurantParam && !restaurant) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mb-2">Restaurant not found</h2>
                    <p className="text-slate-400 text-sm">Check your dashboard link and try again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc]">

            {/* ── Header ── */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Icon: restaurant-coloured or default blue */}
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md text-white text-lg flex-shrink-0"
                            style={{ background: restaurant?.gradient ?? 'linear-gradient(135deg,#1d4ed8,#1e3a8a)' }}
                        >
                            {restaurant ? restaurant.emoji : <LayoutGrid className="w-5 h-5" />}
                        </div>
                        <div>
                            <h1 className="text-base font-black text-slate-900 leading-none">
                                {restaurant ? `${restaurant.name}` : 'Admin Dashboard'}
                            </h1>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {restaurant ? 'AtlanticDelivery · Order Inbox' : 'AtlanticDelivery · All Restaurants'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {pendingCount > 0 && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl">
                                <Bell className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                                <span className="text-xs font-black text-red-600">{pendingCount} New</span>
                            </div>
                        )}
                        <button
                            onClick={() => load(true)}
                            disabled={refreshing}
                            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#2563eb]' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6">

                {/* ── Admin: restaurant links panel ── */}
                {isAdmin && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Link2 className="w-4 h-4 text-[#2563eb]" />
                            <h2 className="font-black text-slate-900 text-sm">Restaurant Owner Links</h2>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">Share each private link with the restaurant owner. They will only see their own orders.</p>
                        <div className="space-y-3">
                            {restaurants.map(r => (
                                <div key={r.id} className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                                        style={{ background: r.gradient }}
                                    >
                                        {r.emoji}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-700 mb-1">{r.name}</p>
                                        <CopyLink url={`${baseUrl}/owner?restaurant=${r.id}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Stats ── */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm hover:shadow-md transition-all">
                        <div className="w-9 h-9 bg-blue-50 text-[#2563eb] rounded-xl flex items-center justify-center mx-auto mb-2">
                            <ShoppingBag className="w-4 h-4" />
                        </div>
                        <p className="text-2xl font-black text-[#2563eb]">{myOrders.length}</p>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">Total Orders</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm hover:shadow-md transition-all">
                        <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                            <Clock className="w-4 h-4" />
                        </div>
                        <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">Pending</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm hover:shadow-md transition-all">
                        <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <p className="text-2xl font-black text-indigo-600">${totalRevenue.toFixed(0)}</p>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">Revenue</p>
                    </div>
                </div>

                {/* ── Filter Tabs ── */}
                <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl mb-6">
                    {(['pending', 'all', 'completed', 'cancelled'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wide rounded-xl transition-all ${filter === tab
                                    ? 'bg-white text-[#2563eb] shadow-sm'
                                    : 'text-slate-400 hover:text-slate-700'
                                }`}
                        >
                            {tab}{tab === 'pending' && pendingCount > 0 ? ` (${pendingCount})` : ''}
                        </button>
                    ))}
                </div>

                {/* ── Orders ── */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
                        <p className="text-sm text-slate-400 font-medium">Loading orders...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-semibold">No {filter === 'all' ? '' : filter} orders yet.</p>
                        <p className="text-slate-400 text-sm mt-1">
                            {filter === 'pending'
                                ? 'New orders will appear here in real-time.'
                                : 'Try switching to a different filter above.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 animate-fade-in">
                        {filtered.map(order => {
                            const items = typeof order.order_items === 'string'
                                ? JSON.parse(order.order_items)
                                : order.order_items || [];
                            const isExpanded = expandedId === order.id;
                            const isUpdating = updatingId === order.id;
                            const time = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                            // Identify which restaurant this order belongs to (for admin view)
                            const fromRestaurant = isAdmin
                                ? restaurants.find(r => order.source?.includes(r.id))
                                : null;

                            return (
                                <div
                                    key={order.id}
                                    className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${order.status === 'pending' ? 'border-amber-200' : 'border-slate-100'
                                        }`}
                                >
                                    {/* Status colour bar */}
                                    {order.status === 'pending' && <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400" />}
                                    {order.status === 'completed' && <div className="h-1 bg-gradient-to-r from-[#2563eb] to-[#6366f1]" />}

                                    {/* Row */}
                                    <div
                                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${order.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                                    order.status === 'completed' ? 'bg-blue-50  text-[#2563eb]' :
                                                        'bg-slate-100 text-slate-400'
                                                }`}>
                                                <ShoppingBag className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-bold text-slate-900 text-sm truncate">{order.customer_name}</p>
                                                    {/* In admin view: show which restaurant */}
                                                    {fromRestaurant && (
                                                        <span
                                                            className="text-[10px] font-black text-white px-2 py-0.5 rounded-md"
                                                            style={{ background: fromRestaurant.gradient }}
                                                        >
                                                            {fromRestaurant.emoji} {fromRestaurant.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-400">{order.customer_phone} · {time}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg border ${statusBadge[order.status] || 'bg-slate-100 text-slate-600'}`}>
                                                {order.status}
                                            </span>
                                            <span className="font-black text-[#2563eb] text-sm">${Number(order.total_amount).toFixed(2)}</span>
                                            {isExpanded
                                                ? <ChevronUp className="w-4 h-4 text-slate-400" />
                                                : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                        </div>
                                    </div>

                                    {/* Expanded detail */}
                                    {isExpanded && (
                                        <div className="border-t border-slate-100 p-4 animate-fade-in">
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Order Items</p>
                                            <div className="space-y-2 mb-4">
                                                {items.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between items-center text-sm bg-slate-50 rounded-xl px-3 py-2">
                                                        <span className="text-slate-700 font-medium">{item.quantity}× {item.name}</span>
                                                        <span className="font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                                <div className="flex justify-between font-black text-sm pt-2 px-3">
                                                    <span>Total</span>
                                                    <span className="text-[#2563eb]">${Number(order.total_amount).toFixed(2)}</span>
                                                </div>
                                            </div>

                                            {order.status === 'pending' && (
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => handleStatus(order.id, 'completed')}
                                                        disabled={isUpdating}
                                                        className="flex-1 py-3 bg-[#2563eb] text-white text-sm font-bold rounded-xl hover:bg-[#1d4ed8] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-md shadow-blue-200"
                                                    >
                                                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                                        Accept & Complete
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatus(order.id, 'cancelled')}
                                                        disabled={isUpdating}
                                                        className="flex-1 py-3 bg-red-50 text-red-600 border border-red-200 text-sm font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                                                    >
                                                        <XCircle className="w-4 h-4" /> Cancel
                                                    </button>
                                                </div>
                                            )}
                                            {order.status === 'completed' && (
                                                <div className="flex items-center gap-2 text-[#2563eb] text-sm font-bold py-2">
                                                    <CheckCircle className="w-4 h-4" /> Order completed ✓
                                                </div>
                                            )}
                                            {order.status === 'cancelled' && (
                                                <div className="flex items-center gap-2 text-red-500 text-sm font-bold py-2">
                                                    <XCircle className="w-4 h-4" /> Order cancelled
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                <p className="text-center text-xs text-slate-400 mt-8">
                    Auto-refreshes every 30 s ·{' '}
                    <button onClick={() => load(true)} className="text-[#2563eb] font-semibold hover:underline">
                        Refresh now
                    </button>
                </p>
            </div>
        </div>
    );
}

export default function OwnerDashboard() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
