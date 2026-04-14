'use client';

import Link from 'next/link';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';

export default function OrderSuccessPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center animate-scale-in">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10" />
                </div>
                
                <h1 className="text-3xl font-black text-slate-900 mb-2">Payment Confirmed!</h1>
                <p className="text-slate-500 mb-8">
                    Thank you for your order. We've received your payment and the restaurant is starting on your delicious meal right now.
                </p>

                <div className="space-y-3">
                    <Link 
                        href="/" 
                        className="flex items-center justify-center gap-2 w-full bg-[#2563eb] text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                    >
                        <ShoppingBag className="w-5 h-5" /> Back to Home
                    </Link>
                    <Link 
                        href="/order" 
                        className="flex items-center justify-center gap-2 w-full bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-colors"
                    >
                        View Order Status <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
