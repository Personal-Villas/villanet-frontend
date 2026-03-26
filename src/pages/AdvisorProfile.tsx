import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { UnifiedHeader } from '../components/Header';
import { Save, Lock, Eye, EyeOff } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface AdvisorProfileData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  advisor_type: string | null;
  travel_regions: string[];
  typical_group_size: string | null;
  villa_budget_range: string | null;
  commission_preference: string | null;
  website: string | null;
  profile_completion_percentage: number;
  avatar_url: string | null;
  full_name: string;
}

export const AdvisorProfile: React.FC = () => {
  const { accessToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<AdvisorProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Branding Info fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [website, setWebsite] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Logo state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  // Security fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  // ── Fetch profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!accessToken) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/advisors/profile`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();
        setProfile(data.profile);
        setFirstName(data.profile.first_name ?? '');
        setLastName(data.profile.last_name ?? '');
        setWebsite(data.profile.website ?? '');
        setAvatarUrl(data.profile.avatar_url ?? null);
      } catch {
        setError('Could not load your profile. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [accessToken]);

  // ── Save branding info ─────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!accessToken) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(`${API_BASE_URL}/advisors/profile`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ website }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to update');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setError('Could not save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Logo upload ────────────────────────────────────────────────────────────
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;

    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
    if (!ALLOWED.includes(file.type)) { setLogoError('Invalid format. Use JPG, PNG or WEBP.'); return; }
    if (file.size > 2 * 1024 * 1024) { setLogoError('File exceeds 2MB limit.'); return; }

    setLogoError(null);
    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append('agency_logo', file);
      const res = await fetch(`${API_BASE_URL}/advisors/profile/logo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setAvatarUrl(data.avatar_url);
      window.dispatchEvent(new Event('authStateChange'));
    } catch {
      setLogoError('Upload failed. Please try again.');
    } finally {
      setLogoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Update password ────────────────────────────────────────────────────────
  // Conectado a POST /advisors/profile/change-password (requiere Bearer token)
  const handleUpdatePassword = async () => {
    setPwError(null);
    setPwSuccess(false);

    if (!currentPassword) { setPwError('Please enter your current password.'); return; }
    if (newPassword.length < 8) { setPwError('New password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match.'); return; }

    if (!accessToken) { setPwError('Session expired. Please log in again.'); return; }

    setPwSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/advisors/profile/change-password`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        // El backend devuelve mensajes específicos: contraseña incorrecta, etc.
        setPwError(data.message || 'Could not update password. Please try again.');
        return;
      }

      setPwSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwSuccess(false), 3000);
    } catch {
      setPwError('Could not update password. Please try again.');
    } finally {
      setPwSaving(false);
    }
  };

  // ── Loading / Error states ─────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <UnifiedHeader />
        <div className="min-h-screen flex items-center justify-center pt-16">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (error && !profile) {
    return (
      <>
        <UnifiedHeader />
        <div className="min-h-screen flex items-center justify-center pt-16">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <UnifiedHeader />
      <div className="min-h-screen bg-white pt-16">
        <div className="max-w-2xl mx-auto px-6 py-14">

          {/* Page header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">My Profile</h1>
            <p className="text-sm text-gray-500">
              This information will brand the quotes you send to clients via Villa Net.
            </p>
          </div>

          {/* ── Card: Branding Info ── */}
          <div className="border border-gray-200 rounded-xl p-8 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Branding Info</h2>
            <p className="text-sm text-gray-500 mb-7">Upload your logo and fill in your details.</p>

            {/* Logo */}
            <div
              className="flex items-center gap-4 mb-8 cursor-pointer w-fit"
              onClick={() => !logoUploading && fileInputRef.current?.click()}
              title="Click to upload logo"
            >
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 hover:border-gray-500 transition-colors">
                {logoUploading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt="Company logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xl text-gray-400 font-light">?</span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Company Logo</p>
                <p className="text-xs text-gray-400">Click to upload (JPG, PNG)</p>
                {logoError && <p className="text-xs text-red-500 mt-0.5">{logoError}</p>}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="sr-only"
              onChange={handleLogoChange}
            />

            {/* Name row */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Jane"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={profile?.email ?? ''}
                readOnly
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Website */}
            <div className="mb-7">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
              <input
                type="text"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                placeholder="https://myagency.com"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>

            {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : saveSuccess ? 'Saved ✓' : 'Save Profile'}
            </button>
          </div>

          {/* ── Card: Security ── */}
          <div className="border border-gray-200 rounded-xl p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Security</h2>
            <p className="text-sm text-gray-500 mb-7">Create or update your password.</p>

            {/* Current Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm pr-10 focus:outline-none focus:border-gray-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm pr-10 focus:outline-none focus:border-gray-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-7">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleUpdatePassword()}
                  placeholder="••••••••••"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm pr-10 focus:outline-none focus:border-gray-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {pwError && <p className="text-xs text-red-500 mb-4">{pwError}</p>}
            {pwSuccess && <p className="text-xs text-green-600 mb-4">Password updated successfully ✓</p>}

            <button
              onClick={handleUpdatePassword}
              disabled={pwSaving || !currentPassword || !newPassword || !confirmPassword}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              <Lock className="w-4 h-4" />
              {pwSaving ? 'Updating...' : pwSuccess ? 'Updated ✓' : 'Update Password'}
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default AdvisorProfile;