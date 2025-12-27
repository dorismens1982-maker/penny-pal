# Setting Up Automated Emails with Supabase Cron

This guide explains how to set up automated email campaigns using Supabase Edge Functions and cron jobs.

---

## 📋 Prerequisites

- Supabase project (Pro plan required for cron jobs)
- Resend API key configured in Supabase secrets
- Edge Functions deployed

---

## 🚀 Quick Setup

### Step 1: Deploy the Edge Function

```bash
# Navigate to your project
cd penny-pal

# Deploy the weekly summary function
supabase functions deploy send-weekly-summary
```

### Step 2: Set Up Cron Job in Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **Database** → **Cron Jobs** (or **Extensions** → **pg_cron**)
3. Click **Create a new cron job**

**For Weekly Summary (Every Monday at 8 AM):**
```sql
SELECT cron.schedule(
    'send-weekly-summary',           -- Job name
    '0 8 * * 1',                      -- Cron expression (Mon 8 AM)
    $$
    SELECT
      net.http_post(
          url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-weekly-summary',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
          body:='{}'::jsonb
      ) as request_id;
    $$
);
```

**Replace:**
- `YOUR_PROJECT_REF` with your Supabase project reference
- `YOUR_ANON_KEY` with your Supabase anon key

---

## 📅 Cron Schedule Examples

### Weekly Summary (Monday 8 AM)
```
0 8 * * 1
```

### Monthly Recap (1st of month, 9 AM)
```
0 9 1 * *
```

### Financial Tips (Tuesday 10 AM)
```
0 10 * * 2
```

### Daily Inactivity Check (Every day 10 AM)
```
0 10 * * *
```

---

## 🧪 Testing the Function

### Test Locally
```bash
# Start Supabase locally
supabase start

# Serve the function
supabase functions serve send-weekly-summary

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-weekly-summary' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json'
```

### Test in Production
```bash
# Invoke the function manually
supabase functions invoke send-weekly-summary
```

---

## 📊 Monitoring Cron Jobs

### View Active Cron Jobs
```sql
SELECT * FROM cron.job;
```

### View Cron Job History
```sql
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;
```

### Delete a Cron Job
```sql
SELECT cron.unschedule('send-weekly-summary');
```

---

## 🔧 Troubleshooting

### Emails Not Sending?

1. **Check Edge Function Logs:**
   - Go to Supabase Dashboard → Edge Functions → Logs
   - Look for errors in the `send-weekly-summary` function

2. **Verify Resend API Key:**
   ```bash
   # Check if secret is set
   supabase secrets list
   ```

3. **Check Cron Job Execution:**
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE jobname = 'send-weekly-summary'
   ORDER BY start_time DESC;
   ```

4. **Test Function Manually:**
   ```bash
   supabase functions invoke send-weekly-summary --debug
   ```

### Common Issues

**Issue:** Cron job not running
- **Solution:** Ensure you're on Supabase Pro plan
- **Solution:** Check cron expression syntax

**Issue:** Function timeout
- **Solution:** Increase function timeout in Supabase settings
- **Solution:** Batch process users (send emails in chunks)

**Issue:** Rate limiting from Resend
- **Solution:** Add delays between emails
- **Solution:** Upgrade Resend plan

---

## 📈 Best Practices

1. **Start Small:** Test with a small group first
2. **Monitor Metrics:** Track open rates, click rates, unsubscribes
3. **Respect Timezones:** Consider user timezones for send times
4. **Batch Processing:** For large user bases, process in batches
5. **Error Handling:** Log failures and retry logic
6. **Unsubscribe:** Always include unsubscribe option

---

## 🔐 Security Notes

- Never commit API keys to version control
- Use Supabase secrets for sensitive data
- Validate all user data before sending emails
- Implement rate limiting to prevent abuse

---

## 📝 Next Steps

1. ✅ Deploy `send-weekly-summary` function
2. ✅ Set up Monday 8 AM cron job
3. ⏳ Monitor first week's performance
4. ⏳ Implement monthly recap automation
5. ⏳ Add inactivity reminders
6. ⏳ Set up budget alerts

---

## 🆘 Need Help?

- [Supabase Cron Documentation](https://supabase.com/docs/guides/database/extensions/pg_cron)
- [Resend Documentation](https://resend.com/docs)
- Check Edge Function logs in Supabase Dashboard
