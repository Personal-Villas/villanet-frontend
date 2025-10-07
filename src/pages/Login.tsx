import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login({ auth }: any) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await auth.login(email, password);
      navigate('/');
    } catch (e: any) {
      setErr('Credenciales inválidas');
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold mb-2">Bienvenido</h1>
        <p className="text-sm text-slate-500 mb-6">Accede al directorio exclusivo de villas de lujo</p>
        <label className="block text-sm font-medium">Email</label>
        <input className="mt-1 w-full rounded-lg border p-3" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com" />
        <label className="mt-4 block text-sm font-medium">Contraseña</label>
        <input type="password" className="mt-1 w-full rounded-lg border p-3" value={password} onChange={e=>setPassword(e.target.value)} />
        {err && <p className="mt-3 text-red-600 text-sm">{err}</p>}
        <button className="mt-6 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 font-medium">Iniciar Sesión</button>
        <div className="mt-6 text-center text-sm">
          ¿No tienes cuenta? <Link to="/signup" className="text-indigo-600">Solicita acceso</Link>
        </div>
      </form>
    </div>
  );
}
