import urllib.request
import json

api_key = "re_jYWvaGaM_JRKsfJPpeRs6nvMnWvqPwcAV"
user_name = "Sam"

html = f"""
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p style="font-size: 16px; color: #374151;">Hi {user_name},</p>
  <p style="font-size: 16px; color: #374151;">Happy Independence Day! 🇬🇭</p>
  <p style="font-size: 16px; color: #374151;">As we celebrate Ghana's independence today, let it also be a powerful reminder of your own journey toward financial independence.</p>
  <p style="font-size: 16px; color: #374151;">Just as our forebears fought for the liberty we enjoy today, every logged expense and saved cedi is a step toward your own true freedom. Keep tracking your progress, keep growing your savings, and enjoy the celebrations!</p>
  <p style="font-size: 16px; color: #374151;">Best,<br/>Sam from Penny Pal</p>
</div>
"""

text = f"""
Hi {user_name},

Happy Independence Day! 🇬🇭

As we celebrate Ghana's independence today, let it also be a powerful reminder of your own journey toward financial independence.

Just as our forebears fought for the liberty we enjoy today, every logged expense and saved cedi is a step toward your own true freedom. Keep tracking your progress, keep growing your savings, and enjoy the celebrations!

Best,
Sam from Penny Pal
"""

data = {
    "from": "Sam from Penny Pal <support@mypennypal.com>",
    "to": ["bigsamcreates@gmail.com"],
    "subject": "Happy Independence Day! 🇬🇭",
    "text": text,
    "html": html
}

# Ensure strictly utf-8 encoded payload
payload = json.dumps(data).encode("utf-8")

req = urllib.request.Request("https://api.resend.com/emails", data=payload, method="POST")
req.add_header("Authorization", f"Bearer {api_key}")
req.add_header("Content-Type", "application/json; charset=utf-8")

try:
    with urllib.request.urlopen(req) as response:
        print(response.read().decode("utf-8"))
except Exception as e:
    print(f"Error: {e}")
