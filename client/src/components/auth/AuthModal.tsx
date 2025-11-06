import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog.js';
import { Button } from '../ui/button.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../hooks/use-toast.js';
import { useTranslation } from 'react-i18next';
import { withTimeout } from '../../utils/withTimeout.js';
import { Loader2 } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { signInWithGoogle, signInAsTestUser, isLoading } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningInAsTest, setIsSigningInAsTest] = useState(false);
  
  const isHebrew = i18n.language.startsWith('he');

  const handleGoogleSignIn = async () => {
    if (isSigningIn) return;
    
    try {
      setIsSigningIn(true);
      
      // Add timeout to prevent hanging
      await withTimeout(signInWithGoogle(), 10000);
      
      // Modal will close automatically after successful auth
    } catch (error: any) {
      console.error('Sign in failed:', error);
      
      if (error.message === 'timeout') {
        toast({
          title: isHebrew ? "התחברות נתקעה" : "Sign In Stuck",
          description: isHebrew ? "נראה שנתקע, נסה שוב" : "It seems stuck, please try again",
          variant: "destructive",
        });
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleTestSignIn = async () => {
    if (isSigningInAsTest) return;
    
    try {
      setIsSigningInAsTest(true);
      await signInAsTestUser();
      onOpenChange(false); // Close modal on success
    } catch (error: any) {
      console.error('Test sign in failed:', error);
    } finally {
      setIsSigningInAsTest(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir={isHebrew ? 'rtl' : 'ltr'}>
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold">
            {isHebrew ? 'ברוך הבא ל-GlobeMate' : 'Welcome to GlobeMate'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isHebrew 
              ? 'התחבר כדי לתכנן את המסע הבא שלך ברחבי העולם'
              : 'Sign in to plan your next journey around the world'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <Button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn || isLoading}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {isSigningIn ? (
              <>
                <Loader2 className={`${isHebrew ? 'ml-2' : 'mr-2'} h-4 w-4 animate-spin`} />
                {isHebrew ? 'מתחבר...' : 'Signing in...'}
              </>
            ) : (
              <>
                <svg className={`${isHebrew ? 'ml-2' : 'mr-2'} h-4 w-4`} viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {isHebrew ? 'התחבר עם Google' : 'Sign in with Google'}
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {isHebrew ? 'או' : 'OR'}
              </span>
            </div>
          </div>

          <Button
            onClick={handleTestSignIn}
            disabled={isSigningInAsTest || isLoading}
            className="w-full h-12 text-lg"
            variant="outline"
            size="lg"
            data-testid="button-test-signin"
          >
            {isSigningInAsTest ? (
              <>
                <Loader2 className={`${isHebrew ? 'ml-2' : 'mr-2'} h-4 w-4 animate-spin`} />
                {isHebrew ? 'מתחבר כמשתמש בדיקה...' : 'Signing in as test user...'}
              </>
            ) : (
              isHebrew ? '🧪 התחבר כמשתמש בדיקה (Test User)' : '🧪 Sign in as Test User'
            )}
          </Button>
          
          <p className="text-sm text-muted-foreground text-center">
            {isHebrew 
              ? 'על ידי התחברות, אתה מסכים לתנאי השימוש ולמדיניות הפרטיות שלנו'
              : 'By signing in, you agree to our Terms of Service and Privacy Policy'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}