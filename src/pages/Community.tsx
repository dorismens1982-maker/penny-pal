import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { MessageCircle, Users, Image as ImageIcon, Sparkles } from 'lucide-react';

const Community = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleJoinWaitlist = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            // In a real app, send to Supabase waitlist table
            setSubscribed(true);
            setTimeout(() => {
                setSubscribed(false);
                setEmail('');
            }, 3000);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen relative bg-slate-50">
                {/* Animated Gradient Background */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden h-screen w-screen z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-income/5 rounded-full blur-[100px]" />
                </div>

                <div className="container max-w-6xl mx-auto px-4 mt-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[calc(100vh-120px)] pb-20">

                        {/* Left Column: Content */}
                        <div className="space-y-8 max-w-xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm">
                                <Sparkles className="w-4 h-4" />
                                <span>Coming Soon</span>
                            </div>

                            <div className="space-y-4">
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                                    A space to share, connect, and grow.
                                </h1>
                                <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                                    We are building a dedicated community forum where you can share insights, post images, discuss fintech trends, and connect with other builders and learners across Africa.
                                </p>
                            </div>

                            {/* Waitlist Form */}
                            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 max-w-md">
                                <form onSubmit={handleJoinWaitlist} className="flex gap-2">
                                    <Input
                                        type="email"
                                        placeholder="Enter your email to get early access"
                                        className="border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-12"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="bg-slate-900 text-white px-6 rounded-xl font-semibold hover:bg-slate-800 transition-colors whitespace-nowrap h-12 flex items-center justify-center shrink-0 min-w-[120px]"
                                    >
                                        {subscribed ? 'Joined! 🎉' : 'Join Waitlist'}
                                    </button>
                                </form>
                            </div>

                            {/* Feature Hints */}
                            <div className="flex gap-6 pt-4 border-t border-slate-200">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <MessageCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">Discussions</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500">
                                    <ImageIcon className="w-5 h-5" />
                                    <span className="text-sm font-medium">Media Sharing</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Users className="w-5 h-5" />
                                    <span className="text-sm font-medium">Networking</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Visual Wireframe / Blurred Preview */}
                        <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square">
                            {/* Abstract decorative elements */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-white rounded-[3rem] shadow-xl border border-white rotate-3 transition-transform hover:rotate-6 duration-700" />
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-3xl rounded-[3rem] shadow-sm border border-white/50 -rotate-3 transition-transform hover:-rotate-0 duration-700 flex items-center justify-center overflow-hidden">

                                {/* Faux UI Grid indicating a forum feed */}
                                <div className="w-full h-full p-8 md:p-12 flex flex-col gap-6 opacity-40">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-200 animate-pulse" />
                                        <div className="space-y-2 flex-1">
                                            <div className="h-4 bg-slate-200 rounded-md w-1/3 animate-pulse" />
                                            <div className="h-3 bg-slate-100 rounded-md w-1/4 animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="h-32 rounded-2xl bg-slate-200 w-full animate-pulse flex items-center justify-center">
                                        <ImageIcon className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-4 bg-slate-200 rounded-md w-full animate-pulse" />
                                        <div className="h-4 bg-slate-200 rounded-md w-5/6 animate-pulse" />
                                        <div className="h-4 bg-slate-200 rounded-md w-4/6 animate-pulse" />
                                    </div>
                                </div>

                                {/* Glassmorphic Overlay Text */}
                                <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-md">
                                    <div className="px-8 py-4 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white font-bold text-xl text-slate-800 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-primary" />
                                        Community Launching Soon
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Community;
