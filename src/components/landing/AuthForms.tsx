import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useToast } from '@/hooks/use-toast';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';
import { CURRENCIES, DEFAULT_CURRENCY } from '@/utils/currencyConfig';

type ViewState = 'welcome' | 'signup' | 'signin';

interface AuthFormsProps {
    onSuccess: () => void;
    defaultView?: ViewState;
}

export const AuthForms = ({ onSuccess, defaultView = 'welcome' }: AuthFormsProps) => {
    const { signIn, signUp, signInWithGoogleToken } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [currentView, setCurrentView] = useState<ViewState>(defaultView);
    const [formData, setFormData] = useState({
        preferredName: '',
        email: '',
        password: '',
        confirmPassword: '',
        currency: DEFAULT_CURRENCY
    });
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
            toast({
                variant: "destructive",
                title: "Sign in failed",
                description: error.message,
            });
        } else {
            onSuccess();
        }
        setLoading(false);
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast({
                variant: "destructive",
                title: "Passwords don't match",
                description: "Please make sure your passwords match.",
            });
            return;
        }
        setLoading(true);
        const { error } = await signUp(formData.email, formData.password, formData.preferredName, formData.currency);
        if (error) {
            toast({
                variant: "destructive",
                title: "Sign up failed",
                description: error.message,
            });
        } else {
            toast({
                title: "Account created!",
                description: "Please check your email to verify your account.",
            });
            // Optionally auto-signin or show check email message
        }
        setLoading(false);
    };

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        if (credentialResponse.credential) {
            setLoading(true);
            const { error } = await signInWithGoogleToken(credentialResponse.credential);
            if (error) {
                toast({
                    variant: "destructive",
                    title: "Google Sign-In failed",
                    description: error.message,
                });
                setLoading(false);
            } else {
                onSuccess();
            }
        }
    };

    const handleGoogleError = () => {
        toast({
            variant: "destructive",
            title: "Google Sign-In failed",
            description: "Could not connect to Google.",
        });
    };

    const renderWelcomeView = () => (
        <div className="text-center space-y-6 animate-fade-in py-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Get Started</h2>
                <p className="text-sm text-muted-foreground">Join thousands of others managing their finances.</p>
            </div>

            {/* Primary: Google Sign In — large, prominent, styled natively */}
            <div className="flex flex-col items-center gap-3">
                {/* Custom full-width Google Button */}
                <button
                    id="google-signin-btn"
                    onClick={() => {
                        const btn = document.querySelector<HTMLElement>('[data-testid="google-login-button"] div[role="button"]');
                        btn?.click();
                    }}
                    className="group relative w-full flex items-center justify-center gap-3 h-12 px-6 bg-white hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md rounded-2xl transition-all duration-200 text-gray-700 font-semibold text-base"
                >
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </button>

                {/* Hidden real Google button that is clicked programmatically */}
                <div className="hidden" data-testid="google-login-button">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        size="large"
                        width="350"
                        text="continue_with"
                    />
                </div>

                {/* Trust nudge */}
                <p className="text-xs text-muted-foreground/70">Secure sign-in. No passwords needed.</p>
            </div>

            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-3 text-muted-foreground/60 uppercase tracking-widest">or</span>
                </div>
            </div>

            {/* Secondary: Email options as subtle text links */}
            <div className="flex items-center justify-center gap-2 text-sm">
                <button
                    onClick={() => setCurrentView('signup')}
                    className="text-primary font-medium hover:underline underline-offset-2 transition-all"
                >
                    Create account
                </button>
                <span className="text-muted-foreground/40">·</span>
                <button
                    onClick={() => setCurrentView('signin')}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    Sign in with email
                </button>
            </div>
        </div>
    );

    const renderSignUpView = () => (
        <div className="w-full animate-fade-in">
            <div className="mb-6 flex items-center">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentView('welcome')}
                    className="mr-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-xl font-bold">Create Account</h2>
                    <p className="text-xs text-muted-foreground">Start tracking today</p>
                </div>
            </div>

            <div className="w-full flex justify-center mb-6">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    size="large"
                    width="350"
                    text="signup_with"
                />
            </div>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
                </div>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
                <Input
                    name="preferredName"
                    placeholder="Preferred Name"
                    value={formData.preferredName}
                    onChange={handleInputChange}
                    className="h-11"
                />
                <Input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="h-11"
                />
                <div className="relative">
                    <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="h-11 pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
                <div className="relative">
                    <Input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="h-11 pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                        {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Preferred Currency</label>
                    <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        className="w-full h-11 px-3 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {CURRENCIES.map((curr) => (
                            <option key={curr.code} value={curr.code}>
                                {curr.symbol} {curr.name} ({curr.code})
                            </option>
                        ))}
                    </select>
                </div>
                <Button type="submit" size="lg" className="w-full h-12" disabled={loading}>
                    {loading ? "Creating..." : "Sign Up"}
                </Button>
            </form>
            <div className="mt-4 text-center">
                <button onClick={() => setCurrentView('signin')} className="text-sm text-primary hover:underline">
                    Already have an account? Sign in
                </button>
            </div>
        </div>
    );

    const renderSignInView = () => (
        <div className="w-full animate-fade-in">
            <div className="mb-6 flex items-center">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentView('welcome')}
                    className="mr-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-xl font-bold">Welcome Back</h2>
                    <p className="text-xs text-muted-foreground">Sign in to continue</p>
                </div>
            </div>

            <div className="w-full flex justify-center mb-6">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    size="large"
                    width="350"
                    text="signin_with"
                />
            </div>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or sign in with email</span>
                </div>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
                <Input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="h-11"
                />
                <div className="relative">
                    <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="h-11 pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
                <Button type="submit" size="lg" className="w-full h-12" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                </Button>
            </form>
            <div className="mt-4 flex flex-col items-center gap-2">
                <Link to="/forgot-password" className="text-sm text-muted-foreground hover:text-primary hover:underline">
                    Forgot Password?
                </Link>
                <button onClick={() => setCurrentView('signup')} className="text-sm text-primary hover:underline">
                    New here? Create an account
                </button>
            </div>
        </div>
    );

    return (
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-xl w-full max-w-md mx-auto">
            {currentView === 'welcome' && renderWelcomeView()}
            {currentView === 'signup' && renderSignUpView()}
            {currentView === 'signin' && renderSignInView()}

            <div className="mt-6 text-center">
                <button
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    Privacy & Data Policy
                </button>
            </div>
            <PrivacyPolicyModal open={showPrivacyModal} onOpenChange={setShowPrivacyModal} />
        </div>
    );
};
