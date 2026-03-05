import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface InboundEmailPayload {
    from: string;
    to: string[];
    subject: string;
    html?: string;
    text?: string;
    headers?: Record<string, string>;
}

export default async function handler(req: Request): Promise<Response> {
    // Only allow POST requests from Resend
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const payload: InboundEmailPayload = await req.json();

        const { from, subject, html, text } = payload;

        // Forward the email to your Gmail inbox
        const { error } = await resend.emails.send({
            from: "Penny Pal Forwarding <hello@mypennypal.com>",
            to: ["usemypennypal@gmail.com"],
            subject: `[Forwarded] ${subject || "(no subject)"}`,
            html:
                html ||
                `<p><strong>From:</strong> ${from}</p><hr/><p>${text || "(no body)"}</p>`,
            text: text
                ? `From: ${from}\n\n${text}`
                : `From: ${from}\n\n(no plain text body)`,
            replyTo: from, // So you can reply directly to the original sender
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
