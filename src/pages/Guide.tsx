import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    ArrowLeft,
    Wallet,
    TrendingUp,
    PieChart,
    Download,
    Target,
    BarChart3,
    Settings,
    Shield,
    Smartphone,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    Search
} from 'lucide-react';
import { APP_NAME } from '@/config/app';
import { Input } from '@/components/ui/input';

const Guide = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const guideData = [
        {
            id: 'getting-started',
            title: 'Getting Started',
            icon: Sparkles,
            color: 'from-yellow-500 to-orange-500',
            sections: [
                {
                    subtitle: 'Create Your Account',
                    steps: [
                        'Click "Get Started" on the landing page',
                        'Enter your email address and create a secure password',
                        'Verify your email address',
                        'Complete your profile setup'
                    ]
                },
                {
                    subtitle: 'First Login',
                    steps: [
                        'Sign in with your credentials',
                        'You\'ll be taken to the Manage page - your financial command center',
                        'Take a quick tour of the interface to familiarize yourself'
                    ]
                }
            ]
        },
        {
            id: 'managing-transactions',
            title: 'Managing Transactions',
            icon: Wallet,
            color: 'from-blue-500 to-cyan-500',
            sections: [
                {
                    subtitle: 'Adding Transactions',
                    steps: [
                        'Navigate to the "Manage" page from the sidebar',
                        'Click the "Add Transaction" button',
                        'Select transaction type: Income or Expense',
                        'Enter the amount in Ghana Cedis (GH₵)',
                        'Choose or create a category',
                        'Add a description (optional but recommended)',
                        'Select the date of the transaction',
                        'Click "Save" to record your transaction'
                    ]
                },
                {
                    subtitle: 'Editing & Deleting',
                    steps: [
                        'Find the transaction in your list',
                        'Click the edit icon (pencil) to modify details',
                        'Click the delete icon (trash) to remove',
                        'Confirm any deletions when prompted'
                    ]
                }
            ]
        },
        {
            id: 'budgets',
            title: 'Setting Up Budgets',
            icon: Target,
            color: 'from-green-500 to-emerald-500',
            sections: [
                {
                    subtitle: 'Creating a Budget',
                    steps: [
                        'Go to the "Manage" page and find the Budgets section',
                        'Click "Create Budget"',
                        'Select a category to budget for',
                        'Set your budget amount and time period',
                        'Save your budget'
                    ]
                },
                {
                    subtitle: 'Budget Indicators',
                    list: [
                        '🟢 Green: You\'re within budget',
                        '🟡 Yellow: Approaching your limit (80%+)',
                        '🔴 Red: Budget exceeded'
                    ]
                }
            ]
        },
        {
            id: 'analytics',
            title: 'Understanding Analytics',
            icon: BarChart3,
            color: 'from-purple-500 to-pink-500',
            sections: [
                {
                    subtitle: 'Dashboard Metrics',
                    list: [
                        'Total Balance: Your current financial position',
                        'Monthly Income: Total earnings this month',
                        'Monthly Expenses: Total spending this month',
                        'Savings Rate: Percentage of income saved'
                    ]
                },
                {
                    subtitle: 'Charts & Insights',
                    steps: [
                        'View pie charts showing spending by category',
                        'Track trends over time with line graphs',
                        'Visit "Insights" page for AI-powered recommendations',
                        'Compare income vs. expenses month-over-month'
                    ]
                }
            ]
        },
        {
            id: 'categories',
            title: 'Working with Categories',
            icon: PieChart,
            color: 'from-orange-500 to-red-500',
            sections: [
                {
                    subtitle: 'Default Categories',
                    list: [
                        'Food & Dining',
                        'Transportation',
                        'Shopping',
                        'Bills & Utilities',
                        'Entertainment',
                        'Healthcare',
                        'Education',
                        'Savings & Investments'
                    ]
                },
                {
                    subtitle: 'Custom Categories',
                    steps: [
                        'Go to Settings → Categories',
                        'Click "Add Category"',
                        'Enter name and choose icon/color',
                        'Save and use in transactions'
                    ]
                }
            ]
        },
        {
            id: 'exporting',
            title: 'Exporting Your Data',
            icon: Download,
            color: 'from-indigo-500 to-blue-500',
            sections: [
                {
                    subtitle: 'How to Export',
                    steps: [
                        'Navigate to Settings',
                        'Click "Export Data"',
                        'Choose date range and format (CSV or PDF)',
                        'Click "Download"'
                    ]
                },
                {
                    subtitle: 'What\'s Included',
                    list: [
                        'All transactions in selected date range',
                        'Transaction details: date, amount, category, description',
                        'Budget information',
                        'Summary statistics'
                    ]
                }
            ]
        },
        {
            id: 'settings',
            title: 'Customizing Settings',
            icon: Settings,
            color: 'from-gray-500 to-slate-600',
            sections: [
                {
                    subtitle: 'Profile Settings',
                    list: [
                        'Update name and email',
                        'Change password',
                        'Set preferred currency (default: GH₵)',
                        'Configure notifications'
                    ]
                },
                {
                    subtitle: 'Display Preferences',
                    list: [
                        'Toggle Light/Dark mode',
                        'Adjust date format',
                        'Set fiscal month start date',
                        'Customize dashboard widgets'
                    ]
                }
            ]
        },
        {
            id: 'tips',
            title: 'Tips & Best Practices',
            icon: CheckCircle2,
            color: 'from-teal-500 to-green-500',
            sections: [
                {
                    subtitle: 'Daily Habits',
                    list: [
                        'Record transactions immediately',
                        'Review dashboard every morning',
                        'Spend 5 minutes daily on updates',
                        'Use descriptive transaction names'
                    ]
                },
                {
                    subtitle: 'Smart Budgeting',
                    list: [
                        '50/30/20 rule: 50% needs, 30% wants, 20% savings',
                        'Start with realistic budgets',
                        'Build an emergency fund',
                        'Track irregular expenses'
                    ]
                }
            ]
        },
        {
            id: 'security',
            title: 'Security & Privacy',
            icon: Shield,
            color: 'from-red-500 to-pink-500',
            sections: [
                {
                    subtitle: 'Your Data is Safe',
                    list: [
                        'All data encrypted in transit and at rest',
                        'We never share your financial information',
                        'Regular security audits',
                        'Two-factor authentication available'
                    ]
                },
                {
                    subtitle: 'Security Tips',
                    steps: [
                        'Use a strong, unique password',
                        'Enable two-factor authentication',
                        'Never share login credentials',
                        'Log out on shared devices',
                        'Review account activity regularly'
                    ]
                }
            ]
        },
        {
            id: 'mobile',
            title: 'Mobile Experience',
            icon: Smartphone,
            color: 'from-cyan-500 to-blue-500',
            sections: [
                {
                    subtitle: 'Mobile Features',
                    list: [
                        'Fully responsive on all devices',
                        'Touch-optimized interface',
                        'Fast loading times',
                        'Add to home screen for quick access'
                    ]
                },
                {
                    subtitle: 'Mobile Tips',
                    steps: [
                        'Use landscape mode for better chart viewing',
                        'Swipe gestures for navigation',
                        'Pull to refresh data'
                    ]
                }
            ]
        },
        {
            id: 'troubleshooting',
            title: 'Troubleshooting',
            icon: AlertCircle,
            color: 'from-amber-500 to-orange-500',
            sections: [
                {
                    subtitle: 'Common Issues',
                    list: [
                        'Can\'t log in? → Reset your password',
                        'Transactions not showing? → Refresh the page',
                        'Charts not loading? → Clear browser cache',
                        'Export not working? → Check popup blocker'
                    ]
                },
                {
                    subtitle: 'Getting Help',
                    steps: [
                        'Check this guide for answers',
                        'Visit our FAQ section',
                        'Contact support via email',
                        'Join our community forum'
                    ]
                }
            ]
        }
    ];

    // Filter guide data based on search
    const filteredGuideData = guideData.filter(item =>
        searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sections.some(section =>
            section.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (section.steps && section.steps.some(step => step.toLowerCase().includes(searchQuery.toLowerCase()))) ||
            (section.list && section.list.some(listItem => listItem.toLowerCase().includes(searchQuery.toLowerCase())))
        )
    );

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation Bar */}
            <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/')}
                            className="gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Back</span>
                        </Button>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
                                <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
                            </div>
                            <span className="font-bold text-lg sm:text-xl tracking-tight">{APP_NAME}</span>
                        </div>
                    </div>
                    <Button onClick={() => navigate('/')} size="sm" className="hidden sm:flex">
                        Get Started
                    </Button>
                </div>
            </nav>

            {/* Hero Section - Compact */}
            <section className="relative py-12 md:py-16 overflow-hidden bg-gradient-to-br from-background via-background/95 to-primary/5">
                <div className="absolute top-10 right-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl -z-10" />

                <div className="container px-4 md:px-6">
                    <div className="max-w-3xl mx-auto text-center space-y-4">
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
                            How to Use{' '}
                            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                {APP_NAME}
                            </span>
                        </h1>
                        <p className="text-base md:text-lg text-muted-foreground">
                            Your complete guide to mastering your finances
                        </p>
                    </div>
                </div>
            </section>

            {/* Search Bar */}
            <section className="py-6 bg-muted/30 sticky top-16 z-40 border-b border-border">
                <div className="container px-4 md:px-6">
                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search guide topics..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-12"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Accordion Guide Content */}
            <section className="py-8 md:py-12">
                <div className="container px-4 md:px-6">
                    <div className="max-w-4xl mx-auto">
                        {filteredGuideData.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                            </div>
                        ) : (
                            <Accordion type="single" collapsible className="space-y-4">
                                {filteredGuideData.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <AccordionItem
                                            key={item.id}
                                            value={item.id}
                                            className="border border-border rounded-xl overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <AccordionTrigger className="px-4 md:px-6 py-4 hover:no-underline group">
                                                <div className="flex items-center gap-3 md:gap-4 text-left">
                                                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                                        <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                                    </div>
                                                    <span className="font-semibold text-base md:text-lg">{item.title}</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-4 md:px-6 pb-6">
                                                <div className="space-y-6 pt-2">
                                                    {item.sections.map((section, idx) => (
                                                        <div key={idx} className="space-y-3">
                                                            <h3 className="text-sm md:text-base font-semibold text-primary">
                                                                {section.subtitle}
                                                            </h3>

                                                            {section.steps && (
                                                                <ol className="space-y-2">
                                                                    {section.steps.map((step, stepIdx) => (
                                                                        <li key={stepIdx} className="flex gap-3 text-sm md:text-base">
                                                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center mt-0.5">
                                                                                {stepIdx + 1}
                                                                            </span>
                                                                            <span className="text-foreground/80 leading-relaxed">{step}</span>
                                                                        </li>
                                                                    ))}
                                                                </ol>
                                                            )}

                                                            {section.list && (
                                                                <ul className="space-y-2">
                                                                    {section.list.map((listItem, listIdx) => (
                                                                        <li key={listIdx} className="flex items-start gap-3 text-sm md:text-base">
                                                                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                                            <span className="text-foreground/80 leading-relaxed">{listItem}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>
                        )}
                    </div>
                </div>
            </section>

            {/* CTA Section - Compact */}
            <section className="py-12 md:py-16 bg-gradient-to-br from-primary/10 via-accent/10 to-background">
                <div className="container px-4 md:px-6">
                    <div className="max-w-2xl mx-auto text-center space-y-4">
                        <h2 className="text-2xl md:text-3xl font-bold">
                            Ready to Get Started?
                        </h2>
                        <p className="text-sm md:text-base text-muted-foreground">
                            Start your journey to financial freedom with {APP_NAME}
                        </p>
                        <Button
                            size="lg"
                            className="h-12 px-6 md:h-14 md:px-8 gap-2"
                            onClick={() => navigate('/')}
                        >
                            Get Started Now
                            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 rotate-180" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-6 border-t border-border bg-background">
                <div className="container px-4 text-center text-xs md:text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Guide;
