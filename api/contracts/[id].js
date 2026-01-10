import { connectToDatabase, Contract } from '../_lib/db.js';

const setCors = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

export default async function handler(req, res) {
    setCors(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await connectToDatabase();
        const { id } = req.query;
        const contract = await Contract.findById(id).lean();

        if (!contract) {
            return res.status(404).json({ error: 'Contract not found' });
        }

        return res.status(200).json(contract);
    } catch (err) {
        console.error('Contract fetch error:', err);
        res.status(500).json({ error: err.message });
    }
}
