import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login({ auth }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setIsLoading(true);
    
    try {
      await auth.login(email, password);
      navigate('/properties');
    } catch (e: any) {
      setErr('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-8">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-2xl font-bold">villanet</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-base text-gray-600">
          Sign in to your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-900 mb-2 block">
              Email
            </label>
            <input 
              type="email"
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-14 text-base"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="you@example.com"
              disabled={isLoading}
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-900 mb-2 block">
              Password
            </label>
            <input 
              type="password" 
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-14 text-base"
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              required
            />
          </div>
          
          {err && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-600">{err}</p>
            </div>
          )}
          
          <button 
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#000000] text-white hover:bg-black/90 px-4 py-2 w-full h-14 text-base font-medium rounded-md shadow-none"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="text-center pt-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-gray-900 hover:underline">
                Request access
              </Link>
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <a href="/terms-of-service" className="underline hover:text-gray-900">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy-policy" className="underline hover:text-gray-900">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}