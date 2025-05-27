import { useState } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Navigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If session exists, redirect to home or dashboard
  if (session) {
    return <Navigate to="/" />;
  }

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      let response;
      if (isSignUp) {
        response = await supabase.auth.signUp({
          email,
          password,
        });
      } else {
        response = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }

      if (response.error) {
        setError(response.error.message);
      } else if (isSignUp && response.data.user && !response.data.session) {
        setMessage('Please check your email to confirm your sign up.');
      } else {
        // Successful login or sign-up confirmation email sent
        // App.tsx will handle redirecting if session becomes active
        if (!isSignUp) {
          // setMessage('Logged in successfully!'); // Optional: can be removed as redirect is main feedback
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during authentication.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gunmetal-100 via-chinese_violet-100 to-french_mauve-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-chinese_violet-500 to-french_mauve-500 bg-clip-text text-transparent mb-3">
            Reality Stars
          </h1>
          <p className="text-gunmetal-600 text-lg font-medium">
            Your gateway to exclusive content
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-md transition-all duration-300 hover:shadow-3xl hover:bg-white/95">
          <CardHeader className="text-center space-y-3 pb-6">
            <CardTitle className="text-3xl font-bold text-gunmetal-800 transition-colors duration-300">
              {isSignUp ? 'Join Reality Stars' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-gunmetal-600 text-base leading-relaxed">
              {isSignUp 
                ? 'Create your account to unlock exclusive behind-the-scenes content and connect with your favorite reality stars.' 
                : 'Sign in to access your personalized dashboard and exclusive content tailored just for you.'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8">
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-3">
                <Label 
                  htmlFor="email" 
                  className="text-gunmetal-700 font-semibold text-sm uppercase tracking-wide"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 px-4 text-base border-2 border-gunmetal-200 rounded-xl focus:border-chinese_violet-400 focus:ring-2 focus:ring-chinese_violet-200 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder:text-gunmetal-400"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label 
                  htmlFor="password" 
                  className="text-gunmetal-700 font-semibold text-sm uppercase tracking-wide"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 px-4 text-base border-2 border-gunmetal-200 rounded-xl focus:border-chinese_violet-400 focus:ring-2 focus:ring-chinese_violet-200 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder:text-gunmetal-400"
                  />
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-shake">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {message && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 animate-pulse">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">{message}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-chinese_violet-500 to-french_mauve-500 hover:from-chinese_violet-600 hover:to-french_mauve-600 text-white font-bold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center">
                    {isSignUp ? '✨ Create Account' : '🚀 Sign In'}
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col items-center space-y-4 px-8 pb-8">
            <div className="w-full flex items-center justify-center">
              <div className="border-t border-gunmetal-200 flex-grow"></div>
              <span className="px-4 text-sm text-gunmetal-500 font-medium">or</span>
              <div className="border-t border-gunmetal-200 flex-grow"></div>
            </div>
            
            <Button 
              variant="ghost" 
              className="text-base font-medium text-gunmetal-600 hover:text-chinese_violet-600 hover:bg-chinese_violet-50 rounded-xl px-6 py-3 transition-all duration-300"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
              disabled={loading}
            >
              {isSignUp 
                ? '← Already have an account? Sign In' 
                : "→ Don't have an account? Join Reality Stars"
              }
            </Button>
            
            {!isSignUp && (
              <Button 
                variant="link" 
                className="text-sm text-gunmetal-500 hover:text-french_mauve-600 font-medium transition-colors duration-300"
              >
                🔐 Forgot your password?
              </Button>
            )}
          </CardFooter>
        </Card>
        
        <div className="text-center mt-8">
          <p className="text-sm text-gunmetal-500 leading-relaxed">
            By continuing, you agree to our{' '}
            <a href="#" className="text-chinese_violet-600 hover:text-french_mauve-600 font-medium transition-colors duration-300">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-chinese_violet-600 hover:text-french_mauve-600 font-medium transition-colors duration-300">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 