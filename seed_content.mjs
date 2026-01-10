import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectToDatabase, Content, User, Contract } from './api/_lib/db.js';

dotenv.config();

const videos = [
    { filename: "v15044gf0000d4r0q87og65opbb0e2kg.MP4", title: "Summer Fashion Haul", tags: ["fashion", "summer", "outfit"], keywords: ["dress", "sun", "beach"] },
    { filename: "v15044gf0000d4thr1vog65r1fgmtdi0.MP4", title: "Tech Review: Smart Watch", tags: ["tech", "review", "gadget"], keywords: ["watch", "screen", "battery"] },
    { filename: "v15044gf0000d504utfog65vf158i3d0.MP4", title: "Morning Routine", tags: ["lifestyle", "vlog", "routine"], keywords: ["coffee", "morning", "gym"] },
    { filename: "v15044gf0000d507847og65hqin6u2n0.MP4", title: "Skincare 101", tags: ["beauty", "skincare", "glow"], keywords: ["cream", "face", "moisturizer"] },
    { filename: "v15044gf0000d55cqdvog65l9rkeu560.MP4", title: "Healthy Meal Prep", tags: ["food", "healthy", "cooking"], keywords: ["salad", "kitchen", "recipe"] },
    { filename: "v15044gf0000d59cppvog65omdf7bqk0.MP4", title: "Travel Vlog: Tokyo", tags: ["travel", "vlog", "japan"], keywords: ["city", "food", "explore"] },
    { filename: "v15044gf0000d5cnpjvog65vm2j05ec0.MP4", title: "Gaming Setup Tour", tags: ["tech", "gaming", "setup"], keywords: ["pc", "monitor", "keyboard"] },
    { filename: "v15044gf0000d5dv94vog65vaiv83nb0.MP4", title: "Fitness Challenge", tags: ["fitness", "gym", "workout"], keywords: ["weights", "run", "sweat"] },
    { filename: "v15044gf0000d5e0bmnog65qnsjeoikg.MP4", title: "OOTD: Streetwear", tags: ["fashion", "style", "outfit"], keywords: ["sneakers", "hoodie", "street"] }
];

async function seedContent() {
    try {
        console.log('Connecting to DB...');
        await connectToDatabase();
        console.log('Connected.');

        // Find a Creator to assign these to
        const creator = await User.findOne({ role: 'Creator' });
        if (!creator) {
            console.error('No Creator found. Please run main seed first.');
            process.exit(1);
        }

        // Find relevant contracts (or just pick one)
        const contracts = await Contract.find({ creatorId: creator._id });
        const defaultContract = contracts[0];

        console.log(`Seeding content for Creator: ${creator.name} (${creator._id})`);

        await Content.deleteMany({});
        console.log('Cleared existing content.');

        const contentDocs = videos.map(v => ({
            creatorId: creator._id,
            contractId: defaultContract ? defaultContract._id : null,
            filename: v.filename,
            title: v.title,
            platform: 'TikTok',
            tags: v.tags,
            ai_audit: {
                brand_safe: true,
                keywords_detected: v.keywords,
                sentiment: 'Positive'
            },
            // Since videos are local, we'll assume they are served via a local route or eventually uploaded
            // For now, we store the filename referenced in the videos folder
            url: `/videos/${v.filename}`
        }));

        await Content.insertMany(contentDocs);
        console.log(`✅ Seeded ${contentDocs.length} videos.`);

        process.exit(0);

    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seedContent();
