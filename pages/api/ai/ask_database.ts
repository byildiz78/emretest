import { NextApiRequest, NextApiResponse } from 'next';

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const { url } = await fetch("https://www.askyourdatabase.com/api/chatbot/v2/session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.DATABASE_CHATBOT_API_KEY}`,
            },
            body: JSON.stringify({
                "chatbotid": "2777ec721dd2fe829afed9da3e1f913a",
                "name": "Sheldon",
                "email": "test@gmail.com"
            }),
        }).then((res) => res.json());

        return res.json({ url });
    } catch (error) {
        console.error('Ask Database API Error:', error);
        return res.status(500).json({ 
            error: 'Sohbet oturumu başlatılamadı. Lütfen daha sonra tekrar deneyin.' 
        });
    }
}
