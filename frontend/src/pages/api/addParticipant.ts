import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // const { pId, isProlific, curTime, politicalLean, interestsMatrix } = req.body;
    const backendUrl = `http://${process.env.NEXT_PUBLIC_BACKEND_HOST}:${process.env.NEXT_PUBLIC_BACKEND_PORT}/api/participant/create_participant`;

    const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({ pId, isProlific, curTime, politicalLean, interestsMatrix }),
        body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
}