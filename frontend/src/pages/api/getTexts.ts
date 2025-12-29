import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // const { pId, pageNumber } = req.body;
    const backendUrl = `http://${process.env.NEXT_PUBLIC_BACKEND_HOST}:${process.env.NEXT_PUBLIC_BACKEND_PORT}/api/verification/retrieve_data`;

    const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({ pId, pageNumber }),
        body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
}