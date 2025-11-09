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


// Mock de useAuth para el ejemplo
const useAuth = () => ({
    verifyCode: async (email: string, code: string, fullName: string) => {
      console.log('Verifying code:', { email, code, fullName });
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  });
  
  // Mock de api para el ejemplo
  const api = async <T,>(url: string, options: any): Promise<T> => {
    console.log('API call:', url, options);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { message: 'Code sent', userExists: Math.random() > 0.5 } as T;
  };
  
  interface AuthModalProps {
    onClose: () => void;
    onSuccess: () => void;
    message?: string;
    imageLogin?: string;
  }
  
  function AuthModal({
    onClose,
    onSuccess,
    imageLogin,
  }: AuthModalProps) {
    const [mode, setMode] = useState<'email' | 'code'>('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [userExists, setUserExists] = useState(false);
    const { verifyCode } = useAuth();
    
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const bgImage = imageLogin ?? imageLoginDefault;
  
    useEffect(() => {
      if (mode === 'code' && inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, [mode]);
  
    const handleSocialClick = (provider: 'apple' | 'google' | 'facebook') => {
      console.log(`[AUTH] ${provider} login - in progress 🚧`);
    };
  
    const handleSendCode = async () => {
      if (!email.includes('@')) {
        setError('Please enter a valid email');
        return;
      }
      
      setError(null);
      setLoading(true);
      
      try {
        const response = await api<{ message: string; userExists: boolean }>(
          '/auth/send-code',
          {
            method: 'POST',
            body: JSON.stringify({ email }),
          }
        );
  
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
  
    const handleCodeChange = (index: number, value: string) => {
      if (value.length > 1) value = value[0];
      if (!/^\d*$/.test(value)) return;
      
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    };
  
    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' && !code[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      if (e.key === 'Enter') {
        handleVerifyCode();
      }
    };
  
    const handlePaste = (e: React.ClipboardEvent) => {
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
  
    const handleVerifyCode = async () => {
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
        await verifyCode(email, codeString, fullName);
        onSuccess();
        onClose();
      } catch (err: any) {
        console.error('❌ verify-code error:', err);
        setError(err.message || 'Invalid code');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } finally {
        setLoading(false);
      }
    };
  
    const handleGoBack = () => {
      setMode('email');
      setCode(['', '', '', '', '', '']);
      setFullName('');
      setError(null);
      setUserExists(false);
    };
  
    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 sm:p-6"
        onClick={onClose}
      >
        <div 
          className="
            bg-white 
            w-full h-full 
            rounded-none 
            sm:max-w-4xl sm:rounded-3xl 
            relative shadow-2xl 
            flex flex-col sm:flex-row
            max-h-screen sm:max-h-[90vh]
            overflow-y-auto sm:overflow-hidden
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Imagen / background en mobile con fade */}
          <div className="sm:hidden w-full px-5 pt-5">
            <div className="w-full h-56 relative rounded-2xl overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${bgImage})` }}
              />
              {/* Gradiente que desvanece la imagen hacia blanco, como Wander */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white" />
            </div>
          </div>
  
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition z-10 shadow-sm"
          >
            <X className="w-4 h-4 text-neutral-700" />
          </button>
  
          {/* Columna izquierda - contenido principal */}
          <div className="w-full sm:w-5/12 p-5 sm:p-8 flex flex-col">
            {/* Logo solo en desktop */}
            <div className="hidden sm:flex items-center gap-2 mb-5 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-neutral-900 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-base sm:text-lg">V</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">Villanet</h2>
            </div>
  
            {mode === 'email' && (
              <>
                <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-1.5 sm:mb-2">
                  Sign in or sign up to continue
                </h3>
                
                <p className="text-xs sm:text-sm text-neutral-600 mb-4 sm:mb-6">
                  Create a free account or sign in to continue. We will never sell your personal information.
                </p>
  
                {/* Botones sociales */}
                <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <button
                    type="button"
                    onClick={() => handleSocialClick('apple')}
                    className="flex-1 border border-neutral-300 rounded-xl py-2.5 sm:py-2 flex items-center justify-center gap-2 hover:bg-neutral-50 transition text-xs sm:text-sm font-medium"
                  >
                    <img src={appleIcon} alt="Apple" className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialClick('google')}
                    className="flex-1 border border-neutral-300 rounded-xl py-2.5 sm:py-2 flex items-center justify-center gap-2 hover:bg-neutral-50 transition text-xs sm:text-sm font-medium"
                  >
                    <img src={googleIcon} alt="Google" className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialClick('facebook')}
                    className="flex-1 border border-neutral-300 rounded-xl py-2.5 sm:py-2 flex items-center justify-center gap-2 hover:bg-neutral-50 transition text-xs sm:text-sm font-medium"
                  >
                    <img src={facebookIcon} alt="Facebook" className="w-5 h-5" />
                  </button>
                </div>
  
                {/* Separador OR */}
                <div className="flex items-center gap-3 my-3 sm:my-4">
                  <div className="h-px bg-neutral-200 flex-1" />
                  <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">or</span>
                  <div className="h-px bg-neutral-200 flex-1" />
                </div>
  
                <div>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
                    className="w-full px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 transition mb-3 sm:mb-4 text-sm"
                  />
                  
                  {error && <p className="text-red-600 text-xs sm:text-sm mb-3 sm:mb-4">{error}</p>}
  
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={loading}
                    className="w-full bg-neutral-900 text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-neutral-800 transition disabled:opacity-50 text-sm sm:text-base"
                  >
                    {loading ? 'Sending code...' : 'Continue'}
                  </button>
                </div>
  
                <p className="text-[10px] sm:text-xs text-neutral-500 text-center mt-4 sm:mt-6 leading-relaxed">
                  By continuing, you agree to Villanet&apos;s Terms of Service and Privacy Policy.
                </p>
  
                <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-neutral-600">
                  <div className="flex -space-x-2">
                    <img
                      src={people1}
                      alt="Person 1"
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-neutral-300 border-2 border-white object-cover"
                    />
                    <img
                      src={people2}
                      alt="Person 2"
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-neutral-300 border-2 border-white object-cover"
                    />
                    <img
                      src={people3}     
                      alt="Person 3"
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-neutral-300 border-2 border-white object-cover"
                    />
                    <img
                      src={people4}
                      alt="Person 4"
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-neutral-300 border-2 border-white object-cover"
                    />
                    <img
                      src={people5}
                      alt="Person 5"
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-neutral-300 border-2 border-white object-cover"
                    />
                    <img
                      src={people6}
                      alt="Person 6"
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-neutral-300 border-2 border-white object-cover"
                    />
                  </div>
  
                  <span>Join 636,748 happy Villaneters...</span>
                </div>
              </>
            )}
  
            {mode === 'code' && (
              <>
                <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-1.5 sm:mb-2">
                  We sent you a 6-digit code
                </h3>
                
                <p className="text-xs sm:text-sm text-neutral-600 mb-1 sm:mb-2">
                  to {email}
                </p>
                
                <p className="text-xs sm:text-sm text-neutral-500 mb-4 sm:mb-6">
                  Click the link or enter the code below to login
                </p>
  
                <div>
                  {!userExists && (
                    <div className="mb-3 sm:mb-4">
                      <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 transition text-sm"
                      />
                    </div>
                  )}
  
                  <div className="flex gap-1.5 sm:gap-2 mb-3 sm:mb-4 justify-center">
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
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 transition"
                      />
                    ))}
                  </div>
                  
                  {error && (
                    <p className="text-red-600 text-xs sm:text-sm mb-3 sm:mb-4 text-center">
                      {error}
                    </p>
                  )}
  
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={loading}
                    className="w-full bg-neutral-900 text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-neutral-800 transition disabled:opacity-50 mb-2 sm:mb-3 text-sm sm:text-base"
                  >
                    {loading ? 'Verifying...' : 'Continue'}
                  </button>
  
                  <button
                    type="button"
                    onClick={handleGoBack}
                    className="w-full text-neutral-600 text-xs sm:text-sm hover:text-neutral-900 transition text-center"
                  >
                    ← Go back
                  </button>
                </div>
  
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-neutral-200">
                  <div className="flex items-center justify-center gap-2 sm:gap-4 text-[11px] sm:text-sm text-neutral-600">
                    <span className="inline-flex -space-x-1.5">
                      <span className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-neutral-300 border-2 border-white" />
                      <span className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-neutral-300 border-2 border-white" />
                      <span className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-neutral-300 border-2 border-white" />
                    </span>
                    <span>Join 636,748 happy Villaneters...</span>
                  </div>
                </div>
              </>
            )}
          </div>
  
          {/* Columna derecha - imagen desktop */}
          <div className="hidden sm:block sm:w-7/12 relative p-2">
            <div
              className="w-full h-full bg-cover bg-center rounded-3xl shadow-lg"
              style={{ backgroundImage: `url(${bgImage})` }}
            />
          </div>
        </div>
      </div>
    );
  }
  
  // Demo Component
  export default function App() {
    const [showModal, setShowModal] = useState(true);
  
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition"
        >
          Open Auth Modal
        </button>
  
        {showModal && (
          <AuthModal
            onClose={() => setShowModal(false)}
            onSuccess={() => console.log('Success!')}
          />
        )}
      </div>
    );
  }
  