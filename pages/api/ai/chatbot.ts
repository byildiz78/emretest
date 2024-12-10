import { formatDateTimeYMDHIS } from '@/lib/utils';
import { Dataset } from '@/pages/api/dataset';
import { ChatBot } from '@/types/tables';
import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions.mjs';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL;

const client = new OpenAI({
    apiKey: DEEPSEEK_API_KEY,
    baseURL: DEEPSEEK_API_URL
});

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {


        const { branches, date1, date2, message } = req.body;

        const instance = Dataset.getInstance();
        const query = `SELECT TOP 1 ChatbotRole, ChatbotContent FROM dm_ChatBot WHERE ChatBotID = '999' `;
        const config = await instance.executeQuery<ChatBot[]>({
            query,
            req
        });

        const chatbotConfig = config[0];
        if (!chatbotConfig) {
            return res.status(404).json({ error: 'Chatbot configuration not found' });
        }

        const date1Obj = new Date(date1);
        const date2Obj = new Date(date2);

        const parameters = {
            date1: formatDateTimeYMDHIS(date1Obj),
            date2: formatDateTimeYMDHIS(date2Obj),
            BranchID: branches
        };

        // Create messages array with explicit type checking
        const messages: ChatCompletionMessageParam[] = [
            {
                role: 'system',
                content: `${chatbotConfig.ChatbotContent}\nLütfen yanıtını sadece SQL sorgusu olarak ver ve sorguyu JSON formatında döndür. Örnek format: {"sql": "SELECT * FROM table"}. Başka bir açıklama ekleme, sadece SQL sorgusunu JSON formatında döndür.`
            }
        ];

        console.log('Final messages array:', JSON.stringify(messages, null, 2));

        try {
            // Get streaming response from AI
            const response = await client.chat.completions.create({
                model: 'deepseek-chat',
                messages,
                stream: true,
                temperature: 0.7,
                max_tokens: 2000
            });

            let fullContent = '';
            
            // Collect all content parts
            for await (const part of response) {
                const content = part.choices[0]?.delta?.content || '';
                fullContent += content;
            }

            console.log('AI Response:', fullContent); // Debug için

            try {
                // Eğer response zaten JSON formatında ise
                const parsedContent = JSON.parse(fullContent);
                const sqlQuery = parsedContent?.sql || '';
                console.log('Extracted SQL Query:', sqlQuery);
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json(sqlQuery);
            } catch (parseError) {
                // Eğer JSON parse edilemezse, SQL sorgusunu çıkarmaya çalış
                const sqlMatch = fullContent.match(/SELECT[\s\S]*?(?=;|$)/i);
                if (sqlMatch) {
                    const sqlQuery = sqlMatch[0].trim();
                    console.log('Extracted SQL Query (from regex):', sqlQuery);
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200).json(sqlQuery);
                } else {
                    console.error('Could not extract SQL query:', fullContent);
                    res.status(500).json({ error: 'Could not extract SQL query from response' });
                }
            }

        } catch (error) {
            console.error('AI processing error:', error);
            res.status(500).json({ 
                error: error instanceof Error ? error.message : 'AI processing error',
                details: error
            });
        }

    } catch (error) {
        console.error('Handler error:', error);
        if (!res.headersSent) {
            res.status(500).json({
                error: error instanceof Error ? error.message : 'An unexpected error occurred',
                details: error
            });
        }
    }
}
