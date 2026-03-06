import { ChefHat, Facebook, Instagram, Twitter, MapPin, Phone, Mail, Clock } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-orange-500/20 rounded-lg">
                                <ChefHat className="w-8 h-8 text-orange-400" />
                            </div>
                            <div>
                                <span className="font-['Outfit'] text-2xl font-bold block leading-none">
                                    Moe's Kitchen
                                </span>
                            </div>
                        </div>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Experience the authentic flavors of Africa. From smoky Jollof to specialized authentic soups, we bring tradition to your plate.
                        </p>
                        <div className="flex gap-4">
                            <SocialIcon icon={Instagram} />
                            <SocialIcon icon={Twitter} />
                            <SocialIcon icon={Facebook} />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-['Outfit'] text-lg font-bold mb-6 text-orange-50">Quick Links</h3>
                        <ul className="space-y-4">
                            <li><FooterLink href="/">Home</FooterLink></li>
                            <li><FooterLink href="/menu">Our Menu</FooterLink></li>
                            <li><FooterLink href="/reservations">Reservations</FooterLink></li>
                            <li><FooterLink href="/about">About Us</FooterLink></li>
                            <li><FooterLink href="/contact">Contact</FooterLink></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-['Outfit'] text-lg font-bold mb-6 text-orange-50">Contact Us</h3>
                        <ul className="space-y-4 text-gray-400">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-1" />
                                <span>123 Culinary Avenue,<br />Food District, NY 10001</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-orange-500 shrink-0" />
                                <span>(555) 123-4567</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-orange-500 shrink-0" />
                                <span>hello@moeskitchen.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Opening Hours */}
                    <div>
                        <h3 className="font-['Outfit'] text-lg font-bold mb-6 text-orange-50">Opening Hours</h3>
                        <ul className="space-y-4 text-gray-400">
                            <li className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-orange-500" />
                                <div className="flex-1 border-b border-gray-800 pb-2 flex justify-between">
                                    <span>Mon - Fri</span>
                                    <span>11 AM - 10 PM</span>
                                </div>
                            </li>
                            <li className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-orange-500" />
                                <div className="flex-1 border-b border-gray-800 pb-2 flex justify-between">
                                    <span>Sat - Sun</span>
                                    <span>10 AM - 11 PM</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Moe's Kitchen. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="/dashboard" className="hover:text-orange-400 transition-colors">Staff Portal</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialIcon({ icon: Icon }: { icon: any }) {
    return (
        <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-orange-500 hover:text-white transition-all duration-300">
            <Icon className="w-5 h-5" />
        </a>
    );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link href={href} className="text-gray-400 hover:text-orange-400 transition-colors flex items-center gap-2 group">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
            {children}
        </Link>
    );
}

