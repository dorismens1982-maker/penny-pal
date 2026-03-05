import { LegalLayout } from '@/layouts/LegalLayout';
import { APP_NAME, COMPANY_NAME } from '@/config/app';

const PrivacyPolicy = () => {
    return (
        <LegalLayout
            title="Privacy Policy"
            subtitle="We value your privacy. Here's exactly how we handle your data."
            lastUpdated="March 1, 2026"
        >
            <section className="space-y-10 text-foreground/80 text-sm md:text-base leading-relaxed">

                <div className="p-5 rounded-xl bg-green-500/10 border border-green-500/20 text-sm">
                    <strong className="text-foreground">Our commitment:</strong> We don't sell your data. We don't use it for advertising. Your financial records are yours — we only use them to make the product work for you.
                </div>

                {[
                    {
                        title: '1. Who We Are',
                        body: `${APP_NAME} is operated by ${COMPANY_NAME}, a technology company based in Accra, Ghana. We build personal finance tools for individuals and businesses across Africa. You can reach us at hello@mypennypal.com for any privacy-related concerns.`
                    },
                    {
                        title: '2. What Data We Collect',
                        body: 'We collect the following categories of personal data:',
                        sections: [
                            {
                                sub: 'Account Information',
                                points: ['Name and display name', 'Email address', 'Password (hashed — we never see your plain-text password)']
                            },
                            {
                                sub: 'Financial Data You Enter',
                                points: ['Transaction amounts, categories, and descriptions', 'Budget limits and goals', 'Savings records']
                            },
                            {
                                sub: 'Technical Data',
                                points: ['Browser type and version', 'Device and operating system', 'IP address (for security purposes)', 'Pages visited and time spent (aggregated, anonymised)']
                            }
                        ]
                    },
                    {
                        title: '3. How We Use Your Data',
                        points: [
                            'To provide, maintain, and improve the Service.',
                            'To personalise your experience and financial insights.',
                            'To send important service notifications (account activity, security alerts).',
                            'To analyse usage trends to improve the product (anonymised only).',
                            'To comply with legal obligations.',
                        ]
                    },
                    {
                        title: '4. Data Storage & Security',
                        body: `Your data is stored securely on Supabase infrastructure hosted on Google Cloud Platform. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We conduct regular security reviews and follow industry best practices to protect your information.`
                    },
                    {
                        title: '5. Data Sharing',
                        body: `We do not sell, rent, or trade your personal information to third parties. We may share data in the following limited circumstances:`,
                        points: [
                            'With service providers who assist us in operating the platform (e.g., cloud hosting, email delivery) — under strict data processing agreements.',
                            'When required by law, court order, or government authority in Ghana or another applicable jurisdiction.',
                            'To protect the rights, property, or safety of our users or the public.',
                        ]
                    },
                    {
                        title: '6. Your Rights',
                        body: 'You have the right to:',
                        points: [
                            'Access: Request a copy of all personal data we hold about you.',
                            'Rectification: Correct inaccurate or incomplete data.',
                            'Erasure: Request deletion of your account and all associated data.',
                            'Portability: Export your transaction data in CSV format at any time from Settings.',
                            'Objection: Object to how we process your data.',
                        ]
                    },
                    {
                        title: '7. Cookies',
                        body: `We use strictly necessary cookies to keep you logged in and maintain your session. We may also use analytics cookies to understand how users interact with the platform. For full details on our cookie usage, please see our Cookie Policy.`
                    },
                    {
                        title: '8. Children\'s Privacy',
                        body: `Our Service is not directed to anyone under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal data from a child under 13 without parental consent, we take steps to remove that information from our servers.`
                    },
                    {
                        title: '9. Changes to This Policy',
                        body: `We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and, where appropriate, by sending you an email. Changes take effect 30 days after posting unless the change is required by law, in which case it takes effect immediately.`
                    },
                    {
                        title: '10. Contact & Data Requests',
                        body: `For all privacy-related enquiries, to exercise your rights, or to report a concern:\n\n📧 hello@mypennypal.com\n📍 ${COMPANY_NAME}, Accra, Ghana\n\nWe aim to respond to all requests within 30 days.`
                    }
                ].map(({ title, body, points, sections }: any) => (
                    <div key={title} className="space-y-3">
                        <h2 className="text-xl font-bold text-foreground">{title}</h2>
                        {body && <p className="whitespace-pre-line">{body}</p>}
                        {sections && sections.map((s: any) => (
                            <div key={s.sub} className="space-y-2 pl-2">
                                <h3 className="font-semibold text-foreground/90">{s.sub}</h3>
                                <ul className="space-y-1.5 pl-4">
                                    {s.points.map((p: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                            <span>{p}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                        {points && (
                            <ul className="space-y-2 pl-4">
                                {points.map((point: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </section>
        </LegalLayout>
    );
};

export default PrivacyPolicy;
