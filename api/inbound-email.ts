import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface InboundEmailPayload {
    from: string;
    to: string[];
    subject: string;
    html?: string;
    text?: string;
    headers?: Record<string, string>;
    // The actual structure sent by Resend is often nested or different.
    // Based on Resend docs:
    // https://resend.com/docs/dashboard/webhooks/webhook-events#email-received
    // Actually, for Inbound routing it's often Form data or a specific JSON structure.
    // Let's make it robust to handle both nested 'data' or flat payload.
    // We'll also support the most common inbound payload keys.
    From?: string;
    To?: string;
    Subject?: string;
    HtmlBody?: string;
    TextBody?: string;
}

export default async function handler(req: Request): Promise<Response> {
    // Only allow POST requests from Resend
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const payload: any = await req.json();

        // Resend sends webhooks with a 'data' object usually, but also might be flat.
        // Also the keys might be capitalized (From vs from) depending on the integration type.
        const actualFrom = payload.From || payload.from || payload.data?.from || "Unknown Sender";
        const actualSubject = payload.Subject || payload.subject || payload.data?.subject || "(no subject)";
        const actualHtml = payload.HtmlBody || payload.html || payload.data?.html || "";
        const actualText = payload.TextBody || payload.text || payload.data?.text || "";

        // Forward the email to your Gmail inbox
        const { error } = await resend.emails.send({
            from: "Penny Pal Forwarding <hello@mypennypal.com>",
            to: ["usemypennypal@gmail.com"],
            subject: `[Forwarded] ${actualSubject}`,
            html:
                actualHtml ||
                `<p><strong>From:</strong> ${actualFrom}</p><hr/><p>${actualText || "(no body)"}</p>`,
            text: actualText
                ? `From: ${actualFrom}\n\n${actualText}`
                : `From: ${actualFrom}\n\n(no plain text body)`,
            replyTo: actualFrom !== "Unknown Sender" ? actualFrom : undefined, // So you can reply directly to the original sender
        });

        if (error) {
            console.error("Resend error:", error);
            return new Response(JSON.stringify({ error }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("Inbound email handler error:", err);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export const config = {
    runtime: "edge",
};
