import { formatDateTimeYMDHI, formatDateTimeYMDHIS } from '@/lib/utils';
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

type ResponseWithFlush = NextApiResponse & {
    flush?: () => void;
};

export default async function handler(
    req: NextApiRequest,
    res: ResponseWithFlush
) {
    // Enable streaming for progress updates
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        const { branches, message, oldMessages, ChatBotID } = req.body;

        // Send progress update for config fetch
        res.write('data: ' + JSON.stringify({ status: 'progress', message: 'Yapılandırma alınıyor...' }) + '\n\n');
        res.flush?.();

        const instance = Dataset.getInstance();
        const query = `SELECT TOP 1 ChatbotRole, ChatbotContent FROM dm_ChatBot WHERE ChatBotID = @ChatBotID`;
        console.log('Fetching chatbot config with ID:', ChatBotID);
        try {
            const config = await instance.executeQuery<ChatBot[]>({
                query,
                req,
                parameters: {
                    ChatBotID: ChatBotID.toString()
                }
            });

            console.log('Chatbot config result:', config);

            const chatbotConfig = config[0];
            if (!chatbotConfig) {
                console.error('No chatbot config found for ID:', ChatBotID);
                return res.status(404).json({ error: 'Chatbot configuration not found' });
            }

            // Send progress update for AI processing
            res.write('data: ' + JSON.stringify({ status: 'progress', message: 'Sorgunuz AI tarafından işleniyor...' }) + '\n\n');
            res.flush?.();

            const parameters = {
                BranchID: branches
            };

            const messages: ChatCompletionMessageParam[] = [
                {
                    role: chatbotConfig.ChatbotRole as 'system' | 'user' | 'assistant',
                    content: `${chatbotConfig.ChatbotContent}.  SQL Parametreleri: ${JSON.stringify(parameters)}" `
                }
            ];

            let oldmesgs = '';
            try{
                oldmesgs = oldMessages.join('\n')
                messages.push({
                    role: 'user',
                    content: `Geçmiş Mesajlar: ` + oldmesgs 
                })
        
            }catch(error){
            }

            messages.push({
                role: 'user',
                content: message
            })
            try {
                const response = await client.chat.completions.create({
                    model: 'deepseek-chat',
                    messages,
                    stream: true,
                    temperature: 0.7,
                    max_tokens: 2000
                });

                // Send progress update for SQL generation
                res.write('data: ' + JSON.stringify({ status: 'progress', message: 'yanıt oluşturuluyor...' }) + '\n\n');
                res.flush?.();

                let aiResponse = '';
                for await (const part of response) {
                    const content = part.choices[0]?.delta?.content || '';
                    aiResponse += content;
                }
                if(aiResponse.toString().includes('ONLY_SQL')){
                    aiResponse = aiResponse
                    .replace('ONLY_SQL', '')
                    .replace(/```sql/g, '')
                    .replace(/```/g, '')
                    .replace(/\\n/g, '\n')
                    .trim();

                    if (!aiResponse.toString().includes('SELECT')) {
                        res.write('data: ' + JSON.stringify({ 
                            status: 'error',
                            error: aiResponse
                        }) + '\n\n');
        
                        res.flush?.();
                        res.end();
        
                    }
        
                    // Send progress update for database query
                    res.write('data: ' + JSON.stringify({ status: 'progress', message: 'Veritabanı sorgusu çalıştırılıyor...' }) + '\n\n');
                    res.flush?.();
        
                    const result = await instance.executeQuery<any[]>({
                        query: aiResponse,
                        req
                    });
        
                    // Send final result
                    res.write('data: ' + JSON.stringify({ status: 'complete', data: result }) + '\n\n');
                    res.flush?.();
                }else{
                    res.write('data: ' + JSON.stringify({ status: 'complete', data: aiResponse }) + '\n\n');

                }


                res.end();

            } catch (error) {
                console.error('AI processing error:', error);
                res.write('data: ' + JSON.stringify({ 
                    status: 'error',
                    error: error instanceof Error ? error.message : 'AI processing error'
                }) + '\n\n');
                res.flush?.();
                res.end();
            }
        } catch (error) {
            console.error('Error fetching chatbot config:', error);
            res.write('data: ' + JSON.stringify({ 
                status: 'error',
                error: error instanceof Error ? error.message : 'Error fetching chatbot config'
            }) + '\n\n');
            res.flush?.();
            res.end();
        }

    } catch (error) {
        console.error('Handler error:', error);
        if (!res.headersSent) {
            res.write('data: ' + JSON.stringify({ 
                status: 'error',
                error: error instanceof Error ? error.message : 'An unexpected error occurred'
            }) + '\n\n');
            res.flush?.();
            res.end();
        }
    }
}