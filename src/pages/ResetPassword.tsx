import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { APP_NAME } from '@/config/app';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
    const navigate = useNavigate();
    const { updatePassword } = useAuth();
    const { toast } = useToast();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check if we have a valid session from the reset link
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setError('Invalid or expired reset link. Please request a new one.');
            }
        };
        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            toast({
                variant: 'destructive',
                title: 'Password too short',
                description: 'Password must be at least 6 characters.',
            });
            return;
        }

        if (password !== confirmPassword) {
            toast({
                variant: 'destructive',
                title: "Passwords don't match",
                description: 'Please make sure your passwords match.',
            });
            return;
        }

        setLoading(true);
        const { error } = await updatePassword(password);
        setLoading(false);

        if (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to update password.',
            });
        } else {
            setSuccess(true);
            toast({
                title: 'Password Updated!',
                description: 'Your password has been successfully changed.',
            });
            // Redirect to login after a short delay
            setTimeout(() => {
                navigate('/');
            }, 2000);
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
                            {success ? (
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            ) : error ? (
                                <AlertCircle className="w-8 h-8 text-destructive" />
                            ) : (
                                <Lock className="w-8 h-8 text-primary" />
                            )}
                        </div>
                        <CardTitle className="text-2xl">
                            {success ? 'Password Updated!' : error ? 'Link Expired' : 'Set New Password'}
                        </CardTitle>
                        <CardDescription className="text-base">
                            {success
                                ? 'Redirecting you to sign in...'
                                : error
                                    ? error
                                    : 'Enter your new password below.'}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-4">
                        {error ? (
                            <Button
                                className="w-full"
                                onClick={() => navigate('/forgot-password')}
                            >
                                Request New Link
                            </Button>
                        ) : success ? (
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Taking you back to sign in...
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Input
                                        type="password"
                                        placeholder="New Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-12"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Input
                                        type="password"
                                        placeholder="Confirm New Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="h-12"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-semibold"
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Update Password'}
                                </Button>
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

export default ResetPassword;
