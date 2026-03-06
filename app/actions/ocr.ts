'use server';

import OpenAI from 'openai';
import { createSalesData } from '@/lib/supabase';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function processReceiptImage(imageBase64: string) {
    try {
        console.log('Processing receipt with AI OCR...');
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an expert restaurant data extractor. 
                    Extract the following from the receipt/invoice image:
                    - date (YYYY-MM-DD)
                    - items: an array of objects with { name, quantity, price }
                    - total_amount
                    
                    Return ONLY a raw JSON object. If a value is missing, use null or 0.`
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Scan this receipt and extract structured data." },
                        {
                            type: "image_url",
                            image_url: {
                                "url": imageBase64,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 1000,
            response_format: { type: "json_object" },
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error('No content returned from OpenAI');

        const data = JSON.parse(content);
        console.log('Successfully extracted data:', data);
        return data;
    } catch (error) {
        console.error('OCR Action Error:', error);
        throw new Error('AI was unable to read the receipt. Please try a clearer photo.');
    }
}

export async function saveOCRData(data: any) {
    try {
        const salesEntry = {
            customer_name: 'OCR Scan Import',
            customer_phone: 'N/A',
            order_items: data.items,
            total_amount: data.total_amount || data.total,
            source: 'OCR_SCAN',
            status: 'completed',
            created_at: data.date ? new Date(data.date).toISOString() : new Date().toISOString()
        };

        return await createSalesData(salesEntry);
    } catch (error) {
        console.error('Error saving OCR data:', error);
        throw error;
    }
}

