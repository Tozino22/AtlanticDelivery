'use client';

import { useState } from 'react';
import { MenuItem } from '@/types';
import { Edit2, Trash2, Power } from 'lucide-react';
import { updateMenuItem, deleteMenuItem } from '@/lib/supabase';

interface MenuItemCardProps {
    item: MenuItem;
    onUpdate: () => void;
    onEdit: (item: MenuItem) => void;
}

export default function MenuItemCard({ item, onUpdate, onEdit }: MenuItemCardProps) {
    const [isUpdating, setIsUpdating] = useState(false);

    async function toggleAvailability() {
        try {
            setIsUpdating(true);
            await updateMenuItem(item.id, { available: !item.available });
            onUpdate();
        } catch (error) {
            console.error('Error updating availability:', error);
        } finally {
            setIsUpdating(false);
        }
    }

    async function handleDelete() {
        if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

        try {
            await deleteMenuItem(item.id);
            onUpdate();
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    }

    return (
        <div className="bg-white border border-[var(--border-primary)] rounded-[2.5rem] p-6 transition-all hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1 group shadow-sm relative overflow-hidden flex flex-col">
            {/* Inner Gradient Glow */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 blur-[40px] opacity-10 rounded-full bg-[var(--primary-500)] pointer-events-none`} />
            {item.image_url && (
                <div className="h-48 w-full overflow-hidden rounded-[1.8rem] mb-6 relative">
                    <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
            )}

            <div className="mb-6 flex-1">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-black text-[var(--text-primary)] leading-none tracking-tight">{item.name}</h3>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-[var(--primary-50)] text-[var(--primary-700)] uppercase tracking-widest border border-[var(--primary-100)]">
                                {item.category}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${item.available ? 'bg-emerald-500' : 'bg-red-500'} shadow-[0_0_4px_currentColor]`} />
                                <span className="text-[9px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider">{item.available ? 'Active' : 'Offline'}</span>
                            </div>
                        </div>
                        <p className="text-[var(--text-secondary)] text-sm font-medium line-clamp-2 leading-relaxed">
                            {item.description}
                        </p>
                    </div>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[var(--primary-600)] tracking-tighter">${item.price.toFixed(2)}</span>
                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">/ Unit</span>
                </div>
            </div>

            {/* Availability Toggle */}
            <div className="flex items-center justify-between mb-4 p-3 bg-[var(--bg-tertiary)] rounded-lg">
                <span className="text-sm font-medium">Available</span>
                <button
                    onClick={toggleAvailability}
                    disabled={isUpdating}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.available ? 'bg-green-500' : 'bg-gray-600'} ${isUpdating ? 'opacity-50' : ''}`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.available ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                </button>
            </div>

            {/* Status Badge */}
            <div className={`badge mb-4 ${item.available ? 'badge-success' : 'badge-error'}`}>
                <Power className="w-3 h-3 mr-1" />
                {item.available ? 'Available' : 'Unavailable'}
            </div>

            {/* Actions */}
            <div className="flex gap-3 relative z-10">
                <button
                    onClick={() => onEdit(item)}
                    className="flex-1 px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white transition-all flex items-center justify-center gap-2"
                >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                </button>
                <button
                    onClick={handleDelete}
                    className="p-3.5 bg-red-50 border border-red-100 text-red-500 rounded-2xl hover:bg-red-100 transition-all active:scale-95"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
