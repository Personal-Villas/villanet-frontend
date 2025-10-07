export default function Pending({ auth }: any) {
    const u = auth.user;
    const expired = u?.status === 'pending' && u?.trial_expires_at && new Date(u.trial_expires_at) < new Date();
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow">
          <h1 className="text-2xl font-semibold">Cuenta pendiente de aprobación</h1>
          <p className="mt-2 text-slate-600">
            {expired
              ? 'Tu período de prueba ha expirado. Te notificaremos cuando un administrador apruebe tu cuenta.'
              : 'Ya puedes explorar durante 24 horas mientras el equipo revisa tu solicitud.'}
          </p>
        </div>
      </div>
    );
  }
  