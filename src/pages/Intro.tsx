import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_17_40)">
      <path d="M47.5 24.5C47.5 22.6 47.3 20.8 46.9 19H24V29.1H37.4C36.8 32.1 34.8 34.6 32 36.1V42.1H39.6C44.1 38.1 47.5 32.1 47.5 24.5Z" fill="#4285F4"/>
      <path d="M24 48C30.6 48 36.1 45.9 39.6 42.1L32 36.1C30.2 37.2 27.9 37.9 24 37.9C17.7 37.9 12.2 33.8 10.3 28.3H2.4V34.5C5.9 41.1 14.2 48 24 48Z" fill="#34A853"/>
      <path d="M10.3 28.3C9.8 27.2 9.5 26 9.5 24.8C9.5 23.6 9.8 22.4 10.3 21.3V15.1H2.4C0.8 18.1 0 21.4 0 24.8C0 28.2 0.8 31.5 2.4 34.5L10.3 28.3Z" fill="#FBBC05"/>
      <path d="M24 9.6C27.7 9.6 30.3 11.1 31.7 12.4L39.7 5.1C36.1 1.8 30.6 0 24 0C14.2 0 5.9 6.9 2.4 15.1L10.3 21.3C12.2 15.8 17.7 9.6 24 9.6Z" fill="#EA4335"/>
    </g>
    <defs>
      <clipPath id="clip0_17_40">
        <rect width="48" height="48" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

