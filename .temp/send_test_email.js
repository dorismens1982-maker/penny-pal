const fs = require('fs');

const RESEND_API_KEY = 're_jYWvaGaM_JRKsfJPpeRs6nvMnWvqPwcAV';
const SENDER_EMAIL = 'Sam from Penny Pal <support@mypennypal.com>';
const IMG_URL = 'https://res.cloudinary.com/dopscbnty/image/upload/v1772391423/ghana_month_header_vkowr4.png';
const userName = 'Sam';

const html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p style="font-size: 16px; color: #374151;">Hi ${userName},</p>
  <p style="font-size: 16px; color: #374151;">Happy Independence Day! 🇬🇭</p>
  <p style="font-size: 16px; color: #374151;">As we celebrate Ghana's independence today, let it also be a powerful reminder of your own journey toward financial independence.</p>
  <p style="font-size: 16px; color: #374151;">Just as our forebears fought for the liberty we enjoy today, every logged expense and saved cedi is a step toward your own true freedom. Keep tracking your progress, keep growing your savings, and enjoy the celebrations!</p>
  <p style="font-size: 16px; color: #374151;">Best,<br/>Sam from Penny Pal</p>
</div>`;

const text = `Hi ${userName},

Happy Independence Day! 🇬🇭

As we celebrate Ghana's independence today, let it also be a powerful reminder of your own journey toward financial independence.

Just as our forebears fought for the liberty we enjoy today, every logged expense and saved cedi is a step toward your own true freedom. Keep tracking your progress, keep growing your savings, and enjoy the celebrations!

Best,
Sam from Penny Pal`;

async function sendEmail() {
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: SENDER_EMAIL,
            to: ['bigsamcreates@gmail.com'],
            subject: 'Happy Independence Day!',
            text: text,
            html: html
        })
    });

    const data = await response.json();
    console.log('Response:', data);
}

sendEmail().catch(console.error);
