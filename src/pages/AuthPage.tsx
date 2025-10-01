import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';

type ViewState = 'welcome' | 'signup' | 'signin';

const AuthPage = () => {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('welcome');
  const [formData, setFormData] = useState({
    preferredName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error, profile } = await signIn(formData.email, formData.password);
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message,
      });
    } else {
      const name = (profile as any)?.preferred_name || '';
      const greeting = name ? `Welcome back, ${name}!` : 'Welcome back!';
      toast({ title: greeting, description: "You've successfully signed in." });
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
    }
    setLoading(false);
  };

  const renderWelcomeView = () => (
    <div className="text-center space-y-8 animate-fade-in">
      <div className="space-y-4">
        <div className="mx-auto w-32 h-32 rounded-3xl flex items-center justify-center">
          <img 
            src="/logo.png" 
            alt="Kudimate Logo" 
            className="w-32 h-32 object-contain rounded-3xl"
          />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-poppins font-bold text-white">
            Track Your Spending Effortlessly
          </h1>
          <p className="text-lg text-white/80 max-w-md mx-auto">
            Take control of your finances with our smart budget tracker designed for modern life
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <Button 
          onClick={() => setCurrentView('signup')}
          size="lg"
          className="w-full max-w-sm bg-white text-primary hover:bg-white/90 transition-all duration-200 h-14 text-lg font-semibold"
        >
          Get Started
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
        
        <div className="space-y-2">
          <p className="text-white/60 text-sm">Already have an account?</p>
          <button
            onClick={() => setCurrentView('signin')}
            className="text-white font-medium underline underline-offset-4 hover:no-underline transition-all"
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );

  const renderSignUpView = () => (
    <div className="w-full max-w-sm mx-auto animate-fade-in">
      <div className="mb-8">
        <button
          onClick={() => setCurrentView('welcome')}
          className="flex items-center text-white/80 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-poppins font-bold text-white">Create Account</h2>
          <p className="text-white/80">Start tracking your expenses today</p>
        </div>
      </div>

      <form onSubmit={handleSignUp} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Input
              name="preferredName"
              type="text"
              placeholder="Preferred name"
              className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 transition-all"
              value={formData.preferredName}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Input
              name="email"
              type="email"
              placeholder="Enter your email"
              className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 transition-all"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Input
              name="password"
              type="password"
              placeholder="Create a password"
              className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 transition-all"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Input
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 transition-all"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <Button 
          type="submit" 
          size="lg"
          className="w-full bg-white text-primary hover:bg-white/90 transition-all h-12 font-semibold"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <div className="mt-6 text-center space-y-3">
        <p className="text-white/60 text-sm">Already have an account?</p>
        <button
          onClick={() => setCurrentView('signin')}
          className="text-white font-medium underline underline-offset-4 hover:no-underline transition-all"
        >
          Sign in instead
        </button>
        
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowPrivacyModal(true)}
            className="text-white/80 text-sm underline underline-offset-4 hover:text-white transition-colors"
          >
            Privacy & Data Policy
          </button>
        </div>
      </div>
    </div>
  );

  const renderSignInView = () => (
    <div className="w-full max-w-sm mx-auto animate-fade-in">
      <div className="mb-8">
        <button
          onClick={() => setCurrentView('welcome')}
          className="flex items-center text-white/80 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-poppins font-bold text-white">Welcome Back</h2>
          <p className="text-white/80">Sign in to continue tracking</p>
        </div>
      </div>

      <form onSubmit={handleSignIn} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Input
              name="email"
              type="email"
              placeholder="Enter your email"
              className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 transition-all"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Input
              name="password"
              type="password"
              placeholder="Enter your password"
              className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 transition-all"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <Button 
          type="submit" 
          size="lg"
          className="w-full bg-white text-primary hover:bg-white/90 transition-all h-12 font-semibold"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-6 text-center space-y-3">
        <p className="text-white/60 text-sm">Don't have an account?</p>
        <button
          onClick={() => setCurrentView('signup')}
          className="text-white font-medium underline underline-offset-4 hover:no-underline transition-all"
        >
          Create one here
        </button>
        
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowPrivacyModal(true)}
            className="text-white/80 text-sm underline underline-offset-4 hover:text-white transition-colors"
          >
            Privacy & Data Policy
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-lg relative z-10">
        {currentView === 'welcome' && renderWelcomeView()}
        {currentView === 'signup' && renderSignUpView()}
        {currentView === 'signin' && renderSignInView()}
      </div>

      <PrivacyPolicyModal 
        open={showPrivacyModal} 
        onOpenChange={setShowPrivacyModal} 
      />
    </div>
  );
};

export default AuthPage;
