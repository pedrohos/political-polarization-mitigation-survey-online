import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // const { pId } = req.body;
    debugger;
    const backendUrl = `http://${process.env.NEXT_PUBLIC_BACKEND_HOST}:${process.env.NEXT_PUBLIC_BACKEND_PORT}/api/participant/retrieve_status`;

    const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({ pId }),
        body: JSON.stringify(req.body),
    });

    // const data = await response.json();
    // Defensive: handle non-JSON responses
    let data;
    try {
        data = await response.json();
    } catch {
        const text = await response.text();
        return res.status(500).json({ error: 'Backend did not return JSON', details: text });
    }

    res.status(response.status).json(data);
}