export default function Intro() {
  const { user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, sendVerificationEmail, resetPassword } = useAuth();
  const navigate = useNavigate();
  
  // Form states
  const [activeTab, setActiveTab] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sign in form
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign up form
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');

  // Password reset form
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);

  // Email verification states
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resendingVerification, setResendingVerification] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      // Check if user needs email verification
      if (user.email && !user.emailVerified && !user.email.includes('@gmail.com') && !user.email.includes('@google.com')) {
        setShowVerificationMessage(true);
        setVerificationEmail(user.email);
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail || !signInPassword) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmail(signInEmail, signInPassword);
      
      // Check if email is verified for email/password users
      if (userCredential.email && !userCredential.emailVerified && 
          !userCredential.email.includes('@gmail.com') && !userCredential.email.includes('@google.com')) {
        setShowVerificationMessage(true);
        setVerificationEmail(userCredential.email);
        setError('Please verify your email address before signing in. Check your inbox for a verification link.');
      }
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email address. Please sign up first.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (error.code === 'auth/user-disabled') {
        setError('This account has been disabled. Please contact support.');
      } else {
        setError(error.message || 'Failed to sign in');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName || !signUpEmail || !signUpPassword || !signUpConfirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (signUpPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await signUpWithEmail(signUpEmail, signUpPassword, signUpName);
      setSuccess('Account created successfully! Please check your email for a verification link.');
      setShowVerificationMessage(true);
      setVerificationEmail(signUpEmail);
      // Reset form
      setSignUpName('');
      setSignUpEmail('');
      setSignUpPassword('');
      setSignUpConfirmPassword('');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.');
      } else {
        setError(error.message || 'Failed to create account');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await resetPassword(resetEmail);
      setSuccess('Password reset email sent! Check your inbox.');
      setShowResetForm(false);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(error.message || 'Failed to send reset email');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingVerification(true);
    setError('');
    try {
      await sendVerificationEmail();
      setSuccess('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      setError(error.message || 'Failed to send verification email');
    } finally {
      setResendingVerification(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;

  // Email verification message
  if (showVerificationMessage) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0e0e0e] to-[#1a1a1a] overflow-hidden px-4 font-inter">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl animate-blob z-0" />
        
        <div className="relative z-10 max-w-md w-full mx-auto bg-black/60 backdrop-blur-md rounded-3xl border border-gray-800/40 shadow-xl shadow-gray-900/40 px-8 py-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Verify Your Email</h1>
            <p className="text-gray-400 text-sm">We've sent a verification link to</p>
            <p className="text-white font-medium mt-1">{verificationEmail}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              {success}
            </div>
          )}

          <div className="space-y-4 text-center">
            <div className="text-gray-300 text-sm leading-relaxed">
              <p>Please check your email and click the verification link to activate your account.</p>
              <p className="mt-2">Didn't receive the email? Check your spam folder or request a new one.</p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleResendVerification}
                disabled={resendingVerification}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {resendingVerification ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Resend Verification Email
                  </>
                )}
              </Button>

              <Button
                onClick={() => {
                  setShowVerificationMessage(false);
                  clearMessages();
                }}
                variant="ghost"
                className="w-full text-gray-400 hover:text-white"
              >
                Back to Sign In
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 right-0 w-72 h-40 bg-white/5 rounded-full blur-3xl z-0" />
        
        <style>{`
          @keyframes blob {
            0%, 100% { transform: scale(1) translateY(0); }
            50% { transform: scale(1.08) translateY(12px); }
          }
          .animate-blob { animation: blob 8s ease-in-out infinite; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0e0e0e] to-[#1a1a1a] overflow-hidden px-4 font-inter">
      {/* Floating blurred blob for depth */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl animate-blob z-0" />
      
      {/* Centered card container */}
      <div className="relative z-10 max-w-md w-full mx-auto bg-black/60 backdrop-blur-md rounded-3xl border border-gray-800/40 shadow-xl shadow-gray-900/40 px-8 py-8">
        {/* Logo and Title */}
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Manifestor Logo" className="mx-auto mb-4" style={{ maxWidth: 48, width: '100%', height: 'auto' }} />
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Manifestor</h1>
          <p className="text-gray-400 text-sm">Your journey, beautifully organized</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            {success}
          </div>
        )}

        {/* Password Reset Form */}
        {showResetForm ? (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-2">Reset Password</h2>
              <p className="text-gray-400 text-sm">Enter your email to receive a reset link</p>
            </div>
            
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-gray-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-white text-black hover:bg-gray-100"
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner /> : 'Send Reset Link'}
              </Button>
              
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full text-gray-400 hover:text-white"
                onClick={() => {
                  setShowResetForm(false);
                  clearMessages();
                }}
              >
                Back to Sign In
              </Button>
            </form>
          </div>
        ) : (
          <>
            {/* Google Sign In Button */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white text-black font-medium py-3 rounded-xl shadow-md hover:bg-gray-100 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <GoogleIcon /> Continue with Google
            </Button>

            <div className="relative my-6">
              <Separator className="bg-gray-700" />
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/60 px-4 text-gray-400 text-sm">
                or continue with email
              </span>
            </div>

            {/* Tabs for Sign In/Sign Up */}
            <Tabs value={activeTab} onValueChange={(value) => {
              setActiveTab(value);
              clearMessages();
            }} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-900/50">
                <TabsTrigger value="signin" className="text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gray-800">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gray-800">Sign Up</TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin" className="space-y-4 mt-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-gray-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-gray-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        className="pl-10 pr-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-gray-400 hover:text-white text-sm p-0 h-auto"
                      onClick={() => setShowResetForm(true)}
                    >
                      Forgot password?
                    </Button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-white text-black hover:bg-gray-100"
                    disabled={isLoading}
                  >
                    {isLoading ? <LoadingSpinner /> : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="space-y-4 mt-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-gray-300">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-gray-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-gray-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        className="pl-10 pr-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password" className="text-gray-300">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={signUpConfirmPassword}
                        onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                        className="pl-10 pr-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 text-center">
                    By signing up, you agree to verify your email address
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-white text-black hover:bg-gray-100"
                    disabled={isLoading}
                  >
                    {isLoading ? <LoadingSpinner /> : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* Extra subtle blurred light at bottom right for depth */}
      <div className="absolute bottom-0 right-0 w-72 h-40 bg-white/5 rounded-full blur-3xl z-0" />
      
      <style>{`
        @keyframes blob {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.08) translateY(12px); }
        }
        .animate-blob { animation: blob 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
} 