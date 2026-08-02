import React from 'react';
import { Clock, ShieldCheck, CheckCircle2, Phone, LogOut } from 'lucide-react';
import { Profile } from '../types';
import { EverglowLogo } from './EverglowLogo';

interface PendingApprovalViewProps {
  member: Profile;
  onLogout: () => void;
}

export const PendingApprovalView: React.FC<PendingApprovalViewProps> = ({ member, onLogout }) => {
  return (
    <div className="min-h-screen bg-[#FFF1F5] flex items-center justify-center p-4">
      <div className="card-white max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-pink-200">
        <EverglowLogo size="lg" showSubtext={false} />

        <div className="w-12 h-12 rounded-full bg-amber-100 text-[#8B6508] border border-amber-300 flex items-center justify-center mx-auto shadow-sm">
          <Clock className="w-6 h-6 animate-pulse" />
        </div>

        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8B6508] bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
            Status: Pending R100 Review
          </span>
          <h2 className="text-xl font-bold font-brand-serif text-slate-900 mt-2">
            Welcome, {member.full_name}!
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Sponsor ID: <span className="font-bold text-[#8B6508]">{member.sponsor_id}</span>
          </p>
        </div>

        <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-left text-xs text-slate-700 space-y-1.5">
          <p className="font-bold text-slate-900">What happens next?</p>
          <p>• Your R100 Registration Fee Proof of Payment (POP) has been uploaded to the Admin Queue.</p>
          <p>• The Admin will verify your payment and activate your account shortly.</p>
          <p>• Upon activation, you will gain full access to the Wholesale Store, E-Wallet, and 2-Level Network Tree!</p>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <a
            href={`https://wa.me/27729162168?text=${encodeURIComponent(`Hi Everglow Admin! Checking on my R100 registration POP approval for ${member.full_name} (${member.email}).`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>Send POP to Admin on WhatsApp (+27 72 916 2168)</span>
          </a>

          <button
            onClick={onLogout}
            className="w-full py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:bg-slate-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
