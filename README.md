<div align="center">

# 🍵 Matcha

### Robot agents that do influencer ad deals for you — start to finish

[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)

</div>

---

## 👋 Read this first (the 30-second version)

Imagine you're a YouTuber or TikToker. A company wants to pay you to make a video about their product. Normally you'd have to:

1. Find the company.
2. Argue back and forth about how much they'll pay you.
3. Make the video.
4. Hope they actually pay you.

That's slow, stressful, and a manager usually takes a big chunk of your money for doing it.

**Matcha replaces the manager with a robot.** Every creator gets a robot helper. Every company gets a robot helper. The two robots talk to each other, agree on a price, check that the video is good, and send the money automatically. Humans just say "yes, go" and watch.

> Think of it like having a super-fast personal assistant that never sleeps and doesn't take a cut of your money.

---

## 🧩 The words you need to know

You'll see these words everywhere. Here's what they mean in plain English:

| Word | What it really means |
|---|---|
| **Creator** | A person who makes videos/posts online (YouTuber, TikToker, etc.) |
| **Advertiser** | A company that wants to pay a creator to promote its product |
| **Agent** | A robot (powered by AI) that does a job for a human automatically |
| **Negotiation** | The back-and-forth of "I want $800" / "I'll give $500" until both agree |
| **Contract** | The written promise: "Make this video, get paid this much" |
| **Audit** | Checking the finished video to make sure it's good and follows the rules |
| **Settlement** | Actually sending the money |
| **x402 / Base** | The internet money system Matcha uses to pay people (digital dollars) |
| **MongoDB** | The giant notebook where the app writes down everything that happens |

---

## 🎬 The whole process, told as a story

Here is the entire journey, step by step. This is **the process** the title of this README is about.

```
1. SIGN UP        →  2. DISCOVER     →  3. BID          →  4. NEGOTIATE
   "I'm a creator"    "Here are jobs"    "I want this one"   robots argue price

                                                                  │
                                                                  ▼

8. GET PAID       ←  7. AUDIT        ←  6. SUBMIT       ←  5. CONTRACT
   money is sent      robot grades it    "here's my video"   deal is signed
```

**Step 1 — Sign up.**
You open the website and answer a few questions: Are you a creator or a company? What's your account handle? Where should money go? Matcha saves you in its notebook (the database).

**Step 2 — Discover.**
A creator sees a list of real ad jobs ("campaigns") that companies have posted. Like a job board, but for videos.

**Step 3 — Bid.**
The creator picks a job they like and says "I'm interested." This is called an *AutoBid* — it's the creator's robot raising its hand.

**Step 4 — Negotiate (the cool part).**
The creator's robot and the company's robot start talking to each other. They go back and forth — "How about $800?" "We can do $600." — for a few rounds, just like real people haggling, until they agree or call it off. A human never has to type a single message.

**Step 5 — Contract.**
Once both robots agree, Matcha writes a contract: how much money, what video to make, the deadline, and bonus rules (e.g. "extra $100 if the video gets 10,000 views").

**Step 6 — Submit.**
The creator makes the video and pastes the link into Matcha.

**Step 7 — Audit.**
A robot watches/reads the submission and grades it: Is it good quality? Is it safe for the brand? Did it follow the contract? It gives a score and decides which bonus tier was earned.

**Step 8 — Get paid.**
Based on the score, Matcha calculates the final payment (base pay + bonuses) and sends digital money to the creator automatically. Done — no chasing anyone for a check.

---

## 🏠 The app has 4 parts (think of a restaurant)

To make all of that work, Matcha is built from four pieces. Here's a restaurant analogy so it's easy to picture:

```
┌──────────────────────────────────────────────────────────────┐
│  1. FRONTEND  — the dining room you sit in (the website)       │
│     React + Vite  ·  http://localhost:5173                     │
└──────────────────────────────────────────────────────────────┘
                 │                              │
                 ▼                              ▼
┌────────────────────────────┐   ┌────────────────────────────────┐
│ 2. NODE API — the waiter    │   │ 3. AGENTS — the smart chefs     │
│    carries messages around  │   │    the AI robots that think     │
│ Express ·  port 3001        │   │ FastAPI ·  port 8000            │
└────────────────────────────┘   └────────────────────────────────┘
                 │                              │
                 └──────────────┬───────────────┘
                                ▼
┌──────────────────────────────────────────────────────────────┐
│  4. MONGODB — the notebook that remembers everything           │
│     users · campaigns · contracts · payments · …               │
└──────────────────────────────────────────────────────────────┘
```

| Part | Restaurant role | What it actually does |
|---|---|---|
| **Frontend** | The dining room | The website you click around in. Pretty buttons and screens. |
| **Node API** | The waiter | Takes your requests and carries them to the kitchen and notebook. |
| **Agents** | The smart chefs | The AI robots that negotiate, grade videos, and send money. |
| **MongoDB** | The notebook | Writes down every user, deal, and payment so nothing is forgotten. |

