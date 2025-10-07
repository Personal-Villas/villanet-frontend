import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Signup({ auth }: any) {
  const [full_name, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await auth.register(full_name, email, password);
    navigate('/pending');
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold mb-2">Solicitar acceso</h1>
        <p className="text-sm text-slate-500 mb-6">Tendrás una prueba gratis de 24h hasta que el equipo apruebe tu cuenta.</p>
        <label className="block text-sm font-medium">Nombre</label>
        <input className="mt-1 w-full rounded-lg border p-3" value={full_name} onChange={e=>setFullName(e.target.value)} />
        <label className="mt-4 block text-sm font-medium">Email</label>
        <input className="mt-1 w-full rounded-lg border p-3" value={email} onChange={e=>setEmail(e.target.value)} />
        <label className="mt-4 block text-sm font-medium">Contraseña</label>
        <input type="password" className="mt-1 w-full rounded-lg border p-3" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="mt-6 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 font-medium">Crear cuenta</button>
      </form>
    </div>
  );
}
