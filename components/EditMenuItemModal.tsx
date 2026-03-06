'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createMenuItem, updateMenuItem } from '@/lib/supabase';
import { MenuItem } from '@/types';

interface EditMenuItemModalProps {
    item?: MenuItem; // If item is provided, we're editing
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditMenuItemModal({ item, onClose, onSuccess }: EditMenuItemModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Food' as 'Food' | 'Beverage' | 'Dessert' | 'Appetizer',
        available: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name,
                description: item.description,
                price: item.price.toString(),
                category: item.category,
                available: item.available,
            });
        }
    }, [item]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            const menuData = {
                ...formData,
                price: parseFloat(formData.price),
            };

            if (item) {
                await updateMenuItem(item.id, menuData);
            } else {
                await createMenuItem(menuData);
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving menu item:', error);
            alert('Failed to save menu item. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-3xl p-1 shadow-2xl w-full max-w-md mx-4 animate-scale-in border border-[var(--border-primary)]">
                <div className="bg-white rounded-[1.4rem] overflow-hidden">
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-[var(--border-primary)]">
                        <div>
                            <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">
                                {item ? 'Product Tuning' : 'Asset Registration'}
                            </h2>
                            <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-1">
                                {item ? 'Adjusting existing catalog entry' : 'New culinary asset entry'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-[var(--bg-tertiary)] rounded-xl transition-all border border-transparent hover:border-[var(--border-primary)]"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Name */}
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Item Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-[var(--bg-primary)] border border-[var(--border-secondary)] rounded-2xl px-6 py-4 text-sm font-bold placeholder:text-[var(--text-tertiary)] outline-none focus:bg-white focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-50)] transition-all"
                                placeholder="e.g., Smoky Jollof Special"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Detailed Specification</label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-[var(--bg-primary)] border border-[var(--border-secondary)] rounded-2xl px-6 py-4 text-sm font-bold placeholder:text-[var(--text-tertiary)] outline-none focus:bg-white focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-50)] transition-all resize-none"
                                rows={3}
                                placeholder="Describe the ingredients and style..."
                            />
                        </div>

                        {/* Price and Category */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Liquidity (Price)</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-[var(--text-tertiary)]">$</span>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-secondary)] rounded-2xl pl-10 pr-6 py-4 text-sm font-bold placeholder:text-[var(--text-tertiary)] outline-none focus:bg-white focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-50)] transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Classification</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-secondary)] rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:bg-white focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-50)] transition-all appearance-none"
                                >
                                    <option value="Food">Food</option>
                                    <option value="Beverage">Beverage</option>
                                    <option value="Dessert">Dessert</option>
                                    <option value="Appetizer">Appetizer</option>
                                </select>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-4 border border-[var(--border-primary)] text-[var(--text-secondary)] text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-[var(--bg-tertiary)] transition-all"
                                disabled={isSubmitting}
                            >
                                Revert
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-6 py-4 bg-[var(--text-primary)] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-black transition-all disabled:opacity-50 active:scale-95"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Syncing...' : item ? 'Update Asset' : 'Register Asset'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