All four need to be running at the same time for the app to work — just like a restaurant needs the dining room, waiter, chef, *and* order notebook all at once.

---

## 🚀 How to run it on your own computer

Follow these like a recipe. Don't skip steps.

### What you need installed first

- **Node.js** version 18 or newer — [download here](https://nodejs.org/)
- **Python** version 3.10 or newer — [download here](https://www.python.org/) (only needed for the AI robots)
- A **MongoDB Atlas** account — a free online database ([sign up here](https://www.mongodb.com/atlas))
- One **AI key**: an Anthropic *or* OpenAI API key (this is what powers the robots' brains)

### Step 1 — Download the code and install the parts

```bash
git clone https://github.com/your-org/matcha.git
cd matcha

# install the waiter (Node API)
npm install

# install the dining room (frontend)
cd frontend && npm install && cd ..

# install the chefs (Python AI robots)
cd agents
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cd ..
```

> 💡 `npm install` and `pip install` just download all the helper code the app needs. It's normal for this to take a minute and print a lot of text.

### Step 2 — Add your secret keys

There's a file called `.env.example`. Make a copy of it called `.env`:

```bash
cp .env.example .env
```

Now open `.env` in a text editor and fill in two things:

- `MONGODB_URI` — the address of your MongoDB notebook (you get this from your MongoDB Atlas account).
- `ANTHROPIC_API_KEY` *or* `OPENAI_API_KEY` — the key that lets the robots think.

> 🔒 The `.env` file holds passwords. **Never** post it online or share it.

### Step 3 — Fill the notebook with example data

```bash
npm run seed
```

This creates pretend users so the app isn't empty: 20 companies, 50 creators, ~30 ad jobs, plus sample deals and payments. It's like loading a video game with practice characters so you can try things out.

### Step 4 — Start everything (you need 3 terminal windows open)

Open three separate terminal windows and run one command in each:

```bash
# Terminal 1 — the waiter (Node API)
npm run dev
```

```bash
# Terminal 2 — the dining room (frontend website)
cd frontend && npm run dev
```

```bash
# Terminal 3 — the smart chefs (Python AI robots)
cd agents && source venv/bin/activate && python server.py
```

> 😅 No AI key or don't want to run Python? You can run pretend robots instead with `npm run agents:mock` — it fakes the AI so you can still click through everything.

### Step 5 — Open the app

Go to **<http://localhost:5173>** in your web browser. You're in! 🎉

---

## ✅ What works right now (honest list)

This is a hackathon project, so some things are real and one thing is missing on purpose.

| Feature | Works? | Note |
|---|---|---|
| Signing up | ✅ Yes | Saves you to the database |
| Creator home page | ✅ Yes | Shows real earnings and deals |
| Browsing ad jobs | ✅ Yes | Real campaigns from the database |
| Placing a bid | ✅ Yes | Creates a real AutoBid |
| Robots negotiating | ✅ Yes | Full back-and-forth, end to end |
| Signing the contract | ✅ Yes | Made automatically after agreement |
| Submitting a video + grading it | ✅ Yes | Robot scores the submission |
| Sending the money | ✅ Yes | Real on-chain payment via the AI agent when keys are set; a keyless simulated path (`POST /api/payments/execute`) otherwise |
| Company dashboard | ✅ Yes | Budgets, campaigns, results |
| Login / passwords | ❌ Not built | There are no accounts or passwords yet — anyone can open any page. This is a known gap for the demo. |

### 🔧 Known issues we're fixing

Two pre-existing bugs were found while consolidating the codebase. They're
written up with exact fixes in **[PLAN.md](PLAN.md)**:

1. **Some contract lists can error.** A few database links use the wrong
   internal name, so screens that load contracts can fail. One-line fix.
2. **Agent-sent payments don't always show up.** The Python payment robot
   saves money records in a slightly different spot than the website reads
   from, so a real agent payment can succeed but not appear in the UI. The
   keyless Node payment path above is not affected.

---

## 🧪 Where things are saved (the notebook's chapters)

MongoDB stores everything in labeled lists called **collections**. The main ones:

```
users               every person (creator or advertiser)
campaigns           the ad jobs companies post
auto_bids           a creator saying "I want this job"
negotiation_logs    the full robot-vs-robot conversation
contracts           the signed deal (price, deliverables, bonuses)
content_submissions the video link a creator turns in
audit_reports       the robot's grade of that video
x402_settlements    the record of money that was sent
agent_logs          a diary of everything the robots did
```

Every step in the story above writes a new entry into one of these — so you can always look back and see exactly what happened and why.

---

## 🏆 Built for

<div align="center">

**MongoDB Hackathon 2026** — *flexible databases for an AI-agent workflow.*

Made with 🍵 by Team Matcha · [⬆ Back to top](#-matcha)

</div>

---

## 📄 License

MIT — free to use and learn from. See [LICENSE](LICENSE).
