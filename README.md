# Penny Pal

Penny Pal is a clean, intuitive personal finance tracker designed to help you understand your spending habits and manage your money better.

## What is Penny Pal?

Penny Pal is a full-stack financial tracking application built for the web. It moves beyond complex spreadsheets and cluttered banking apps, providing a straightforward dashboard where users can log their income, track their daily expenses, and visualize their financial health through actionable analytics.

## The Problem It Solves

Most personal finance tools are either too simple (lacking real insights) or too complex (requiring an accounting background to understand). Finding a middle ground where you can quickly log a transaction and instantly see how it affects your monthly budget is surprisingly difficult. 

Penny Pal bridges this gap. It gives users a bird's-eye view of their cash flow, breaking down spending by category, identifying trends over time, and offering insights into their financial behavior without overwhelming them with data fields.

## Key Features

- **Effortless Tracking:** Log income and expenses in seconds with a frictionless, easy-to-use interface.
- **Visual Analytics:** Interactive charts break down your spending habits, making it obvious where your money goes.
- **Smart Categorization:** Tag and group transactions to understand your lifestyle costs (e.g., Groceries, Transport, Entertainment).
- **AI-Powered Voice Logging:** Just speak your expenses ("I spent $15 on lunch") and Penny Pal's AI stack automatically parses the amount, category, and date, seamlessly adding it to your dashboard.
- **FinTech Insights & Education:** A built-in blog delivering curated news and articles about the fintech space, empowering users with financial literacy alongside tracking tools.
- **Automated Monthly Reports:** Pushes a high-level email summary of exactly how much and what users spent directly to their inbox, keeping them engaged and informed without requiring them to explicitly open the app.
- **Secure by Default:** Built with end-to-end authentication and Row Level Security to keep your financial data completely private.
- **Responsive Layout:** A mobile-first design approach ensures you can track your money smoothly on the go or at your desk.

## How It Works

Under the hood, Penny Pal relies on a robust architecture to keep things fast and reliable:
- **Frontend Interface:** Built with React and structured with TypeScript, ensuring a snappy, bug-free user experience. UI elements are powered by Tailwind CSS and Shadcn for a minimalist, premium look.
- **Data Layer:** Supabase handles the heavy lifting, providing real-time data synchronization, secure user authentication, and a scalable PostgreSQL database.
- **AI Voice Processing:** Using Supabase Edge Functions coupled with the Groq API (Whisper-large-v3 for speech-to-text and Llama 3 for data extraction), the app seamlessly and securely converts spoken audio into structured financial data.
- **State Management:** Custom React contexts and hooks (like `TransactionsContext`) efficiently handle the data flow across the app so your charts update instantly when a new expense is logged.

## Built With

- **Frontend:** React, TypeScript, Vite
- **Styling:** Tailwind CSS, shadcn/ui, Framer Motion
- **Backend & Auth:** Supabase
- **AI Stack:** Groq API (Whisper-large-v3, Llama 3) via Supabase Edge Functions
- **Data Visualization:** Recharts

## Getting Started

To get the project running locally, follow these straightforward steps:

### Prerequisites

Make sure you have Node.js and npm installed. You will also need a Supabase project set up for the database and authentication.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/penny-pal.git
   cd penny-pal
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure your environment:**
   Create a `.env` file in the root directory and add your Supabase credentials. You can find these in your Supabase project dashboard.
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`.

## A Quick Tour of the Repo

If you're looking around the codebase, here's how things are organized:
- `/src/components` — Reusable UI components, ranging from small buttons to complex chart blocks.
- `/src/pages` — The main views of the application (Dashboard, Settings, Analytics).
- `/src/hooks` — Custom React hooks for specialized logic (e.g., fetching categories or calculating new month roll-overs).
- `/src/contexts` — Global state providers that keep the app's data correctly synced across pages.
- `/supabase` — Backend configuration and edge functions handling server-side tasks.

## Contributing

If you have suggestions for how Penny Pal could be improved, or if you find a bug, please feel free to open an issue or submit a pull request. 

## License

This project is licensed under the MIT License.
