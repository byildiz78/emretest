import { executeQuery } from '@/lib/dataset';
import { ChatBot } from '@/types/tables';
import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions.mjs';

const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: process.env.DEEPSEEK_API_URL
});

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { ChatBotID, branches, date1, date2 } = req.body;

        if (!ChatBotID) {
            return res.status(400).json({ error: 'ChatBotID is required' });
        }

        const query = `SELECT TOP 1 ChatbotQuery, ChatbotRole, ChatbotContent, ChatbotQueryParams FROM dm_ChatBot WHERE ChatBotID = @ChatBotID`;
        const config = await executeQuery<ChatBot[]>({
            query,
            parameters: {
                ChatBotID
            }
        });

        const chatbotConfig = config[0];

        if (!chatbotConfig) {
            return res.status(404).json({ error: 'Chatbot configuration not found' });
        }
        const date1Obj = new Date(date1);
        const date2Obj = new Date(date2);
        date1Obj.setHours(6, 0, 0, 0);
        date2Obj.setHours(6, 0, 0, 0);

        // Parse query parameters
        const parameters = {
            date1: date1Obj.toISOString() || '2024-01-01T00:00:00',
            date2: date2Obj.toISOString() || new Date().toISOString(),
            BranchID: branches,
            ...(chatbotConfig.ChatbotQueryParams ? JSON.parse(chatbotConfig.ChatbotQueryParams) : {})
        };
        // Execute the analysis query
        const queryResult = await executeQuery<any[]>({
            query: chatbotConfig.ChatbotQuery,
            parameters
        }).catch(error => {
            console.error('Query execution error:', error);
            throw new Error('Failed to execute analysis query');
        });

        // Set up SSE headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        });

        // Create the system message
        const firstMessage: ChatCompletionMessageParam = 
            chatbotConfig.ChatbotRole === 'function' 
                ? {
                    role: 'function',
                    name: 'data_analyzer',
                    content: chatbotConfig.ChatbotContent
                }
                : {
                    role: chatbotConfig.ChatbotRole as 'system' | 'user' | 'assistant',
                    content: chatbotConfig.ChatbotContent
                };

        try {
            // Prepare the complete data summary
            const dataSummary = {
                totalRecords: queryResult.length,
                data: queryResult
            };

            // Send a single request with all data
            const messages: ChatCompletionMessageParam[] = [
                firstMessage,
                {
                    role: 'user',
                    content: `${JSON.stringify(dataSummary, null, 2)}`
                }
            ];

            // Get streaming response from AI
            const response = await client.chat.completions.create({
                model: 'deepseek-chat',
                messages: messages,
                stream: true,
                temperature: 0.7,
                max_tokens: 2000
            });

            let firstMessageSent = false;
            // Stream the response immediately
            for await (const part of response) {
                const content = part.choices[0]?.delta?.content || '';
                if (content) {
                    // Send both content and raw data in the first message
                    if (!firstMessageSent) {
                        res.write(`data: ${JSON.stringify({ 
                            content,
                            rawData: queryResult 
                        })}\n\n`);
                        firstMessageSent = true;
                    } else {
                        res.write(`data: ${JSON.stringify({ content })}\n\n`);
                    }
                    
                }
            }

        } catch (error) {
            console.error('AI processing error:', error);
            res.write(`data: ${JSON.stringify({ 
                content: 'Sorry, there was an error processing your request.' 
            })}\n\n`);
        }

        res.end();
    } catch (error) {
        console.error('Handler error:', error);
        if (!res.headersSent) {
            res.status(500).json({ 
                error: error instanceof Error ? error.message : 'An unexpected error occurred' 
            });
        }
    }
}
