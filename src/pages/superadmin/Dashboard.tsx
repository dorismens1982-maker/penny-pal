import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Activity, TrendingUp, Star, MessageSquare, Zap } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { PartnershipBanner } from '@/components/partnerships/PartnershipBanner';

const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className={`text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {change}
            </p>
        </CardContent>
    </Card>
);

const SuperAdminDashboard = () => {
    const { stats, loading } = useAnalytics();

    const statCards = [
        {
            title: "Total Users",
            value: loading ? "..." : stats.totalUsers.toLocaleString(),
            change: "Lifetime accounts",
            icon: Users,
            trend: "up"
        },
        {
            title: "Active Users",
            value: loading ? "..." : stats.activeUsers.toLocaleString(),
            change: "Currently active",
            icon: Activity,
            trend: "up"
        },
        {
            title: "Blog Posts",
            value: loading ? "..." : stats.totalPosts.toString(),
            change: "Educational content",
            icon: FileText,
            trend: "up"
        },
        {
            title: "Growth Rate",
            value: loading ? "..." : `${stats.growthRate ?? 0}%`,
            change: "Vs last month",
            icon: TrendingUp,
            trend: (stats.growthRate ?? 0) >= 0 ? "up" : "down"
        },
        {
            title: "Avg Voice Credits",
            value: loading ? "..." : (stats.voiceStats?.averageCredits ?? 5).toString(),
            change: "Across all users",
            icon: Star,
            trend: "up"
        },
        {
            title: "Voice Feedback",
            value: loading ? "..." : (stats.voiceStats?.totalFeedback ?? 0).toString(),
            change: "Total suggestions",
            icon: MessageSquare,
            trend: "up"
        },
        {
            title: "Premium Voice",
            value: loading ? "..." : (stats.voiceStats?.premiumUsers ?? 0).toString(),
            change: "Unlimited users",
            icon: Zap,
            trend: "up"
        }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
                <p className="text-slate-500 mt-2">Welcome back, Super Admin. Here's what's happening today.</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
                {statCards.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            {/* Partnership Pitch Area */}
            <div className="w-full">
                <PartnershipBanner theme="dark" />
            </div>

            {/* Analytics Charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>New Users (Last 6 Months)</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            {loading ? (
                                <div className="h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.userGrowth}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            allowDecimals={false}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Bar
                                            dataKey="count"
                                            fill="#4f46e5"
                                            radius={[4, 4, 0, 0]}
                                            barSize={32}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {loading ? (
                                <p className="text-sm text-muted-foreground">Loading activity...</p>
                            ) : stats.recentActivity.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No recent activity.</p>
                            ) : (
                                stats.recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            {activity.id.includes('feedback') ? (
                                                <MessageSquare className="w-4 h-4 text-blue-600" />
                                            ) : activity.type === 'user_signup' ? (
                                                <Users className="w-4 h-4 text-blue-600" />
                                            ) : (
                                                <FileText className="w-4 h-4 text-blue-600" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{activity.description}</p>
                                            <p className="text-xs text-slate-500">
                                                {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Voice Feedback Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        Voice AI Feedback
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
                            ))
                        ) : stats.recentFeedback.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-muted-foreground">
                                No feedback received yet.
                            </div>
                        ) : (
                            stats.recentFeedback.map((f) => (
                                <div key={f.id} className="p-4 rounded-2xl bg-muted/30 border border-muted-foreground/10 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div className="text-xs font-bold text-primary uppercase">{f.userName}</div>
                                        <div className="text-[10px] text-muted-foreground">
                                            {formatDistanceToNow(new Date(f.time), { addSuffix: true })}
                                        </div>
                                    </div>
                                    <p className="text-sm text-foreground italic">"{f.message}"</p>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SuperAdminDashboard;
