import { useState, useRef, useEffect } from 'react';
import { X, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import imageLoginDefault from '../assets/images/villanet-login.webp';
import { publicApi } from '../api/api';
import { useAuth } from '../auth/useAuth';
import { useNavigate } from 'react-router-dom';

// ── Tipos ──────────────────────────────────────────────────────────────────
interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
  imageLogin?: string;
  initialEmail?: string;
  // 'email'    → paso inicial
  // 'password' → usuario existente, login con contraseña
  // 'forgot'   → flujo de reset (3 sub-pasos internos)
  // 'code'     → flujo de código (comentado, conservado)
  initialMode?: 'email' | 'password' | 'forgot' | 'code';
}

interface ApiResponse {
  message: string;
  userExists: boolean;
  user?: any;
}

interface ForgotStep {
  step: 'request'    // ingresar email y pedir código
      | 'verify'     // ingresar código de 6 dígitos
      | 'new-password'; // ingresar nueva contraseña
  resetToken?: string; // se rellena tras verify-reset-code exitoso
}

// ── Componente ─────────────────────────────────────────────────────────────
const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  onSuccess,
  imageLogin,
  initialEmail = '',
  initialMode = 'email',
}) => {
  const [mode, setMode] = useState<'email' | 'password' | 'forgot' | 'code'>(initialMode);
  const [email, setEmail] = useState<string>(initialEmail);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // ── Modo password ──────────────────────────────────────────────────────
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ── Modo forgot ────────────────────────────────────────────────────────
  const [forgotStep, setForgotStep] = useState<ForgotStep>({ step: 'request' });
  const [forgotEmail, setForgotEmail] = useState(initialEmail);
  const [forgotCode, setForgotCode] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  const forgotCodeRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { login } = useAuth();
  const navigate = useNavigate();
  const bgImage = imageLogin ?? imageLoginDefault;

  // Cuando se abre en modo 'forgot' desde el modal de password, pre-cargar email
  useEffect(() => {
    if (initialMode === 'forgot' && initialEmail) {
      setForgotEmail(initialEmail);
    }
  }, [initialMode, initialEmail]);

  // Auto-focus primer campo del código cuando llegamos al paso verify
  useEffect(() => {
    if (forgotStep.step === 'verify') {
      setTimeout(() => forgotCodeRefs.current[0]?.focus(), 50);
    }
  }, [forgotStep.step]);

  // ── Handlers modo email ────────────────────────────────────────────────
  const handleContinue = async () => {
    if (!email.includes('@')) { setError('Please enter a valid email'); return; }
    setError(null);
    setLoading(true);
    try {
      const response = await publicApi('/auth/send-code', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }) as ApiResponse;
      if (response.userExists) {
        setMode('password');
      } else {
        onClose();
        navigate('/advisor-signup');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to continue');
    } finally {
      setLoading(false);
    }
  };

  // ── Handlers modo password ─────────────────────────────────────────────
  const handlePasswordLogin = async () => {
    if (!password.trim()) { setError('Please enter your password'); return; }
    setError(null);
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.user) {
        onSuccess(data.user);
        onClose();
        navigate('/properties');
      }
    } catch (err: any) {
      setError('Invalid credentials. Please check your password.');
    } finally {
      setLoading(false);
    }
  };

  // ── Handlers modo forgot ───────────────────────────────────────────────

  // Paso 1: solicitar código
  const handleForgotRequest = async () => {
    if (!forgotEmail.includes('@')) { setError('Please enter a valid email'); return; }
    setError(null);
    setLoading(true);
    try {
      await publicApi('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: forgotEmail }),
      });
      // Siempre avanzar (el backend no revela si el email existe)
      setForgotStep({ step: 'verify' });
    } catch (err: any) {
      setError(err.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: verificar código
  const handleForgotVerify = async () => {
    const codeStr = forgotCode.join('');
    if (codeStr.length !== 6) { setError('Please enter the complete 6-digit code'); return; }
    setError(null);
    setLoading(true);
    try {
      const data = await publicApi('/auth/verify-reset-code', {
        method: 'POST',
        body: JSON.stringify({ email: forgotEmail, code: codeStr }),
      }) as { resetToken: string };
      setForgotStep({ step: 'new-password', resetToken: data.resetToken });
    } catch (err: any) {
      setError(err.message || 'Invalid code');
      setForgotCode(['', '', '', '', '', '']);
      forgotCodeRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Paso 3: establecer nueva contraseña
  const handleForgotNewPassword = async () => {
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmNewPassword) { setError('Passwords do not match'); return; }
    setError(null);
    setLoading(true);
    try {
      await publicApi('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ resetToken: forgotStep.resetToken, newPassword }),
      });
      setPwSuccess(true);
      // Después de 2s volver al modo password con el email pre-cargado para login inmediato
      setTimeout(() => {
        setPwSuccess(false);
        setPassword('');
        setMode('password');
        setForgotStep({ step: 'request' });
        setForgotCode(['', '', '', '', '', '']);
        setNewPassword('');
        setConfirmNewPassword('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // Handlers del input de código (forgot)
  const handleForgotCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;
    const next = [...forgotCode];
    next[index] = value;
    setForgotCode(next);
    if (value && index < 5) forgotCodeRefs.current[index + 1]?.focus();
  };

  const handleForgotCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !forgotCode[index] && index > 0) {
      forgotCodeRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') handleForgotVerify();
  };

  const handleForgotCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted.length) return;
    const next = pasted.split('');
    while (next.length < 6) next.push('');
    setForgotCode(next);
    const firstEmpty = next.findIndex(c => !c);
    (firstEmpty !== -1 ? forgotCodeRefs.current[firstEmpty] : forgotCodeRefs.current[5])?.focus();
  };

  // ── Título y subtítulo del paso forgot ────────────────────────────────
  const forgotHeading = () => {
    if (forgotStep.step === 'request') return { title: 'Reset your password', sub: 'Enter your email and we\'ll send you a 6-digit code.' };
    if (forgotStep.step === 'verify')  return { title: 'Check your email', sub: `We sent a 6-digit code to ${forgotEmail}` };
    if (pwSuccess)                      return { title: 'Password updated!', sub: 'You\'ll be redirected to sign in now.' };
    return { title: 'New password', sub: 'Choose a strong password for your account.' };
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-stretch justify-center sm:p-6 sm:items-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full h-full rounded-none sm:max-w-4xl sm:h-auto sm:rounded-3xl relative shadow-2xl flex flex-col sm:flex-row overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile hero image */}
        <div className="sm:hidden w-full flex-shrink-0">
          <div className="w-full h-[50vh] relative overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }} />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white" />
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <h3 className="text-[25px] font-semibold text-neutral-900 mb-1">Welcome to Villanet</h3>
              <p className="text-[17px] text-neutral-600">Enter your email to log in or register.</p>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition z-20 shadow-sm"
        >
          <X className="w-4 h-4 text-neutral-700" />
        </button>

        {/* Left column */}
        <div className="flex-1 p-4 sm:p-8 flex flex-col min-h-0">

          {/* Logo (desktop only) */}
          <div className="hidden sm:flex items-center mx-auto gap-2 mb-6">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="8" cy="8" r="3" stroke="#111111" strokeWidth="1.5" />
              <circle cx="20" cy="8" r="3" stroke="#111111" strokeWidth="1.5" />
              <circle cx="14" cy="20" r="3" stroke="#111111" strokeWidth="1.5" />
              <path d="M10.5 9.5L14 17L17.5 9.5" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 className="text-2xl font-bold text-neutral-900">Villanet</h2>
          </div>

          {/* ── MODO EMAIL ── */}
          {mode === 'email' && (
            <>
              <h3 className="hidden sm:block text-[23px] font-semibold text-neutral-900 mb-3 mt-[100px] md:mb-[20px]">
                Welcome to Villanet
              </h3>
              <p className="hidden sm:block text-sm text-neutral-600 mb-6 md:mb-[30px]">
                Enter your email to log in or register. We will never sell your personal information.
              </p>
              <div className="flex-1">
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleContinue()}
                  className="w-full px-4 py-3 rounded-[50px] h-[70px] lg:h-[50px] border border-neutral-300 focus:outline-none focus:border-neutral-900 transition mb-4 text-[17px] lg:text-[15px]"
                />
                {error && <p className="text-red-600 text-[17px] mb-4">{error}</p>}
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={loading}
                  className="w-full bg-neutral-900 text-white py-3 rounded-[50px] h-[70px] lg:h-[50px] hover:bg-neutral-800 transition disabled:opacity-50 text-[20px] lg:text-[17px]"
                >
                  {loading ? 'Checking...' : 'Continue'}
                </button>
              </div>
            </>
          )}

          {/* ── MODO PASSWORD ── */}
          {mode === 'password' && (
            <div className="flex-1 flex flex-col lg:mt-[50px]">
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Welcome back</h3>
              <p className="text-sm text-neutral-500 mb-8">Sign in to your account</p>

              {/* Email bloqueado */}
              <div className="mb-4">
                <label className="text-sm font-medium text-neutral-700 mb-2 block">Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-500 cursor-not-allowed text-sm"
                />
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="text-sm font-medium text-neutral-700 mb-2 block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handlePasswordLogin()}
                    autoFocus
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-900 transition text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div className="flex justify-end mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setError(null);
                    setMode('forgot');
                    setForgotStep({ step: 'request' });
                  }}
                  className="text-sm text-neutral-500 hover:text-neutral-900 transition underline underline-offset-2"
                >
                  Forgot password?
                </button>
              </div>

              {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

              <button
                type="button"
                onClick={handlePasswordLogin}
                disabled={loading}
                className="w-full bg-neutral-900 text-white py-3 rounded-[50px] font-semibold hover:bg-neutral-800 transition disabled:opacity-50 mb-3 text-base h-[50px]"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <button
                type="button"
                onClick={() => { setMode('email'); setPassword(''); setError(null); }}
                className="w-full text-neutral-500 text-sm hover:text-neutral-900 transition text-center mt-2"
              >
                ← Use a different email
              </button>
            </div>
          )}

          {/* ── MODO FORGOT ── */}
          {mode === 'forgot' && (
            <div className="flex-1 flex flex-col lg:mt-[40px]">

              {/* Back button */}
              <button
                type="button"
                onClick={() => {
                  if (forgotStep.step === 'request') {
                    setMode('password');
                    setError(null);
                  } else if (forgotStep.step === 'verify') {
                    setForgotStep({ step: 'request' });
                    setForgotCode(['', '', '', '', '', '']);
                    setError(null);
                  } else {
                    setForgotStep({ step: 'verify' });
                    setNewPassword('');
                    setConfirmNewPassword('');
                    setError(null);
                  }
                }}
                className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition mb-6 w-fit"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>

              {/* Heading */}
              <h3 className="text-xl font-semibold text-neutral-900 mb-1">
                {forgotHeading().title}
              </h3>
              <p className="text-sm text-neutral-500 mb-8">
                {forgotHeading().sub}
              </p>

              {/* ── Paso 1: Request ── */}
              {forgotStep.step === 'request' && (
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-2 block">Email</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleForgotRequest()}
                    autoFocus
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-900 transition text-sm mb-6"
                  />
                  {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
                  <button
                    type="button"
                    onClick={handleForgotRequest}
                    disabled={loading}
                    className="w-full bg-neutral-900 text-white py-3 rounded-[50px] font-semibold hover:bg-neutral-800 transition disabled:opacity-50 text-base h-[50px]"
                  >
                    {loading ? 'Sending...' : 'Send Code'}
                  </button>
                </div>
              )}

              {/* ── Paso 2: Verify code ── */}
              {forgotStep.step === 'verify' && (
                <div>
                  <p className="text-xs text-neutral-400 mb-6">
                    Didn't receive it? Check your spam folder or{' '}
                    <button
                      type="button"
                      onClick={() => { setForgotStep({ step: 'request' }); setForgotCode(['', '', '', '', '', '']); setError(null); }}
                      className="underline hover:text-neutral-900 transition"
                    >
                      request a new code
                    </button>.
                  </p>

                  {/* Código de 6 dígitos */}
                  <div className="flex gap-2 justify-center mb-8">
                    {forgotCode.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={el => (forgotCodeRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleForgotCodeChange(idx, e.target.value)}
                        onKeyDown={e => handleForgotCodeKeyDown(idx, e)}
                        onPaste={idx === 0 ? handleForgotCodePaste : undefined}
                        className="w-12 h-14 text-center text-2xl font-bold border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 transition"
                      />
                    ))}
                  </div>

                  {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

                  <button
                    type="button"
                    onClick={handleForgotVerify}
                    disabled={loading}
                    className="w-full bg-neutral-900 text-white py-3 rounded-[50px] font-semibold hover:bg-neutral-800 transition disabled:opacity-50 text-base h-[50px]"
                  >
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </button>
                </div>
              )}

              {/* ── Paso 3: New password ── */}
              {forgotStep.step === 'new-password' && !pwSuccess && (
                <div>
                  <div className="mb-4">
                    <label className="text-sm font-medium text-neutral-700 mb-2 block">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        autoFocus
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-900 transition text-sm"
                      />
                      <button type="button" onClick={() => setShowNewPw(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition">
                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="text-sm font-medium text-neutral-700 mb-2 block">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPw ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmNewPassword}
                        onChange={e => setConfirmNewPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleForgotNewPassword()}
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-900 transition text-sm"
                      />
                      <button type="button" onClick={() => setShowConfirmPw(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition">
                        {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

                  <button
                    type="button"
                    onClick={handleForgotNewPassword}
                    disabled={loading}
                    className="w-full bg-neutral-900 text-white py-3 rounded-[50px] font-semibold hover:bg-neutral-800 transition disabled:opacity-50 text-base h-[50px]"
                  >
                    {loading ? 'Updating...' : 'Set New Password'}
                  </button>
                </div>
              )}

              {/* ── Éxito ── */}
              {forgotStep.step === 'new-password' && pwSuccess && (
                <div className="flex flex-col items-center justify-center py-8 gap-4">
                  <div className="w-14 h-14 rounded-full bg-neutral-900 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-neutral-600 text-sm text-center">Redirecting you to sign in…</p>
                </div>
              )}
            </div>
          )}

          {/* ── MODO CODE (comentado — conservado para referencia) ── */}
          {/*
          {mode === 'code' && ( ... )}
          */}

        </div>

        {/* Right column — desktop image */}
        <div className="hidden sm:block sm:w-7/12 relative p-2">
          <div
            className="w-full h-[650px] bg-cover bg-center rounded-3xl shadow-lg"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
        </div>
      </div>
    </div>
  );
};

export default AuthModal;