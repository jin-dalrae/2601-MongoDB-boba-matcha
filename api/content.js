import { connectToDatabase, ContentSubmission } from './_lib/db.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        await connectToDatabase();

        if (req.method === 'GET') {
            const submissions = await ContentSubmission.find({})
                .populate('contractId')
                .sort({ submitted_at: -1 });

            return res.status(200).json(submissions);
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Content API Error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
