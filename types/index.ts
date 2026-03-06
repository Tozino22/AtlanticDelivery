// Menu Types
export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: 'Food' | 'Beverage' | 'Dessert' | 'Appetizer';
    available: boolean;
    image_url?: string;
    created_at?: string;
    updated_at?: string;
}

// Order Types
export interface OrderItem {
    item_id: string;
    name: string;
    quantity: number;
    price: number;
}

export interface PhoneOrder {
    id: string;
    customer_name: string;
    customer_phone: string;
    order_items: OrderItem[];
    special_instructions?: string;
    order_type: 'Pickup' | 'Delivery';
    status: 'pending' | 'completed';
    total_amount: number;
    source?: string;
    created_at: string;
    completed_at?: string;
}

// Sales Data Types
export interface SalesData {
    id: string;
    source: 'POS' | 'QuickBooks' | 'OCR' | 'Manual' | 'Phone';
    transaction_date: string;
    items: OrderItem[];
    total_amount: number;
    customer_info?: Record<string, any>;
    raw_data?: Record<string, any>;
    created_at: string;
}

// Receptionist Types
export interface ReceptionistLog {
    id: string;
    call_id: string;
    transcript: string;
    duration: number;
    order_id?: string;
    created_at: string;
}

export interface ReceptionistStatus {
    active: boolean;
    current_call?: {
        id: string;
        started_at: string;
        transcript: string[];
    };
}

// Analytics Types
export interface AnalyticsQuery {
    query: string;
    response: string;
    data?: any;
    created_at: string;
}

// OCR Types
export interface OCRResult {
    date?: string;
    items: Array<{
        name: string;
        quantity?: number;
        price: number;
    }>;
    total: number;
    raw_text: string;
}
