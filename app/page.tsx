'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star, Clock, Search, ChevronRight, Mic, ShoppingBag,
  Zap, MapPin, ArrowRight, Sparkles, CheckCircle
} from 'lucide-react';
import { restaurants, menuItems } from '@/lib/restaurants';

const PERKS = [
  { icon: Zap, label: 'Lightning Fast', desc: 'Orders ready in 30 min or less' },
  { icon: Star, label: 'Top Rated', desc: 'Only 4.5★+ restaurants' },
  { icon: Mic, label: 'Voice Ordering', desc: 'Hands-free AI ordering' },
  { icon: CheckCircle, label: 'Easy Checkout', desc: 'One-tap, zero hassle' },
];

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const lowerSearch = search.toLowerCase();
  const matchedRestaurants = search
    ? restaurants.filter(r =>
      r.name.toLowerCase().includes(lowerSearch) ||
      r.category.toLowerCase().includes(lowerSearch))
    : restaurants;

  const matchedItems = search
    ? menuItems.filter(item =>
      item.name.toLowerCase().includes(lowerSearch) ||
      item.restaurantName.toLowerCase().includes(lowerSearch) ||
      item.description.toLowerCase().includes(lowerSearch))
    : [];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-5 py-3.5 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#2563eb] rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight">
            Atlantic<span className="text-[#2563eb]">Delivery</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/voice-order"
            className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-[#2563eb] transition-colors px-3 py-2 rounded-xl hover:bg-blue-50"
          >
            <Mic className="w-4 h-4" /> Voice Order
          </Link>
          <Link href="/order" className="btn-brand px-5 py-2.5 text-sm flex items-center gap-1.5">
            Order Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-24 pb-20 px-5 overflow-hidden bg-gradient-to-br from-white via-[#eff6ff] to-[#dbeafe]">
        {/* Animated blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-[440px] h-[440px] bg-blue-200 rounded-full mix-blend-multiply opacity-30 animate-blob" />
        <div className="pointer-events-none absolute top-40 -left-20 w-[320px] h-[320px] bg-slate-200 rounded-full mix-blend-multiply opacity-30 animate-blob" style={{ animationDelay: '3s' }} />
        <div className="pointer-events-none absolute -bottom-10 right-1/3 w-[260px] h-[260px] bg-indigo-100 rounded-full mix-blend-multiply opacity-40 animate-blob" style={{ animationDelay: '5s' }} />

        {/* Decorative spinning ring */}
        <div className="pointer-events-none absolute top-12 right-12 w-48 h-48 rounded-full border-2 border-dashed border-blue-200 animate-spin-slow opacity-50" />

        <div className="relative max-w-2xl mx-auto text-center">
          {/* Live badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-xs font-black uppercase tracking-wider mb-7 ${mounted ? 'animate-fade-up' : 'opacity-0'}`}>
            <span className="w-2 h-2 bg-[#2563eb] rounded-full animate-pulse" />
            🚀 Now live in your city
          </div>

          <h1 className={`text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] mb-6 tracking-tight ${mounted ? 'animate-fade-up-d1' : 'opacity-0'}`}>
            Craving something<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563eb] to-[#6366f1]">
              delicious?
            </span>
          </h1>

          <p className={`text-lg md:text-xl text-slate-500 max-w-lg mx-auto mb-10 leading-relaxed ${mounted ? 'animate-fade-up-d2' : 'opacity-0'}`}>
            Order from the best local restaurants — by tap or by voice.
            Fast, fresh, and always delivered with care.
          </p>

          {/* Search */}
          <div className={`relative max-w-xl mx-auto mb-8 ${mounted ? 'animate-fade-up-d3' : 'opacity-0'}`}>
            <Search className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search restaurants or dishes..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 bg-white shadow-lg shadow-blue-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2563eb] text-base transition-all"
            />
          </div>

          {/* CTAs */}
          <div className={`flex flex-col sm:flex-row gap-3 justify-center ${mounted ? 'animate-fade-up-d4' : 'opacity-0'}`}>
            <Link href="/order" className="btn-brand px-8 py-4 text-lg flex items-center justify-center gap-2">
              <ShoppingBag className="w-5 h-5" /> Browse & Order
            </Link>
            <Link href="/voice-order" className="btn-ghost px-8 py-4 text-lg flex items-center justify-center gap-2">
              <Mic className="w-5 h-5 text-[#2563eb]" /> Order by Voice
            </Link>
          </div>
        </div>
      </section>

      {/* ── SEARCH RESULTS ── */}
      {search && (
        <section className="max-w-2xl mx-auto px-5 py-6 animate-scale-in">
          {matchedItems.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#2563eb]" /> Matching Dishes
              </p>
              <div className="space-y-3">
                {matchedItems.map(item => (
                  <Link key={item.id} href={`/order?restaurant=${item.restaurantId}`} className="card flex items-center gap-4 p-4 group">
                    <img src={item.image_url || '/images/jollof.png'} alt={item.name} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-xs text-[#2563eb] font-semibold">{item.restaurantName}</p>
                      <p className="text-xs text-slate-400 truncate">{item.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-black text-[#2563eb] text-lg">${item.price.toFixed(2)}</p>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#2563eb] transition-colors ml-auto mt-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {matchedRestaurants.length === 0 && matchedItems.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No results for "{search}"</p>
            </div>
          )}
        </section>
      )}

      {/* ── RESTAURANT CARDS ── */}
      {(!search || matchedRestaurants.length > 0) && (
        <section className="max-w-2xl mx-auto px-5 py-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                {search ? 'Matching' : 'Featured'} Restaurants
              </p>
              <h2 className="text-2xl font-black text-slate-900">
                {search ? `Results for "${search}"` : 'Order from the best'}
              </h2>
            </div>
            <Link href="/order" className="text-sm font-bold text-[#2563eb] hover:text-[#1d4ed8] flex items-center gap-1 transition-colors">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-5">
            {(search ? matchedRestaurants : restaurants).map((restaurant, i) => {
              const items = menuItems.filter(m => m.restaurantId === restaurant.id);
              return (
                <Link key={restaurant.id} href={`/order?restaurant=${restaurant.id}`} className="block group">
                  <div className="card overflow-hidden">
                    {/* Banner — inline gradient avoids Tailwind purge of dynamic classes */}
                    <div
                      className="relative h-40 overflow-hidden flex items-end p-5"
                      style={{ background: restaurant.gradient }}
                    >
                      {/* Decorative circles */}
                      <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
                      <div className="absolute top-6 right-10 w-16 h-16 rounded-full bg-white/10" />
                      <div className="absolute -bottom-4 left-1/2 w-24 h-24 rounded-full bg-white/5" />

                      {/* Floating food image */}
                      {items[0]?.image_url && (
                        <img
                          src={items[0].image_url}
                          alt={restaurant.name}
                          className="absolute right-5 top-3 w-28 h-28 object-cover rounded-2xl shadow-2xl border-2 border-white/20 group-hover:scale-105 transition-transform duration-500 animate-float"
                        />
                      )}

                      {/* Text */}
                      <div className="relative z-10">
                        <span className="text-4xl mb-1 block drop-shadow">{restaurant.emoji}</span>
                        <h3 className="text-white text-xl font-black leading-tight drop-shadow-md">
                          {restaurant.name}
                        </h3>
                        <p className="text-xs font-semibold mt-0.5 drop-shadow" style={{ color: restaurant.accent }}>
                          {restaurant.category}
                        </p>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-5">
                      <p className="text-slate-500 text-sm mb-3">{restaurant.tagline}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                            <span className="text-sm font-black text-slate-900">{restaurant.rating}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs font-semibold">{restaurant.deliveryTime}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="text-xs font-semibold">0.8 mi</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#2563eb] bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl group-hover:bg-[#2563eb] group-hover:text-white transition-all">
                          Order →
                        </span>
                      </div>
                      {/* Menu pills */}
                      <div className="flex gap-2 mt-4 flex-wrap">
                        {items.map(item => (
                          <span key={item.id} className="pill bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition-colors cursor-pointer">
                            {item.name} · ${item.price.toFixed(2)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── PERKS STRIP ── */}
      <section className="bg-slate-50 border-y border-slate-100 px-5 py-12">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-black text-slate-400 uppercase tracking-widest mb-8">
            Why AtlanticDelivery?
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {PERKS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="text-center group">
                <div className="w-14 h-14 bg-white text-[#2563eb] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-100 border border-slate-100 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <p className="font-black text-slate-800 text-sm">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VOICE CTA ── */}
      <section className="px-5 py-14">
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] rounded-3xl p-8 text-white overflow-hidden text-center">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border-2 border-white/20 animate-spin-slow" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute top-6 right-24 w-10 h-10 rounded-full bg-white/10" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Mic className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black mb-2">Try Voice Ordering</h2>
              <p className="text-blue-200 mb-6 text-sm leading-relaxed">
                Just say what you want — our AI will pick it up,<br />
                match it to the menu, and place your order instantly.
              </p>
              <Link
                href="/voice-order"
                className="inline-flex items-center gap-2 bg-white text-[#1d4ed8] font-black px-7 py-3.5 rounded-2xl hover:bg-blue-50 transition-colors shadow-xl shadow-blue-900/30"
              >
                <Mic className="w-5 h-5" /> Start Voice Order
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-100 py-8 px-5 text-center bg-white">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 bg-[#2563eb] rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-black text-slate-800">Atlantic<span className="text-[#2563eb]">Delivery</span></span>
        </div>
        <p className="text-xs text-slate-400">© 2026 AtlanticDelivery · Fast, fresh, and local.</p>
      </footer>
    </div>
  );
}
