import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const authSchema = z.object({
  email: z.string().email('Invalid email address').max(255, 'Email too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().max(100, 'Name too long').optional(),
});

type AuthMode = 'login' | 'signup' | 'forgot';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signIn, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'forgot') {
        const emailValidation = z.string().email('Invalid email address').safeParse(email);
        if (!emailValidation.success) {
          toast({
            title: 'Validation Error',
            description: emailValidation.error.errors[0].message,
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        const { error } = await resetPassword(email);
        if (error) {
          toast({
            title: 'Reset Failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Check Your Email',
            description: 'We sent you a password reset link.',
          });
          setMode('login');
        }
        setLoading(false);
        return;
      }

      // Validate inputs for login/signup
      const validation = authSchema.safeParse({ email, password, fullName });
      if (!validation.success) {
        toast({
          title: 'Validation Error',
          description: validation.error.errors[0].message,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Login Failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Welcome Back!',
            description: 'Successfully logged in.',
          });
          navigate('/dashboard');
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Account Exists',
              description: 'This email is already registered. Please login instead.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Signup Failed',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Account Created!',
            description: 'Welcome to Paramita Studio.',
          });
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center bg-background px-4 pt-24 pb-20 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-card border border-border rounded-xl p-8 shadow-elegant">
            <h1 className="text-3xl font-bold text-center mb-2 text-gradient-gold uppercase">
              {mode === 'login' ? 'Login' : mode === 'signup' ? 'Sign Up' : 'Reset Password'}
            </h1>
            <p className="text-center text-muted-foreground mb-6">
              {mode === 'login' 
                ? 'Welcome back to Paramita Studio' 
                : mode === 'signup' 
                ? 'Join the Paramita Studio community'
                : 'Enter your email to receive a reset link'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              {mode !== 'forgot' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={loading}
              >
                {loading 
                  ? 'Please wait...' 
                  : mode === 'login' 
                  ? 'Login' 
                  : mode === 'signup' 
                  ? 'Sign Up' 
                  : 'Send Reset Link'}
              </Button>
            </form>

            {mode === 'login' && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setMode('forgot')}
                  className="text-muted-foreground hover:text-accent text-sm"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <div className="mt-4 text-center">
              {mode === 'forgot' ? (
                <button
                  onClick={() => setMode('login')}
                  className="text-accent hover:text-accent/80 text-sm"
                >
                  Back to Login
                </button>
              ) : (
                <button
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-accent hover:text-accent/80 text-sm"
                >
                  {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Login'}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
