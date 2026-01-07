import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type AuthMode = 'login' | 'signup' | 'forgot';

const Auth = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signUp, signIn, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const authSchema = z.object({
    email: z.string().email(t('auth.validation.invalidEmail')).max(255, t('auth.validation.emailTooLong')),
    password: z.string().min(6, t('auth.validation.passwordMin')),
    fullName: z.string().max(100, t('auth.validation.nameTooLong')).optional(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'forgot') {
        const emailValidation = z.string().email(t('auth.validation.invalidEmail')).safeParse(email);
        if (!emailValidation.success) {
          toast({
            title: t('auth.validation.error'),
            description: emailValidation.error.errors[0].message,
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        const { error } = await resetPassword(email);
        if (error) {
          toast({
            title: t('auth.resetFailed'),
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: t('auth.checkEmail'),
            description: t('auth.resetLinkSent'),
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
          title: t('auth.validation.error'),
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
            title: t('auth.loginFailed'),
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: t('auth.welcomeBack'),
            description: t('auth.loginSuccess'),
          });
          navigate('/dashboard');
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: t('auth.accountExists'),
              description: t('auth.accountExistsDesc'),
              variant: 'destructive',
            });
          } else {
            toast({
              title: t('auth.signupFailed'),
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: t('auth.accountCreated'),
            description: t('auth.welcomeNew'),
          });
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('auth.unexpectedError'),
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
              {mode === 'login' ? t('auth.signIn') : mode === 'signup' ? t('auth.signUp') : t('auth.forgotPasswordTitle')}
            </h1>
            <p className="text-center text-muted-foreground mb-6">
              {mode === 'login' 
                ? t('auth.welcomeBackSubtitle') 
                : mode === 'signup' 
                ? t('auth.joinCommunity')
                : t('auth.enterEmailReset')}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t('auth.enterFullName')}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.enterEmail')}
                  required
                />
              </div>

              {mode !== 'forgot' && (
                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('auth.enterPassword')}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={loading}
              >
                {loading 
                  ? t('auth.pleaseWait') 
                  : mode === 'login' 
                  ? t('auth.signIn') 
                  : mode === 'signup' 
                  ? t('auth.signUp') 
                  : t('auth.sendResetLink')}
              </Button>
            </form>

            {mode === 'login' && email.includes('@') && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setMode('forgot')}
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  {t('auth.forgotPassword')}
                </button>
              </div>
            )}

            <div className="mt-4 text-center">
              {mode === 'forgot' ? (
                <button
                  onClick={() => setMode('login')}
                  className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                >
                  {t('auth.backToLogin')}
                </button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {mode === 'login' ? t('auth.noAccount') + ' ' : t('auth.haveAccount') + ' '}
                  <button
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    {mode === 'login' ? t('auth.signUp') : t('auth.signIn')}
                  </button>
                </p>
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
