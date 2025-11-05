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
    <div className="min-h-screen grid place-items-center bg-slate-50">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold mb-2">Welcome</h1>
        
        <label className="block text-sm font-medium">Email</label>
        <input 
          className="mt-1 w-full rounded-lg border p-3 disabled:bg-slate-100 disabled:cursor-not-allowed" 
          value={email} 
          onChange={e=>setEmail(e.target.value)} 
          placeholder="tu@email.com"
          disabled={isLoading}
        />
        
        <label className="mt-4 block text-sm font-medium">Password</label>
        <input 
          type="password" 
          className="mt-1 w-full rounded-lg border p-3 disabled:bg-slate-100 disabled:cursor-not-allowed" 
          value={password} 
          onChange={e=>setPassword(e.target.value)}
          disabled={isLoading}
        />
        
        {err && <p className="mt-3 text-red-600 text-sm">{err}</p>}
        
        <button 
          type="submit"
          disabled={isLoading}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging in...
            </>
          ) : (
            'Login'
          )}
        </button>
        
        <div className="mt-6 text-center text-sm">
          Don't have an account? <Link to="/signup" className="text-indigo-600">Request access</Link>
        </div>
      </form>
    </div>
  );
}