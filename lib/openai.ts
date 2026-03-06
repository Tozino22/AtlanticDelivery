import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeQuery(query: string, context: any) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                {
                    role: 'system',
                    content: `You are a data analyst for a restaurant. You have access to sales data from multiple sources: POS systems, QuickBooks, OCR-scanned receipts, manual entries, and phone orders.
          
Analyze the user's query and provide insights based on the available data. Be concise and specific with numbers.

Available data context: ${JSON.stringify(context)}`,
                },
                {
                    role: 'user',
                    content: query,
                },
            ],
        });

        return response.choices[0].message.content || 'Unable to analyze query.';
    } catch (error) {
        console.error('Error analyzing query:', error);
        throw error;
    }
}

export async function extractReceiptData(imageBase64: string) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4-vision-preview',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `Extract the following information from this receipt/invoice image:
- Date (if visible)
- All items with their names and prices
- Quantities (if visible)
- Total amount

Return the data in JSON format:
{
  "date": "YYYY-MM-DD or null",
  "items": [{"name": "item name", "quantity": 1, "price": 0.00}],
  "total": 0.00
}`,
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/jpeg;base64,${imageBase64}`,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 1000,
        });

        const content = response.choices[0].message.content || '{}';
        return JSON.parse(content);
    } catch (error) {
        console.error('Error extracting receipt data:', error);
        throw error;
    }
}

export { openai };
