import { LegalLayout } from '@/layouts/LegalLayout';
import { APP_NAME, COMPANY_NAME } from '@/config/app';

const TermsOfService = () => {
    return (
        <LegalLayout
            title="Terms of Service"
            subtitle="Please read these terms carefully before using Penny Pal."
            lastUpdated="March 1, 2026"
        >
            <section className="space-y-10 text-foreground/80 text-sm md:text-base leading-relaxed">

                <div className="p-5 rounded-xl bg-primary/5 border border-primary/20 text-sm">
                    <strong className="text-foreground">Summary:</strong> By signing up and using {APP_NAME}, you agree to these terms. We provide financial tracking tools for personal use. Your data belongs to you. We don't sell it.
                </div>

                {[
                    {
                        title: '1. Acceptance of Terms',
                        body: `By accessing or using ${APP_NAME} ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you do not have permission to access the Service. These terms apply to all visitors, users, and others who access or use the Service.`
                    },
                    {
                        title: '2. Description of Service',
                        body: `${APP_NAME} is a personal finance management platform designed to help users in Ghana and across Africa track their income and expenses, set budgets, and gain insights into their financial habits. The Service is provided by ${COMPANY_NAME}.`
                    },
                    {
                        title: '3. User Accounts',
                        points: [
                            `You must be at least 13 years old to create an account.`,
                            `You are responsible for maintaining the confidentiality of your login credentials.`,
                            `You agree to provide accurate, current, and complete information during registration.`,
                            `You are responsible for all activities that occur under your account.`,
                            `${APP_NAME} reserves the right to terminate accounts that violate these terms.`,
                        ]
                    },
                    {
                        title: '4. Acceptable Use',
                        body: `You agree not to use the Service to:`,
                        points: [
                            'Engage in fraudulent, misleading, or deceptive activities.',
                            'Attempt to gain unauthorized access to any part of the Service.',
                            'Upload malicious code, viruses, or any disruptive software.',
                            'Violate any applicable laws or regulations in Ghana or your jurisdiction.',
                            'Use the Service for commercial gain without our prior written consent.'
                        ]
                    },
                    {
                        title: '5. Financial Information Disclaimer',
                        body: `${APP_NAME} is a financial tracking tool and does not constitute financial advice. The information provided on the platform is for personal record-keeping purposes only. We are not a licensed financial advisor, bank, or investment firm. Always consult a qualified financial professional before making significant financial decisions.`
                    },
                    {
                        title: '6. Intellectual Property',
                        body: `The Service and its original content, features, and functionality are and will remain the exclusive property of ${COMPANY_NAME}. The Service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of ${COMPANY_NAME}.`
                    },
                    {
                        title: '7. Termination',
                        body: `We reserve the right to terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach these Terms. Upon termination, your right to use the Service will immediately cease. You may export your data at any time before termination via the Settings page.`
                    },
                    {
                        title: '8. Limitation of Liability',
                        body: `In no event shall ${COMPANY_NAME}, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.`
                    },
                    {
                        title: '9. Changes to Terms',
                        body: `We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days notice before new terms taking effect by posting the new Terms on this page and updating the "Last updated" date. Your continued use of the Service after changes take effect constitutes acceptance of the new Terms.`
                    },
                    {
                        title: '10. Governing Law',
                        body: `These Terms shall be governed and construed in accordance with the laws of the Republic of Ghana, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts of Ghana.`
                    },
                    {
                        title: '11. Contact Us',
                        body: `If you have any questions about these Terms, please contact us:\n\n📧 hello@mypennypal.com\n📍 Accra, Ghana`
                    },
                ].map(({ title, body, points }) => (
                    <div key={title} className="space-y-3">
                        <h2 className="text-xl font-bold text-foreground">{title}</h2>
                        {body && <p className="whitespace-pre-line">{body}</p>}
                        {points && (
                            <ul className="space-y-2 pl-4">
                                {points.map((point, i) => (
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

export default TermsOfService;
