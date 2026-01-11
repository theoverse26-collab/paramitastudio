import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ResetPassword = () => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { updatePassword, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const passwordSchema = z.object({
    password: z.string().min(6, t('resetPassword.passwordMinLength')),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('resetPassword.passwordMismatch'),
    path: ['confirmPassword'],
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!session) {
        toast({
          title: t('resetPassword.invalidLink'),
          description: t('resetPassword.invalidLinkDesc'),
          variant: 'destructive',
        });
        navigate('/auth');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [session, navigate, toast, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = passwordSchema.safeParse({ password, confirmPassword });
      if (!validation.success) {
        toast({
          title: t('resetPassword.validationError'),
          description: validation.error.errors[0].message,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const { error } = await updatePassword(password);
      
      if (error) {
        toast({
          title: t('resetPassword.updateFailed'),
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('resetPassword.passwordUpdated'),
          description: t('resetPassword.passwordUpdatedDesc'),
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: t('resetPassword.error'),
        description: error.message || t('resetPassword.unexpectedError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center bg-background px-4 pt-24 pb-20 min-h-screen">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <p className="text-muted-foreground">{t('resetPassword.verifying')}</p>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

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
              {t('resetPassword.title')}
            </h1>
            <p className="text-center text-muted-foreground mb-6">
              {t('resetPassword.subtitle')}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">{t('resetPassword.newPassword')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('resetPassword.newPasswordPlaceholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('resetPassword.confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={loading}
              >
                {loading ? t('resetPassword.updating') : t('resetPassword.updatePassword')}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPassword;
