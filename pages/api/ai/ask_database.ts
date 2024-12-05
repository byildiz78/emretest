import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const API_KEY = process.env.DATABASE_CHATBOT_API_KEY;
    const API_URL = process.env.DATABASE_CHATBOT_API_URL || '';

    const { url } = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
            "chatbotid": "2777ec721dd2fe829afed9da3e1f913a",
            "name": "Sheldon",
            "email": "test@gmail.com"
        }),
    }).then((res) => res.json());

    return res.json({ url });
}

