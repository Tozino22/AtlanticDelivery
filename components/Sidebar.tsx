'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    UtensilsCrossed,
    Phone,
    Database,
    BarChart3,
    CreditCard,
    PhoneCall,
    X
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Menu', href: '/dashboard/menu', icon: UtensilsCrossed },
    { name: 'Orders', href: '/dashboard/orders', icon: Phone },
    { name: 'Data Sources', href: '/dashboard/data', icon: Database },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
];

interface SidebarProps {
    isOpen?: boolean;
    setIsOpen?: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={`
                fixed left-0 top-0 h-screen w-60 bg-white border-r border-[var(--border-primary)] z-50
                transition-transform duration-300 lg:translate-x-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}
        >
            <div className="flex flex-col h-full">
                {/* Premium Banking Logo Area */}
                <div className="px-6 py-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-[var(--text-primary)] flex items-center gap-2">
                            <span className="w-8 h-8 bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-700)] rounded-lg flex items-center justify-center text-white text-xs shadow-lg shadow-blue-500/20">AI</span>
                            RECEPTIONIST
                        </h1>
                        <div className="h-0.5 w-12 bg-[var(--accent-500)] mt-1 rounded-full opacity-60" />
                    </div>
                    {setIsOpen && (
                        <button
                            onClick={() => setIsOpen(false)}
                            className="lg:hidden p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4 text-[var(--text-secondary)]" />
                        </button>
                    )}
                </div>

                {/* Banking Grade Navigation */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen?.(false)}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold
                                    transition-all duration-300 group
                                    ${isActive
                                        ? 'bg-[var(--primary-50)] text-[var(--primary-600)] shadow-sm'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--primary-500)]'
                                    }
                                `}
                            >
                                <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-white shadow-sm' : 'group-hover:bg-white'}`}>
                                    <Icon
                                        className={`w-4 h-4 ${isActive ? 'text-[var(--primary-600)]' : 'text-[var(--text-tertiary)] group-hover:text-[var(--primary-500)]'}`}
                                    />
                                </div>
                                <span className="tracking-tight">{item.name}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--primary-500)] shadow-[0_0_8px_var(--primary-500)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Minimal Banking Footer */}
                <div className="p-6 border-t border-[var(--border-secondary)] bg-[var(--bg-primary)]/50">
                    <div className="flex items-center gap-3 px-3 py-2 bg-white rounded-xl shadow-sm border border-[var(--border-primary)]">
                        <div className="relative">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
                        </div>
                        <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">
                            Server <span className="text-emerald-500">Secure</span>
                        </span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
