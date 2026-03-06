import Vapi from '@vapi-ai/web';

let vapiInstance: Vapi | null = null;

export function getVapiClient() {
    if (typeof window === 'undefined') return null;

    if (!vapiInstance) {
        const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '';
        vapiInstance = new Vapi(publicKey);
    }
    return vapiInstance;
}

export interface VapiCallConfig {
    model: {
        provider: 'openai' | 'anthropic' | 'together-ai' | 'anyscale' | 'openrouter' | 'perplexity-ai' | 'deepinfra' | 'groq' | 'mistral' | 'custom-llm';
        model: string;
        messages: Array<{
            role: 'system' | 'user' | 'assistant' | 'tool' | 'function';
            content: string | null;
            name?: string;
            tool_calls?: any[];
            tool_call_id?: string;
        }>;
        functions?: Array<{
            name: string;
            description: string;
            parameters: any;
        }>;
    };
    voice: {
        provider: '11labs' | 'elevenlabs' | 'playht' | 'lmnt' | 'rime' | 'azure' | 'tavus';
        voiceId: string;
    };
    firstMessage: string;
    server?: {
        url: string;
        secret?: string;
    };
}

export function createReceptionistConfig(menuContext: string, apiUrl?: string): VapiCallConfig {
    const vapiSecret = process.env.VAPI_SECRET_KEY || '';

    return {
        model: {
            provider: 'openai',
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are a friendly AI receptionist for a restaurant. Your job is to:
1. Greet customers warmly
2. Answer questions about the menu
3. Take orders accurately
4. Collect customer information (name, phone number)
5. Ask if they want pickup or delivery
6. Confirm the order before ending the call

MENU INFORMATION:
${menuContext}

When taking an order:
- Ask for items one at a time
- Confirm quantities
- Ask about special instructions
- Get customer name and phone number
- Ask if pickup or delivery
- Repeat the order back for confirmation

Be friendly, professional, and efficient. Keep responses concise.`,
                },
            ],
            functions: [
                {
                    name: 'save_order',
                    description: 'Save a completed customer order',
                    parameters: {
                        type: 'object',
                        properties: {
                            customer_name: { type: 'string' },
                            customer_phone: { type: 'string' },
                            items: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        quantity: { type: 'number' },
                                        price: { type: 'number' },
                                    },
                                },
                            },
                            order_type: { type: 'string', enum: ['Pickup', 'Delivery'] },
                            special_instructions: { type: 'string' },
                        },
                        required: ['customer_name', 'customer_phone', 'items', 'order_type'],
                    },
                },
            ],
        },
        voice: {
            provider: '11labs',
            voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel Voice ID
        },
        firstMessage: "Hello! Thank you for calling. How can I help you today?",
        server: apiUrl ? {
            url: apiUrl,
            ...(vapiSecret ? { secret: vapiSecret } : {})
        } : undefined,
    };
}
