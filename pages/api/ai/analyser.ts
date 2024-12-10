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
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { ChatBotID, branches, date1, date2 } = req.body;

        if (!ChatBotID) {
            return res.status(400).json({ error: 'ChatBotID is required' });
        }

        const instance = Dataset.getInstance();
        const query = `SELECT TOP 1 ChatbotQuery, ChatbotRole, ChatbotContent, ChatbotQueryParams FROM dm_ChatBot WHERE ChatBotID = @ChatBotID`;
        const config = await instance.executeQuery<ChatBot[]>({
            query,
            parameters: {
                ChatBotID
            },
            req
        });

        const chatbotConfig = config[0];

        if (!chatbotConfig) {
            return res.status(404).json({ error: 'Chatbot configuration not found' });
        }
        const date1Obj = new Date(date1);
        const date2Obj = new Date(date2);

        // Parse query parameters
        const parameters = {
            date1: formatDateTimeYMDHIS(date1Obj),
            date2: formatDateTimeYMDHIS(date2Obj),
            BranchID: branches,
            ...(chatbotConfig.ChatbotQueryParams ? JSON.parse(chatbotConfig.ChatbotQueryParams) : {})
        };

        const queryResult = await instance.executeQuery<any[]>({
            query: chatbotConfig.ChatbotQuery,
            parameters,
            req
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

            if (queryResult.length) {
                const dataSummary = {
                    totalRecords: queryResult.length,
                    data: queryResult
                };

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
                        // Ensure the content is sent immediately
                        if (res.flush) res.flush();
                    }
                }

                // After all AI messages, fetch and send balance
                try {
                    const balanceResponse = await fetch(`${DEEPSEEK_API_URL}/user/balance`, {
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
                        }
                    });

                    const balanceData = await balanceResponse.json();

                    // Send balance data as a final message
                    res.write(`data: ${JSON.stringify({
                        balance: balanceData
                    })}\n\n`);

                    if (res.flush) res.flush();
                } catch (balanceError) {
                    console.error('Error fetching balance:', balanceError);
                }

            } else {
                res.write(`data: ${JSON.stringify({
                    content: 'Seçmiş Olduğunuz Filtrelere Ait Veri Bulunamadı.'
                })}\n\n`);
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
