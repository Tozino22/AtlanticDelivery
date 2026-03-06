'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { createMenuItem } from '@/lib/supabase';

interface AddMenuItemModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddMenuItemModal({ onClose, onSuccess }: AddMenuItemModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Food' as 'Food' | 'Beverage' | 'Dessert' | 'Appetizer',
        available: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            await createMenuItem({
                ...formData,
                price: parseFloat(formData.price),
            });
            onSuccess();
        } catch (error) {
            console.error('Error creating menu item:', error);
            alert('Failed to create menu item. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="glass-card w-full max-w-md mx-4 animate-scale-in">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-[var(--border-primary)]">
                    <h2 className="text-2xl font-bold">Add Menu Item</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Item Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input-field"
                            placeholder="e.g., Margherita Pizza"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Description *</label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input-field resize-none"
                            rows={3}
                            placeholder="Describe the item..."
                        />
                    </div>

                    {/* Price and Category */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Price *</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="input-field"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Category *</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                className="input-field"
                            >
                                <option value="Food">Food</option>
                                <option value="Beverage">Beverage</option>
                                <option value="Dessert">Dessert</option>
                                <option value="Appetizer">Appetizer</option>
                            </select>
                        </div>
                    </div>

                    {/* Available Toggle */}
                    <div className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-lg">
                        <label className="font-medium">Available Immediately</label>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, available: !formData.available })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.available ? 'bg-green-500' : 'bg-gray-600'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.available ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 btn-secondary"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Adding...' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
