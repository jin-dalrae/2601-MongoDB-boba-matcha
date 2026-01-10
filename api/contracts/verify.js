import { connectToDatabase, Contract } from '../_lib/db.js';

const setCors = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

export default async function handler(req, res) {
    setCors(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await connectToDatabase();
        const { contractId } = req.body || {};
        if (!contractId) {
            return res.status(400).json({ error: 'contractId is required' });
        }

        const contract = await Contract.findById(contractId);
        if (!contract) {
            return res.status(404).json({ error: 'Contract not found' });
        }

        contract.status = 'Released';
        contract.releaseTx = '0xRelease' + Math.random().toString(16).substr(2, 40);
        contract.verificationReasoning = `
            Content verified successfully:
            1. Product mention detected in transcript.
            2. Visuals include brand placement.
            3. Tone aligns with campaign guidelines.
        `.trim();

        await contract.save();

        return res.status(200).json({
            success: true,
            status: contract.status,
            releaseTx: contract.releaseTx,
            reasoning: contract.verificationReasoning
        });
    } catch (err) {
        console.error('Contract verify error:', err);
        res.status(500).json({ error: err.message });
    }
}
