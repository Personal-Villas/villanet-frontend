import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import imageLoginDefault from '../assets/images/villanet-login.png';
import googleIcon from '../assets/images/google.png';
import appleIcon from '../assets/images/apple.png';
import facebookIcon from '../assets/images/facebook.png';
import people1 from '../assets/images/people-1.png';
import people2 from '../assets/images/people-2.png';
import people3 from '../assets/images/people-3.png';
import people4 from '../assets/images/people-4.png';
import people5 from '../assets/images/people-5.png';
import people6 from '../assets/images/people-6.png';
import { publicApi } from '../api/api';
import { useAuth } from '../auth/useAuth'; // ✅ Importa el hook real

// Definición de tipos
interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
  imageLogin?: string;
}

interface ApiResponse {
  message: string;
  userExists: boolean;
  user?: any;
}

const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  onSuccess,
  imageLogin,
}) => {
  const [mode, setMode] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [fullName, setFullName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [userExists, setUserExists] = useState<boolean>(false);
  
  // ✅ Usa el hook real de autenticación
  const { verifyCode: realVerifyCode } = useAuth();
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const bgImage = imageLogin ?? imageLoginDefault;

  useEffect(() => {
    if (mode === 'code' && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [mode]);

  const handleSocialClick = (provider: string): void => {
    console.log(`[AUTH] ${provider} login - in progress 🚧`);
  };

  const handleSendCode = async (): Promise<void> => {
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
  
    setError(null);
    setLoading(true);
  
    try {
      const response = await publicApi('/auth/send-code', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }) as ApiResponse;
  
      console.log('📥 /auth/send-code response:', response);
      setUserExists(response.userExists);
      setMode('code');
    } catch (err: any) {
      console.error('❌ send-code error:', err);
      setError(err.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string): void => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      handleVerifyCode();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    
    const newCode = pastedData.split('');
    while (newCode.length < 6) newCode.push('');
    
    setCode(newCode);
    
    const nextEmptyIndex = newCode.findIndex(c => !c);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifyCode = async (): Promise<void> => {
    const codeString = code.join('');
    if (codeString.length !== 6) {
      setError('Please enter the complete code');
      return;
    }
  
    if (!userExists && !fullName.trim()) {
      setError('Full name required for new users');
      return;
    }
  
    setError(null);
    setLoading(true);
  
    try {
      // ✅ Usa la función real verifyCode que actualiza el estado global
      const data = await realVerifyCode(email, codeString, fullName.trim() || undefined);
  
      console.log('✅ verify-code OK', data);
      
      // ✅ El hook useAuth ya actualizó el estado global del usuario
      // ✅ Ahora llamamos a onSuccess con el usuario real
      if (data.user) {
        onSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      console.error('❌ verify-code error:', err);
      setError(err.message || 'Invalid code');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = (): void => {
    setMode('email');
    setCode(['', '', '', '', '', '']);
    setFullName('');
    setError(null);
    setUserExists(false);
  };

  return (
    <div 
      className="
        fixed inset-0 bg-black/50 z-50
        flex items-stretch justify-center
        sm:p-6 sm:items-center
      "
      onClick={onClose}
    >
      <div 
        className="
          bg-white 
          w-full h-full
          rounded-none 
          sm:max-w-4xl sm:h-auto sm:rounded-3xl 
          relative shadow-2xl 
          flex flex-col sm:flex-row
          overflow-y-auto
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Imagen / background en mobile con fade y texto superpuesto */}
        <div className="sm:hidden w-full flex-shrink-0">
          <div className="w-full h-[50vh] relative overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${bgImage})` }}
            />
            {/* Gradiente que desvanece la imagen hacia blanco */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white" />
            
            {/* Texto superpuesto */}
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <h3 className="text-[25px] font-semibold text-neutral-900 mb-1">
                Sign in or sign up to continue
              </h3>
              <p className="text-[17px] text-neutral-600">
                Create a free account or sign in to continue. We will never sell your personal information.
              </p>
            </div>
          </div>
        </div>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition z-20 shadow-sm"
        >
          <X className="w-4 h-4 text-neutral-700" />
        </button>

        {/* Columna izquierda - contenido principal */}
        <div className="flex-1 p-4 sm:p-8 flex flex-col min-h-0">
          {/* Logo solo en desktop */}
          <div className="hidden sm:flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">Villanet</h2>
          </div>

          {mode === 'email' && (
            <>
              {/* Título solo en desktop, en mobile está sobre la imagen */}
              <h3 className="hidden sm:block text-[23px] font-semibold text-neutral-900 mb-3">
                Sign in or sign up to continue
              </h3>
              
              <p className="hidden sm:block text-sm text-neutral-600 mb-6">
                Create a free account or sign in to continue. We will never sell your personal information.
              </p>

              {/* Botones sociales */}
              <div className="flex gap-2 sm:gap-3 mb-4 lg:mt-5">
                <button
                  type="button"
                  onClick={() => handleSocialClick('apple')}
                  className="flex-1 border border-neutral-300 rounded-xl py-2.5 sm:py-2 flex items-center justify-center gap-2 hover:bg-neutral-50 transition text-sm font-medium"
                >
                  <img src={appleIcon} alt="Apple" className="w-9 h-9 lg:w-7 lg:h-7" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialClick('google')}
                  className="flex-1 border border-neutral-300 rounded-xl py-2.5 sm:py-2 flex items-center justify-center gap-2 hover:bg-neutral-50 transition text-sm font-medium"
                >
                  <img src={googleIcon} alt="Google" className="w-9 h-9 lg:w-6 lg:h-6" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialClick('facebook')}
                  className="flex-1 border border-neutral-300 rounded-xl py-2.5 sm:py-2 flex items-center justify-center gap-2 hover:bg-neutral-50 transition text-sm font-medium"
                >
                  <img src={facebookIcon} alt="Facebook" className="w-9 h-9 lg:w-6 lg:h-6" />
                </button>
              </div>

              {/* Separador OR */}
              <div className="flex items-center gap-3 my-4 lg:my-8">
                <div className="h-px bg-neutral-200 flex-1" />
                <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">or</span>
                <div className="h-px bg-neutral-200 flex-1" />
              </div>

              <div className="flex-1">
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
                  className="w-full px-4 py-3 rounded-[50px] h-[70px] lg:h-[50px] border border-neutral-300 focus:outline-none focus:border-neutral-900 transition mb-4 text-[17px] lg:text-[15px]"
                />
                
                {error && <p className="text-red-600 text-[17px] mb-4">{error}</p>}

                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={loading}
                  className="w-full bg-neutral-900 text-white py-3 rounded-[50px] h-[70px] lg:h-[50px] hover:bg-neutral-800 transition disabled:opacity-50 text-[20px] lg:text-[17px]"
                >
                  {loading ? 'Sending code...' : 'Continue'}
                </button>
              </div>

              <div className="mt-6 pt-4">
                <div className="flex items-center justify-center gap-3 text-xs text-neutral-600">
                  <div className="flex -space-x-2">
                    <img
                      src={people1}
                      alt="Person 1"
                      className="w-6 h-6 rounded-full bg-neutral-300 border-2 border-white object-cover"
                    />
                    <img
                      src={people2}
                      alt="Person 2"
                      className="w-6 h-6 rounded-full bg-neutral-300 border-2 border-white object-cover"
                    />
                    <img
                      src={people3}     
                      alt="Person 3"
                      className="w-6 h-6 rounded-full bg-neutral-300 border-2 border-white object-cover"
                    />
                    <img
                      src={people4}
                      alt="Person 4"
                      className="w-6 h-6 rounded-full bg-neutral-300 border-2 border-white object-cover"
                    />
                    <img
                      src={people5}
                      alt="Person 5"
                      className="w-6 h-6 rounded-full bg-neutral-300 border-2 border-white object-cover"
                    />
                    <img
                      src={people6}
                      alt="Person 6"
                      className="w-6 h-6 rounded-full bg-neutral-300 border-2 border-white object-cover"
                    />
                  </div>
                  <span>Join 636,748 happy Villaneters...</span>
                </div>
              </div>
            </>
          )}

          {mode === 'code' && (
            <div className="flex-1 flex flex-col">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  We sent you a 6-digit code
                </h3>
                
                <p className="text-sm text-neutral-600 mb-2">
                  to {email}
                </p>
                
                <p className="text-sm text-neutral-500 mb-6 lg:mb-10">
                  Click the link or enter the code below to login
                </p>

                <div>
                  {!userExists && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 transition text-sm"
                      />
                    </div>
                  )}

                  <div className="flex gap-2 mb-4 lg:mb-10 justify-center">
                    {code.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (inputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        onPaste={idx === 0 ? handlePaste : undefined}
                        className="w-12 h-14 text-center text-2xl font-bold border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 transition"
                      />
                    ))}
                  </div>
                  
                  {error && (
                    <p className="text-red-600 text-sm mb-4 text-center">
                      {error}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={loading}
                    className="w-full bg-neutral-900 text-white py-3 rounded-[50px] font-semibold hover:bg-neutral-800 transition disabled:opacity-50 mb-3 text-base"
                  >
                    {loading ? 'Verifying...' : 'Continue'}
                  </button>

                  <button
                    type="button"
                    onClick={handleGoBack}
                    className="w-full text-neutral-600 text-sm hover:text-neutral-900 transition text-center lg:mt-3"
                  >
                    ← Go back
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-200">
                <div className="flex items-center justify-center gap-4 text-sm text-neutral-600">
                  <div className="inline-flex -space-x-1.5">
                    <img
                      src={people1}
                      alt="Person 1"
                      className="w-6 h-6 rounded-full bg-neutral-300 border-2 border-white object-cover"
                    />
                    <img
                      src={people2}
                      alt="Person 2"
                      className="w-6 h-6 rounded-full bg-neutral-300 border-2 border-white object-cover"
                    />
                    <img
                      src={people3}
                      alt="Person 3"
                      className="w-6 h-6 rounded-full bg-neutral-300 border-2 border-white object-cover"
                    />
                  </div>
                  <p className="text-sm text-neutral-600 ml-[-2px]">Join 636,748 happy Villaneters...</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha - imagen desktop */}
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