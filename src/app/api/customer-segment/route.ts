// pages/api/segments.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const BIGCOMMERCE_STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
    const BIGCOMMERCE_ACCESS_TOKEN = process.env.BIGCOMMERCE_ACCESS_TOKEN;

    if (!BIGCOMMERCE_STORE_HASH || !BIGCOMMERCE_ACCESS_TOKEN) {
        return res.status(500).json({ error: 'Missing BigCommerce credentials in environment variables' });
    }

    const url = `https://api.bigcommerce.com/stores/${BIGCOMMERCE_STORE_HASH}/v3/segments?limit=50&page=1`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Auth-Token': BIGCOMMERCE_ACCESS_TOKEN,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.title || 'Failed to fetch segments' });
        }

        res.status(200).json(data);
    } catch (err) {
        console.error('Segments API error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
