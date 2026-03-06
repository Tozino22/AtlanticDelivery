'use client';

import Link from 'next/link';
import { ChefHat, Phone, ShoppingBag, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="p-2 bg-orange-50 rounded-lg group-hover:scale-110 transition-transform">
                            <ChefHat className="w-8 h-8 text-orange-500" />
                        </div>
                        <div>
                            <span className="font-['Outfit'] text-2xl font-bold text-gray-900 block leading-none">
                                Moe's Kitchen
                            </span>
                            <span className="text-xs text-gray-500 font-medium tracking-widest uppercase">
                                and More
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <NavLink href="/">Home</NavLink>
                        <NavLink href="/menu">Menu</NavLink>
                        <NavLink href="/about">About Us</NavLink>
                        <NavLink href="/reservations">Reservations</NavLink>
                        <NavLink href="/voice-order">Voice Order</NavLink>

                        <Link
                            href="/order-online"
                            className="btn-primary flex items-center gap-2 !py-2.5 !px-6 shadow-orange-200"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Order Online
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute w-full animate-slide-up">
                    <div className="px-4 pt-2 pb-6 space-y-1">
                        <MobileNavLink href="/" onClick={() => setIsOpen(false)}>Home</MobileNavLink>
                        <MobileNavLink href="/menu" onClick={() => setIsOpen(false)}>Menu</MobileNavLink>
                        <MobileNavLink href="/about" onClick={() => setIsOpen(false)}>About Us</MobileNavLink>
                        <MobileNavLink href="/reservations" onClick={() => setIsOpen(false)}>Reservations</MobileNavLink>
                        <MobileNavLink href="/voice-order" onClick={() => setIsOpen(false)}>Voice Order</MobileNavLink>
                        <div className="pt-4">
                            <Link
                                href="/order-online"
                                onClick={() => setIsOpen(false)}
                                className="btn-primary w-full justify-center flex items-center gap-2"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                Order Online
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="text-gray-600 font-medium hover:text-orange-500 transition-colors relative group"
        >
            {children}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
        </Link>
    );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="block px-3 py-3 text-base font-medium text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
        >
            {children}
        </Link>
    );
}

