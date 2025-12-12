import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { APP_NAME } from '@/config/app';

const ForgotPassword = () => {
    const { resetPassword } = useAuth();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            toast({
                variant: 'destructive',
                title: 'Email required',
                description: 'Please enter your email address.',
            });
            return;
        }

        setLoading(true);
        const { error } = await resetPassword(email);
        setLoading(false);

        if (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to send reset email.',
            });
        } else {
            setSent(true);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            {/* Background decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-x-1/2" />
                <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/4" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center">
                        <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" />
                    </div>
                    <span className="font-bold text-2xl">{APP_NAME}</span>
                </div>

                <Card className="border-border/50 shadow-xl bg-card/80 backdrop-blur-xl">
                    <CardHeader className="text-center pb-2">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            {sent ? (
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            ) : (
                                <Mail className="w-8 h-8 text-primary" />
                            )}
                        </div>
                        <CardTitle className="text-2xl">
                            {sent ? 'Check Your Email' : 'Forgot Password?'}
                        </CardTitle>
                        <CardDescription className="text-base">
                            {sent
                                ? `We've sent a password reset link to ${email}`
                                : "No worries! Enter your email and we'll send you a reset link."}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-4">
                        {sent ? (
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground text-center">
                                    Didn't receive the email? Check your spam folder or try again.
                                </p>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setSent(false)}
                                >
                                    Try Again
                                </Button>
                                <Link to="/" className="block">
                                    <Button variant="ghost" className="w-full gap-2">
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Sign In
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12"
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-semibold"
                                    disabled={loading}
                                >
                                    {loading ? 'Sending...' : 'Send Reset Link'}
                                </Button>
                                <Link to="/" className="block">
                                    <Button variant="ghost" className="w-full gap-2">
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Sign In
                                    </Button>
                                </Link>
                            </form>
                        )}
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="text-center text-sm text-muted-foreground mt-8">
                    © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
