import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';

type ViewState = 'welcome' | 'signup' | 'signin';

interface AuthFormsProps {
    onSuccess: () => void;
    defaultView?: ViewState;
}

export const AuthForms = ({ onSuccess, defaultView = 'welcome' }: AuthFormsProps) => {
    const { signIn, signUp } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [currentView, setCurrentView] = useState<ViewState>(defaultView);
    const [formData, setFormData] = useState({
        preferredName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const { error } = await signUp(formData.email, formData.password, formData.preferredName);
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

    const renderWelcomeView = () => (
        <div className="text-center space-y-6 animate-fade-in py-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">Get Started</h2>
                <p className="text-muted-foreground">Join thousands of others managing their finances.</p>
            </div>

            <div className="space-y-4">
                <Button
                    onClick={() => setCurrentView('signup')}
                    size="lg"
                    className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary-dark text-primary-foreground"
                >
                    Create Account
                    <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                    variant="outline"
                    onClick={() => setCurrentView('signin')}
                    size="lg"
                    className="w-full h-12 text-lg font-semibold"
                >
                    Sign In
                </Button>
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
                <Input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="h-11"
                />
                <Input
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="h-11"
                />
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
                <Input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="h-11"
                />
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
