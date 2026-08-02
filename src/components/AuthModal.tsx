import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Phone, KeyRound, Upload, CheckCircle, Crown, ArrowRight, ShieldCheck, UserCheck, MessageSquare, Eye, EyeOff } from 'lucide-react';
import { Profile } from '../types';
import { EverglowLogo } from './EverglowLogo';
import { signInWithSupabase, signUpWithSupabase } from '../lib/supabaseService';

interface AuthModalProps {
  onLoginSuccess: (user: Profile) => void;
  isDemoMode: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLoginSuccess, isDemoMode }) => {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [sponsorId, setSponsorId] = useState('');
  const [isAutoFilledSponsor, setIsAutoFilledSponsor] = useState(false);
  const [popFile, setPopFile] = useState<File | null>(null);
  const [popPreview, setPopPreview] = useState<string | null>(null);
  
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Auto-detect Sponsor ID from URL link (e.g. everglowcommunity.co.za/?sponsor=EG-8942)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRef = params.get('sponsor') || params.get('ref') || params.get('upline') || params.get('id');
    
    if (urlRef) {
      const cleanRef = urlRef.trim().toUpperCase();
      setSponsorId(cleanRef);
      setIsAutoFilledSponsor(true);
      setTab('signup');
    }
  }, []);

  const handlePopUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPopFile(file);
      setPopPreview(URL.createObjectURL(file));
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    const { profile, error } = await signInWithSupabase(email, password);
    if (error || !profile) {
      setErrorMsg(error || 'Failed to sign in. Please verify your credentials.');
      return;
    }

    onLoginSuccess(profile);
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const targetSponsor = sponsorId.trim() || 'EG-0001';

    if (!email || !password) {
      setErrorMsg('Please enter an email and password.');
      return;
    }

    const { profile, error } = await signUpWithSupabase(email, password, fullName, phone, targetSponsor);
    if (error || !profile) {
      setErrorMsg(error || 'Registration failed. Please try again.');
      return;
    }

    // Automatically trigger WhatsApp POP submission link to Admin +27 72 916 2168
    const waMsg = `Hi Everglow Admin! I have registered my distributor account on Everglow Community.\n\n*Name:* ${fullName || 'New Member'}\n*Email:* ${email}\n*Phone:* ${phone}\n*Sponsor Code:* ${targetSponsor}\n\nAttaching my R100 Registration Fee Proof of Payment (POP) here for account activation!`;
    const waUrl = `https://wa.me/27729162168?text=${encodeURIComponent(waMsg)}`;
    window.open(waUrl, '_blank');

    onLoginSuccess(profile);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(true);
  };

  return (
    <div className="auth-bg">
      {/* Brand Header */}
      <div className="text-center mb-6 max-w-sm">
        <EverglowLogo size="xl" showSubtext={true} />
      </div>

      {/* Auth Card */}
      <div className="auth-card">
        {/* Tab Selection Bar */}
        <div className="auth-tab-bar">
          <button
            type="button"
            className={tab === 'signin' ? 'auth-tab-active' : 'auth-tab-inactive'}
            onClick={() => { setTab('signin'); setErrorMsg(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={tab === 'signup' ? 'auth-tab-active' : 'auth-tab-inactive'}
            onClick={() => { setTab('signup'); setErrorMsg(''); }}
          >
            Sign Up
          </button>
        </div>

        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
              {errorMsg}
            </div>
          )}

          {tab === 'signin' ? (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div className="auth-input-container">
                <Mail className="auth-input-icon" />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                />
              </div>

              <div className="auth-input-container">
                <Lock className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                  <input type="checkbox" className="rounded text-[#D4AF37] focus:ring-[#D4AF37]" defaultChecked />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => { setShowForgotModal(true); setResetSent(false); }}
                  className="text-[#8B6508] font-semibold hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <button type="submit" className="btn-gold flex items-center justify-center gap-2">
                <span>Sign In To Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUpSubmit} className="space-y-3">
              {/* Mandatory Sponsor ID Link */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">
                    Sponsor Referral Code *
                  </label>
                  {isAutoFilledSponsor && (
                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                      <UserCheck className="w-3 h-3" /> Auto-Filled From Link
                    </span>
                  )}
                </div>
                <div className="auth-input-container">
                  <KeyRound className="auth-input-icon text-[#8B6508]" />
                  <input
                    type="text"
                    required
                    placeholder="Enter Sponsor Code or EG-0001"
                    value={sponsorId}
                    onChange={(e) => setSponsorId(e.target.value.toUpperCase())}
                    className="auth-input bg-amber-50/60 font-bold text-[#8B6508]"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1 italic">
                  {sponsorId ? (
                    <>Registering under Sponsor ID: <span className="font-bold text-[#8B6508]">{sponsorId}</span></>
                  ) : (
                    <>Enter your sponsor's code (or <span className="font-bold text-[#8B6508]">EG-0001</span> for Company Master)</>
                  )}
                </p>
              </div>

              <div className="auth-input-container">
                <User className="auth-input-icon" />
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="auth-input"
                />
              </div>

              <div className="auth-input-container">
                <Mail className="auth-input-icon" />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                />
              </div>

              <div className="auth-input-container">
                <Phone className="auth-input-icon" />
                <input
                  type="tel"
                  required
                  placeholder="WhatsApp Mobile Number (+27...)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="auth-input"
                />
              </div>

              <div className="auth-input-container">
                <Lock className="auth-input-icon" />
                <input
                  type={showSignUpPassword ? 'text' : 'password'}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSignUpPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                  title={showSignUpPassword ? 'Hide password' : 'Show password'}
                >
                  {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Mandatory R100 Registration Fee via WhatsApp */}
              <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">R100 Registration Fee POP</span>
                  <span className="text-[10px] font-extrabold bg-[#D4AF37] text-slate-900 px-2 py-0.5 rounded-full">
                    Mandatory
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Deposit R100 to Everglow Bank Account and send your Proof of Payment (POP) slip directly to <strong>WhatsApp (+27 72 916 2168)</strong> for instant Admin activation.
                </p>

                <a
                  href={`https://wa.me/27729162168?text=${encodeURIComponent(`Hi Everglow Admin! I am submitting my R100 Registration POP.\nName: ${fullName || ''}\nEmail: ${email}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Phone className="w-4 h-4" />
                  <span>Send POP to WhatsApp (+27 72 916 2168)</span>
                </a>
              </div>

              <button type="submit" className="btn-gold mt-2 flex items-center justify-center gap-2">
                <span>Register & Open WhatsApp POP (+27 72 916 2168)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Forgot Password Recovery Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-pink-100">
            <h3 className="text-lg font-bold text-slate-900 font-brand-serif mb-2">
              Password Recovery
            </h3>

            {resetSent ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <p className="text-xs text-slate-700 font-medium">
                  If an account exists for <strong>{resetEmail}</strong>, a password reset link has been sent to your email inbox!
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-2 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-xs text-slate-600">
                  Enter your registered Everglow email address to receive password recovery instructions.
                </p>
                <div className="auth-input-container">
                  <Mail className="auth-input-icon" />
                  <input
                    type="email"
                    required
                    placeholder="Enter registered email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="auth-input"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#D4AF37] text-slate-900 rounded-lg text-xs font-bold"
                  >
                    Send Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Sticky Floating WhatsApp Button */}
      <a
        href={`https://wa.me/27729162168?text=${encodeURIComponent('Hi Everglow Admin! I need help with my registration or submitting my POP.')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-emerald-400 group cursor-pointer"
        title="Chat with Admin on WhatsApp (+27 72 916 2168)"
      >
        <div className="relative flex items-center justify-center">
          <MessageSquare className="w-5 h-5 fill-white text-emerald-600" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping"></span>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full"></span>
        </div>
        <div className="text-left leading-tight hidden sm:block">
          <p className="text-[9px] font-extrabold text-emerald-100 uppercase tracking-wider">Need Help / Submit POP?</p>
          <p className="text-xs font-black">WhatsApp Admin</p>
        </div>
      </a>
    </div>
  );
};
