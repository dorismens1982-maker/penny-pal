# Setting Up Free Automated Email Triggers

Since Supabase cron jobs require a Pro plan, here are two excellent **free** alternatives to trigger your weekly "Penny Pal Motivation" emails.

---

## Option 1: Cron-job.org (Easiest - Recommended)

**Cron-job.org** is a free service that visits your web address at scheduled times. Perfect for hitting your Supabase Edge Function URL.

### 1. Get Your Edge Function URL
1. Deploy your function: `supabase functions deploy send-weekly-summary`
2. Get the function URL from your terminal output or Supabase Dashboard (e.g., `https://xyz.supabase.co/functions/v1/send-weekly-summary`)
3. **Important:** Since your function is protected, you need your `anon` key.

### 2. Set Up the Job
1. Sign up for free at [cron-job.org](https://cron-job.org/)
2. Click **"Create Cronjob"**
3. **URL:** Paste your Edge Function URL
4. **Execution Schedule:** Select "Every Monday" at "08:00"
5. **Advanced:**
   - Method: `POST`
   - Headers: Add the following header:
     ```
     Authorization: Bearer YOUR_SUPABASE_ANON_KEY
     Content-Type: application/json
     ```
6. Click **Create**

🎉 Done! Cron-job.org will now trigger your email function every Monday for free.

---

## Option 2: GitHub Actions (For Developers)

If you host your code on GitHub, you can use "GitHub Actions" to run a weekly trigger script for free.

### 1. Create the Workflow File
Create a new file in your project: `.github/workflows/weekly-email.yml`

```yaml
name: Send Weekly Emails

on:
  schedule:
    # Runs at 08:00 UTC every Monday
    - cron: '0 8 * * 1'
  workflow_dispatch: # Allows manual triggering from GitHub UI

jobs:
  trigger-email:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Edge Function
        run: |
          curl -X POST '${{ secrets.SUPABASE_FUNCTION_URL }}' \
          -H 'Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}' \
          -H 'Content-Type: application/json'
```

### 2. Configure Secrets
1. Go to your GitHub Repository Settings → **Secrets and variables** → **Actions**
2. Add two secrets:
   - `SUPABASE_FUNCTION_URL`: Your full Edge Function URL
   - `SUPABASE_ANON_KEY`: Your Supabase Anon Key

🎉 Done! GitHub will wake up every Monday and trigger your function.

---

## ⚡ Summary of Changes

We simplified the weekly email to be a **"Weekly Motivation Boost"**:
- **Removed:** Financial stats (Income, Expenses, Net Balance)
- **Added:** Rotating motivational financial tips
- **Why:** Keeps the email generic but consistent, encouraging users to log in without needing complex data processing every week.
