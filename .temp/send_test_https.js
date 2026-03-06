const https = require('https');

const RESEND_API_KEY = 're_jYWvaGaM_JRKsfJPpeRs6nvMnWvqPwcAV';
const userName = 'Sam';

const html = `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p style="font-size: 16px; color: #374151;">Hi ${userName},</p>
  <p style="font-size: 16px; color: #374151;">Happy Independence Day! 🇬🇭</p>
  <p style="font-size: 16px; color: #374151;">As we celebrate Ghana's independence today, let it also be a powerful reminder of your own journey toward financial independence.</p>
  <p style="font-size: 16px; color: #374151;">Just as our forebears fought for the liberty we enjoy today, every logged expense and saved cedi is a step toward your own true freedom. Keep tracking your progress, keep growing your savings, and enjoy the celebrations!</p>
  <p style="font-size: 16px; color: #374151;">Best,<br/>Sam from Penny Pal</p>
</div>
`;

const text = `
Hi ${userName},

Happy Independence Day! 🇬🇭

As we celebrate Ghana's independence today, let it also be a powerful reminder of your own journey toward financial independence.

Just as our forebears fought for the liberty we enjoy today, every logged expense and saved cedi is a step toward your own true freedom. Keep tracking your progress, keep growing your savings, and enjoy the celebrations!

Best,
Sam from Penny Pal
`;

const data = JSON.stringify({
  from: 'Sam from Penny Pal <support@mypennypal.com>',
  to: ['bigsamcreates@gmail.com'],
  subject: 'Happy Independence Day!',
  text: text,
  html: html
});

const options = {
  hostname: 'api.resend.com',
  path: '/emails',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RESEND_API_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data, 'utf8')
  }
};

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log(responseData);
  });
});

req.on('error', (e) => {
  console.error(e);
});

// Explicitly send the payload as utf8 string
req.write(data, 'utf8');
req.end();
