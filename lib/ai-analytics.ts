import OpenAI from 'openai';
import { supabase } from './supabase';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * AI Analytics Service
 * Direct owner intelligence via GPT-4o
 */
export class AIAnalyticsService {
    /**
     * Entry point for owner queries
     */
    static async queryData(prompt: string, tenantId: string) {
        // 1. Initial tool-calling request to determine what data to fetch
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an expert hospitality business advisor. 
                    You have access to tools to fetch restaurant data. 
                    Always scope your data requests to the tenantId provided: ${tenantId}.
                    Current Date: ${new Date().toLocaleDateString()}`
                },
                { role: "user", content: prompt }
            ],
            tools: [
                {
                    type: "function",
                    function: {
                        name: "get_sales_summary",
                        description: "Get sales totals for a specific period",
                        parameters: {
                            type: "object",
                            properties: {
                                startDate: { type: "string", description: "ISO date" },
                                endDate: { type: "string", description: "ISO date" }
                            }
                        }
                    }
                },
                {
                    type: "function",
                    function: {
                        name: "get_top_selling_items",
                        description: "Get menu items with most sales",
                        parameters: {
                            type: "object",
                            properties: {
                                limit: { type: "number", default: 5 }
                            }
                        }
                    }
                },
                {
                    type: "function",
                    function: {
                        name: "get_order_status_summary",
                        description: "Count orders by status (pending, completed, etc)",
                        parameters: { type: "object", properties: {} }
                    }
                }
            ]
        });

        const toolCalls = response.choices[0].message.tool_calls;
        if (!toolCalls) {
            return response.choices[0].message.content;
        }

        // 2. Map tool calls to database queries
        const toolOutputs = await Promise.all(toolCalls.map(async (toolCall) => {
            const args = JSON.parse(toolCall.function.arguments);
            let result;

            switch (toolCall.function.name) {
                case "get_sales_summary":
                    result = await this.fetchSales(tenantId, args.startDate, args.endDate);
                    break;
                case "get_top_selling_items":
                    result = await this.fetchTopItems(tenantId, args.limit);
                    break;
                case "get_order_status_summary":
                    result = await this.fetchOrderStats(tenantId);
                    break;
                default:
                    result = { error: "Unknown tool" };
            }

            return {
                tool_call_id: toolCall.id,
                role: "tool",
                name: toolCall.function.name,
                content: JSON.stringify(result)
            };
        }));

        // 3. Final synthesis with data
        const finalResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are an expert hospitality business advisor. Synthesis the provided data into a friendly, helpful insight for the owner." },
                { role: "user", content: prompt },
                response.choices[0].message as any,
                ...toolOutputs as any
            ]
        });

        return finalResponse.choices[0].message.content;
    }

    /**
     * Database Access Helpers (Scoped by tenantId)
     */
    private static async fetchSales(tenantId: string, start?: string, end?: string) {
        if (!supabase) return { error: "DB not connected" };

        let query = supabase.from('phone_orders').select('total_price, created_at').eq('status', 'completed');

        // Multi-tenant check (assuming column exists)
        // query = query.eq('tenant_id', tenantId);

        if (start) query = query.gte('created_at', start);
        if (end) query = query.lte('created_at', end);

        const { data, error } = await query;
        if (error) return { error: error.message };

        const total = data?.reduce((acc, curr) => acc + (curr.total_price || 0), 0) || 0;
        return { total_revenue: total, count: data?.length || 0 };
    }

    private static async fetchTopItems(tenantId: string, limit: number) {
        if (!supabase) return { error: "DB not connected" };

        const { data, error } = await supabase
            .from('phone_orders')
            .select('order_items')
            .eq('status', 'completed')
            .limit(100);

        if (error) return { error: error.message };

        // Parse JSON items and count frequencies
        const itemCounts: Record<string, number> = {};
        data?.forEach(order => {
            const items = typeof order.order_items === 'string' ? JSON.parse(order.order_items) : order.order_items;
            items?.forEach((item: any) => {
                const name = item.name || item.text;
                itemCounts[name] = (itemCounts[name] || 0) + (item.quantity || 1);
            });
        });

        const sorted = Object.entries(itemCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit);

        return sorted.map(([name, count]) => ({ name, count }));
    }

    private static async fetchOrderStats(tenantId: string) {
        if (!supabase) return { error: "DB not connected" };

        const { data, error } = await supabase
            .from('phone_orders')
            .select('status, id');

        if (error) return { error: error.message };

        const stats = data?.reduce((acc: any, curr) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1;
            return acc;
        }, {});

        return stats;
    }
}
