const RESEND_API_KEY = 're_jYWvaGaM_JRKsfJPpeRs6nvMnWvqPwcAV';
const SENDER_EMAIL = 'Penny Pal <support@mypennypal.com>';
const IMG_URL = 'https://res.cloudinary.com/dopscbnty/image/upload/v1772391423/ghana_month_header_vkowr4.png';
const userName = 'Sam'; // Testing name for "bigsamcreates@gmail.com"

const html = `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
  <div style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
    <img src="${IMG_URL}" alt="Happy Ghana Month!" style="width: 100%; height: auto; display: block;" />
    <div style="padding: 30px; text-align: center;">
      <h1 style="color: #16a34a; margin-bottom: 15px; font-size: 26px;">Happy Independence Day! 🇬🇭</h1>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Hi <strong>${userName}</strong>, <br/><br/>
        Happy 6th March! 🎉
        <br/><br/>
        Today, as we celebrate Ghana's independence and our rich heritage, let it also be a powerful reminder of your own journey toward financial independence. 
        <br/><br/>
        Just as our forebears fought for the liberty we enjoy today, every logged expense and saved cedi is a step toward your own true freedom. Keep tracking, keep growing, and enjoy the celebrations!
      </p>
      <div style="margin: 35px 0;">
        <a href="https://www.mypennypal.com" style="background-color: #eab308; color: white; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">Track Your Finances</a>
      </div>
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        Akwaaba 🇬🇭 to a month of prosperity!<br/>
        <strong>The Penny Pal Team</strong>
      </p>
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #f3f4f6; margin-top: 20px;">
         <img src="https://res.cloudinary.com/dvyj0bgui/image/upload/f_auto,q_auto/v1765476493/penny_avatar_jffsr9.jpg" alt="Penny Pal" style="width: 40px; height: 40px; border-radius: 50%; display: inline-block;" />
      </div>
    </div>
  </div>
</div>
`;

const text = `Happy Independence Day, ${userName}! 🇬🇭

Today, as we celebrate Ghana's independence, our rich culture, and the freedom of our beloved nation, we are reminded of another kind of freedom: Financial Independence.

Just as our forebears fought for the liberty we enjoy today, every cedi you save, every expense you track, and every smart financial choice you make is a bold step toward your own true freedom.

Let today inspire you to keep building a solid financial future. Enjoy the celebrations, wave the flag high, and let's make it count!

Happy 6th March!

With love,
The Penny Pal Team`;

async function sendEmail() {
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': \`Bearer \${RESEND_API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: SENDER_EMAIL,
      to: ['bigsamcreates@gmail.com'],
      subject: 'Happy Independence Day! 🇬🇭 Celebrate Financial Freedom',
      text: text,
      html: html
    })
  });

  const data = await response.json();
  console.log('Response:', JSON.stringify(data, null, 2));
}

sendEmail().catch(console.error);
