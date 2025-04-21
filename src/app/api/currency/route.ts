// pages/api/currencies.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const storeHash = process.env.BIGCOMMERCE_STORE_HASH!;
  const accessToken = process.env.BIGCOMMERCE_ACCESS_TOKEN; // retrieved during OAuth

  if (!storeHash || !accessToken) {
    return res.status(401).json({ error: 'Missing store credentials' });
  }

  try {
    const response = await fetch(`https://api.bigcommerce.com/stores/${storeHash}/v2/currencies`, {
      method: 'GET',
      headers: {
        'X-Auth-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: await response.text() });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.log('Error fetching currencies:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
