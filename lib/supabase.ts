import { createClient } from '@supabase/supabase-js';
import { MenuItem } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize Supabase only if keys are present
export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Mock Data Store (In-Memory for session)
// This allows the app to work fully without a real database connection
// Mock Data Store (In-Memory for session + LocalStorage persistence)
let mockMenuItems: MenuItem[] = [
    {
        id: '1',
        name: 'Smoky Jollof Special',
        description: 'Authentic Nigerian Jollof Rice served with fried plantains and grilled chicken.',
        price: 18.99,
        category: 'Food',
        available: true,
        image_url: '/images/jollof.png',
        created_at: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Amala & Egusi Supreme',
        description: 'Smooth Amala swallow served with rich, protein-packed Egusi soup and assorted meats.',
        price: 22.50,
        category: 'Food',
        available: true,
        image_url: '/images/amala.png',
        created_at: new Date().toISOString()
    },
    {
        id: '3',
        name: 'Chapman Cocktail',
        description: 'Refreshing fruity mocktail with cucumber, lemon, and grenadine.',
        price: 8.50,
        category: 'Beverage',
        available: true,
        created_at: new Date().toISOString()
    },
    {
        id: '4',
        name: 'Suya Skewers',
        description: 'Spicy grilled beef skewers with onions and tomatoes.',
        price: 12.99,
        category: 'Appetizer',
        available: true,
        created_at: new Date().toISOString()
    }
];

// Load from LocalStorage if available (Client-side)
if (typeof window !== 'undefined') {
    const savedMenu = localStorage.getItem('mockMenuItems');
    if (savedMenu) mockMenuItems = JSON.parse(savedMenu);
}

function saveMockData() {
    if (typeof window !== 'undefined') {
        localStorage.setItem('mockMenuItems', JSON.stringify(mockMenuItems));
    }
}

// Helper functions for menu items
export async function getMenuItems() {
    if (supabase) {
        const { data, error } = await supabase
            .from('menu_items')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) return data;
    }

    // Fallback to mock data if DB is empty or fails
    if (typeof window !== 'undefined') {
        const savedMenu = localStorage.getItem('mockMenuItems');
        if (savedMenu) mockMenuItems = JSON.parse(savedMenu);
    }
    return [...mockMenuItems];
}

export async function createMenuItem(item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>) {
    if (supabase) {
        const { data, error } = await supabase
            .from('menu_items')
            .insert([item])
            .select()
            .single();

        if (!error) return data;
    }

    // Mock Create
    const newItem: MenuItem = {
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    mockMenuItems.unshift(newItem);
    saveMockData();
    return newItem;
}

export async function updateMenuItem(id: string, updates: Partial<MenuItem>) {
    if (supabase) {
        const { data, error } = await supabase
            .from('menu_items')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (!error) return data;
    }

    // Mock Update
    const index = mockMenuItems.findIndex(i => i.id === id);
    if (index !== -1) {
        mockMenuItems[index] = { ...mockMenuItems[index], ...updates, updated_at: new Date().toISOString() };
        saveMockData();
        return mockMenuItems[index];
    }
    return null;
}

export async function deleteMenuItem(id: string) {
    if (supabase) {
        const { error } = await supabase
            .from('menu_items')
            .delete()
            .eq('id', id);

        if (!error) return;
    }

    // Mock Delete
    mockMenuItems = mockMenuItems.filter(i => i.id !== id);
    saveMockData();
}

// Realtime Subscription Helper
export function subscribeToMenu(callback: () => void) {
    if (!supabase) return () => { };

    const channel = supabase
        .channel('menu_changes')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'menu_items' },
            () => {
                callback();
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

// Phone Orders - Server-side in-memory storage (no localStorage on server!)
// This will reset on server restart, but Supabase will be the primary storage
let mockOrders: any[] = [];

export async function getPhoneOrders() {
    const startTime = Date.now();
    console.log('Fetching orders...');

    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('phone_orders')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50); // Speed up: only get last 50 orders

            if (!error && data) {
                console.log(`Fetched ${data.length} orders from Supabase in ${Date.now() - startTime}ms`);
                return data;
            }
            console.error('Supabase fetch error:', error);
        } catch (e) {
            console.error('Unexpected fetch error:', e);
        }
    }

    // Fallback to in-memory mock
    console.log(`Using in-memory mock orders: ${mockOrders.length} orders (Fallback in ${Date.now() - startTime}ms)`);
    return [...mockOrders];
}

export async function createPhoneOrder(order: any) {
    console.log('Creating phone order:', order);

    if (supabase) {
        const { data, error } = await supabase.from('phone_orders').insert([order]).select().single();
        if (error) {
            console.error('Supabase insert error:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
        } else {
            console.log('Order saved to Supabase:', data);
            return data;
        }
    }

    // Fallback to in-memory mock (server-side only)
    console.log('Using in-memory mock storage for order');
    const newOrder = {
        id: Math.random().toString(36).substr(2, 9),
        ...order,
        created_at: new Date().toISOString(),
        order_items: typeof order.order_items === 'string' ? JSON.parse(order.order_items) : order.order_items
    };
    mockOrders.unshift(newOrder);
    console.log(`Mock order created. Total mock orders: ${mockOrders.length}`);
    return newOrder;
}

export async function updateOrderStatus(id: string, status: string) {
    console.log(`Updating order ${id} to status: ${status}`);

    if (supabase) {
        const updates: any = { status };
        if (status === 'completed') updates.completed_at = new Date().toISOString();
        const { data, error } = await supabase.from('phone_orders').update(updates).eq('id', id).select().single();
        if (!error) {
            console.log('Order updated in Supabase:', data);
            return data;
        }
        console.error('Supabase update error:', error);
    }

    // Fallback: Mock Update (server-side only)
    const index = mockOrders.findIndex(o => o.id === id);
    if (index !== -1) {
        mockOrders[index] = {
            ...mockOrders[index],
            status,
            completed_at: status === 'completed' ? new Date().toISOString() : undefined
        };
        console.log('Order updated in mock storage');
        return mockOrders[index];
    }

    console.log('Order not found in mock storage');
    return { id, status };
}

export async function createSalesData(data: any) {
    if (supabase) {
        const { data: result, error } = await supabase.from('sales_data').insert([data]).select().single();
        if (!error) return result;
    }
    return { id: 'mock-sales-id', ...data };
}

export async function getSalesData(source?: string) {
    if (supabase) {
        let query = supabase.from('sales_data').select('*');
        if (source) query = query.eq('source', source);
        const { data, error } = await query;
        if (!error) return data;
    }
    return [];
}
