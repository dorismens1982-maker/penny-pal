import { LegalLayout } from '@/layouts/LegalLayout';
import { APP_NAME } from '@/config/app';

const CookiePolicy = () => {
    const cookieTable = [
        { name: 'supabase-auth-token', type: 'Essential', purpose: 'Keeps you logged in to your account', duration: 'Session' },
        { name: 'theme-preference', type: 'Functional', purpose: 'Remembers your light/dark mode preference', duration: '1 year' },
        { name: '_ga, _gid', type: 'Analytics', purpose: 'Anonymised usage statistics via Google Analytics', duration: '2 years / 24h' },
        { name: 'cookie-consent', type: 'Functional', purpose: 'Stores your cookie consent preferences', duration: '1 year' },
    ];

    return (
        <LegalLayout
            title="Cookie Policy"
            subtitle="We use cookies to make Penny Pal work and improve your experience."
            lastUpdated="March 1, 2026"
        >
            <section className="space-y-10 text-foreground/80 text-sm md:text-base leading-relaxed">

                <div className="p-5 rounded-xl bg-accent/10 border border-accent/20 text-sm">
                    <strong className="text-foreground">Short answer:</strong> We use a small number of cookies — mostly essential ones to keep you logged in. We don't use advertising cookies. You can manage your preferences at any time.
                </div>

                {[
                    {
                        title: '1. What Are Cookies?',
                        body: `Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work, or work more efficiently, and to provide information to website owners. Cookies are not viruses or harmful programs.`
                    },
                    {
                        title: '2. Cookies We Use',
                    },
                    {
                        title: '3. Essential Cookies',
                        body: `These cookies are necessary for ${APP_NAME} to function and cannot be switched off. They are usually set only in response to actions you take, such as logging in or setting a preference. Without these cookies, the Service cannot work properly.`
                    },
                    {
                        title: '4. Functional Cookies',
                        body: `These cookies enable us to remember your preferences (such as dark/light mode) and provide enhanced, more personalised features. They do not track your browsing on other sites.`
                    },
                    {
                        title: '5. Analytics Cookies',
                        body: `We use anonymised analytics to understand how users interact with ${APP_NAME} so we can improve the product. Analytics data is never tied to individual users and is never sold. You can opt out of analytics cookies at any time by adjusting your preferences.`
                    },
                    {
                        title: '6. Cookies We Do NOT Use',
                        points: [
                            'Advertising or tracking cookies — we do not run ads.',
                            'Third-party social network tracking cookies.',
                            'Cookies that track you across other websites.',
                        ]
                    },
                    {
                        title: '7. Managing Your Cookie Preferences',
                        body: `You can control and/or delete cookies at any time. You can delete all cookies that are already on your device, and you can set most browsers to prevent them from being placed. However, if you do this you may have to manually adjust some preferences every time you visit and some services and functionalities may not work.`,
                        points: [
                            'Chrome: Settings → Privacy & Security → Cookies',
                            'Firefox: Preferences → Privacy & Security',
                            'Safari: Preferences → Privacy',
                            'Edge: Settings → Cookies & Site Permissions',
                        ]
                    },
                    {
                        title: '8. Updates to This Policy',
                        body: `We may update this Cookie Policy from time to time to reflect changes in technology or legal requirements. The "Last updated" date at the top of this page will reflect the most recent revision.`
                    },
                    {
                        title: '9. Contact Us',
                        body: `For any questions about how we use cookies:\n\n📧 hello@mypennypal.com`
                    }
                ].map(({ title, body, points }: any) => (
                    <div key={title} className="space-y-3">
                        <h2 className="text-xl font-bold text-foreground">{title}</h2>
                        {body && <p className="whitespace-pre-line">{body}</p>}
                        {title === '2. Cookies We Use' && (
                            <div className="overflow-x-auto rounded-xl border border-border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            {['Cookie Name', 'Type', 'Purpose', 'Duration'].map(h => (
                                                <th key={h} className="px-4 py-3 text-left font-semibold text-foreground/80 text-xs uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {cookieTable.map(row => (
                                            <tr key={row.name} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-4 py-3 font-mono text-xs text-primary">{row.name}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${row.type === 'Essential' ? 'bg-green-500/10 text-green-600' : row.type === 'Analytics' ? 'bg-blue-500/10 text-blue-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                                        {row.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{row.purpose}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{row.duration}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {points && (
                            <ul className="space-y-2 pl-4">
                                {points.map((point: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
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

export default CookiePolicy;
