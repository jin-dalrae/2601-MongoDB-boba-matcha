require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const {
    User, SNSAccount, AgentConfig, Wallet, SharedMemory, AgentLog,
    Campaign, AutoBid,
    NegotiationLog, Contract, Shipment,
    ContentSubmission, AuditReport, X402Settlement
} = require('./models');

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.error("Error: MONGODB_URI is not defined in .env file");
    process.exit(1);
}

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();

    console.log('Cleaning up old data...');
    // Drop all collections to clear indexes
    const models = [
        User, SNSAccount, AgentConfig, Wallet, SharedMemory, AgentLog,
        Campaign, AutoBid, NegotiationLog, Contract, Shipment,
        ContentSubmission, AuditReport, X402Settlement
    ];
    for (const model of models) {
        try {
            await model.collection.drop();
        } catch (e) {
            if (e.code === 26) {
                // Namespace not found (collection doesn't exist), safe to ignore
            } else {
                console.error(`Error dropping collection for ${model.modelName}:`, e.message);
            }
        }
    }

    console.log('--- A. Entry & Onboarding ---');

    // 1. Advertisers & Creators
    const advertisers = [];
    const creators = [];

    // Create Advertisers
    for (let i = 0; i < 20; i++) {
        const user = await User.create({
            role: 'Advertiser',
            name: faker.company.name(),
            email: faker.internet.email(),
            onboarding_status: 'Complete'
        });

        // Advertiser Wallet
        await Wallet.create({
            userId: user._id,
            address: '0x' + faker.string.hexadecimal({ length: 40, prefix: '' }),
            balance: faker.number.int({ min: 10000, max: 1000000 })
        });

        // Advertiser Agent Config
        await AgentConfig.create({
            userId: user._id,
            rules: {
                auto_bid_max: 5000,
                preferences: { speed: 'Urgent', quality: 'High' },
                tone: 'Professional'
            },
            memory_state: 'initialized'
        });

        const advSharedMem = await SharedMemory.create({
            entityId: user._id,
            performance_embedding: Array.from({ length: 5 }, () => Math.random()),
            reliability_score: faker.number.float({ min: 0.6, max: 0.95 }),
            visibility_rules: { publicProfit: false }
        });

        const advertiserLogMessages = [
            'Auto-adjusted bids based on recent performance.',
            'Shortlisted top creators for active campaign.',
            'Negotiation completed with a creator.',
            'Contract approved and sent for signature.',
            'Budget threshold updated for campaign.'
        ];

        const logCount = faker.number.int({ min: 2, max: 5 });
        for (let j = 0; j < logCount; j++) {
            await AgentLog.create({
                sharedMemoryId: advSharedMem._id,
                action: 'ADVERTISER_AGENT_EVENT',
                details: { message: faker.helpers.arrayElement(advertiserLogMessages) }
            });
        }

        advertisers.push(user);
    }

    // Create Creators
    for (let i = 0; i < 50; i++) {
        const user = await User.create({
            role: 'Creator',
            name: faker.person.fullName(),
            email: faker.internet.email(),
            onboarding_status: 'Complete'
        });

        // Creator SNS
        await SNSAccount.create({
            userId: user._id,
            platform: faker.helpers.arrayElement(['TikTok', 'Instagram', 'YouTube']),
            handle: `@${faker.internet.username()}`,
            connectionStatus: 'Connected',
            authMeta: { accessToken: 'mock_token' }
        });

        // Creator Wallet
        await Wallet.create({
            userId: user._id,
            address: '0x' + faker.string.hexadecimal({ length: 40, prefix: '' }),
            balance: faker.number.int({ min: 0, max: 5000 })
        });

        // Creator Agent Config
        await AgentConfig.create({
            userId: user._id,
            rules: {
                auto_bid_max: 0, // Creators usually get bids
                preferences: { min_price: 200 },
                tone: 'Casual'
            },
            memory_state: 'initialized'
        });

        // Shared Memory Entry & Log
        const sharedMem = await SharedMemory.create({
            entityId: user._id,
            performance_embedding: Array.from({ length: 5 }, () => Math.random()),
            reliability_score: faker.number.float({ min: 0.5, max: 1.0 }),
            visibility_rules: { publicProfit: false }
        });

        await AgentLog.create({
            sharedMemoryId: sharedMem._id,
            action: 'INITIALIZATION',
            details: { message: 'Creator agent initialized' }
        });

        creators.push(user);
    }

    console.log(`Created ${advertisers.length} Advertisers and ${creators.length} Creators.`);

    console.log('--- B. Campaign Creation ---');

    const campaigns = [];
    for (const advertiser of advertisers) {
        const numberOfCampaigns = faker.number.int({ min: 1, max: 3 });
        for (let j = 0; j < numberOfCampaigns; j++) {
            const campaign = await Campaign.create({
                advertiserId: advertiser._id,
                title: `${faker.commerce.productAdjective()} ${faker.commerce.productName()} Launch`,
                product_info: {
                    name: faker.commerce.productName(),
                    description: faker.commerce.productDescription(),
                    url: faker.internet.url()
                },
                budget_limit: faker.number.int({ min: 2000, max: 10000 }),
                status: 'Active'
            });
            campaigns.push(campaign);
        }
    }

    console.log(`Created ${campaigns.length} Campaigns.`);

    console.log('--- C & D. Matching, Proposal & Negotiation ---');

    const contracts = [];

    for (const campaign of campaigns) {
        // Each campaign matches with 1-2 creators
        const selectedCreators = faker.helpers.arrayElements(creators, faker.number.int({ min: 1, max: 2 }));

        for (const creator of selectedCreators) {
            const initialBid = faker.number.int({ min: 500, max: 1500 });

            const autoBid = await AutoBid.create({
                campaignId: campaign._id,
                creatorId: creator._id,
                current_bid: initialBid,
                status: 'Accepted'
            });

            // Negotiation Log
            await NegotiationLog.create({
                autoBidId: autoBid._id,
                round_history: [
                    { round: 1, price: initialBid + 200, concessions: 'None', reasoning: 'Initial ask', timestamp: new Date() },
                    { round: 2, price: initialBid, concessions: 'Agreed to timeline', reasoning: 'Matched budget', timestamp: new Date() }
                ],
                agent_logic_summary: 'Converged on budget limit.'
            });

            // Contract
            const contract = await Contract.create({
                autoBidId: autoBid._id,
                advertiserId: campaign.advertiserId,
                creatorId: creator._id,
                base_payout: initialBid,
                conditional_tiers: {
                    'tier_1': { views: 1000, bonus: 50 },
                    'tier_2': { views: 10000, bonus: 200 }
                },
                audit_criteria: 'Must show logo for 3 seconds',
                status: 'Active'
            });

            contracts.push(contract);

            // Shipment (Optional product send)
            if (faker.datatype.boolean()) {
                await Shipment.create({
                    contractId: contract._id,
                    trackingCode: faker.string.alphanumeric(10).toUpperCase(),
                    status: 'Delivered',
                    shippedAt: faker.date.recent(),
                    deliveredAt: new Date()
                });
            }
        }
    }

    console.log(`Created Contracts for active proposals.`);

    console.log('--- E, F & G. Execution: Content, Audit, Payment ---');

    for (const contract of contracts) {
        // Content Submission with actual video URLs
        const videoUrls = [
            'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4'
        ];

        const submission = await ContentSubmission.create({
            contractId: contract._id,
            content_url: faker.helpers.arrayElement(videoUrls),
            submitted_at: new Date()
        });

        // Audit Report
        const contentScore = faker.number.float({ min: 0.6, max: 0.99 });
        const isGood = contentScore > 0.8;
        const tierAchieved = isGood ? faker.number.int({ min: 1, max: 2 }) : 0;

        // Explicitly using Audit_Report model name ref logic if needed, but variable matches
        const auditReport = await AuditReport.create({
            submissionId: submission._id,
            contractId: contract._id,
            video_fingerprint: faker.string.hexadecimal({ length: 32, prefix: '' }),
            content_score: contentScore,
            tier_achieved: tierAchieved,
            reasoning_log: isGood ? 'High engagement detected, Tier ' + tierAchieved + ' reached' : 'Low lighting, Tier 0'
        });

        // Payment (X402 Settlement)
        const base = contract.base_payout;
        // Calculate simple bonus based on tier
        let bonus = 0;
        if (tierAchieved === 1) bonus = 50;
        if (tierAchieved === 2) bonus = 200;

        const totalPaid = base + bonus;

        await X402Settlement.create({
            contractId: contract._id,
            auditReportId: auditReport._id,
            x402_handshake_header: 'X402-1.0-Payment-Required',
            status: 'Settled',
            stablecoin_hash: '0x' + faker.string.hexadecimal({ length: 64, prefix: '' }),
            total_paid: totalPaid,
            receipt_hash: 'Receipt-' + faker.string.alphanumeric(16)
        });
    }

    console.log('Seeding Complete! Database is updated to new ER Diagram.');
    process.exit(0);
};

seedData();
