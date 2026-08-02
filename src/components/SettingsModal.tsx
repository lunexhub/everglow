import React, { useState } from 'react';
import { User, ShieldCheck, Banknote, Truck, Save, X, CheckCircle2, Loader2 } from 'lucide-react';
import { Profile, BankDetails, ShippingAddress } from '../types';

interface SettingsModalProps {
  member: Profile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile: (updated: Profile) => void;
  isSaving?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  member,
  isOpen,
  onClose,
  onUpdateProfile,
  isSaving = false
}) => {
  if (!isOpen) return null;

  // Personal Info State
  const [fullName, setFullName] = useState(member.full_name);
  const [phone, setPhone] = useState(member.phone);
  const [email] = useState(member.email);

  // Banking Details State
  const [bankName, setBankName] = useState(member.bank_details?.bank_name || '');
  const [accountNumber, setAccountNumber] = useState(member.bank_details?.account_number || '');
  const [accountType, setAccountType] = useState(member.bank_details?.account_type || 'Savings');
  const [branchCode, setBranchCode] = useState(member.bank_details?.branch_code || '');

  // Physical Courier Address State
  const [street, setStreet] = useState(member.shipping_address?.street || '');
  const [suburb, setSuburb] = useState(member.shipping_address?.suburb || '');
  const [city, setCity] = useState(member.shipping_address?.city || '');
  const [province, setProvince] = useState(member.shipping_address?.province || 'Gauteng');
  const [postalCode, setPostalCode] = useState(member.shipping_address?.postal_code || '');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedBankDetails: BankDetails = {
      bank_name: bankName,
      account_number: accountNumber,
      account_type: accountType,
      branch_code: branchCode
    };

    const updatedShippingAddress: ShippingAddress = {
      street,
      suburb,
      city,
      province,
      postal_code: postalCode
    };

    const updatedProfile: Profile = {
      ...member,
      full_name: fullName,
      phone,
      bank_details: updatedBankDetails,
      shipping_address: updatedShippingAddress
    };

    onUpdateProfile(updatedProfile);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 pb-20 overflow-hidden">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-pink-200 flex flex-col max-h-[82vh] my-auto overflow-hidden">
        {/* Fixed Header */}
        <div className="p-4 border-b border-pink-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-pink-100 text-pink-700 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-brand-serif text-slate-900 leading-tight">
                Account & Delivery Settings
              </h3>
              <p className="text-[10px] text-slate-500 font-semibold">
                Sponsor ID: {member.sponsor_id} • POPIA Secured
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="settings-form" onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 text-xs flex-1">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Settings updated successfully! Synchronized with Admin.</span>
            </div>
          )}

          {/* SECTION 1: Personal Contact Info */}
          <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 text-[#8B6508] font-extrabold uppercase text-[10px]">
              <User className="w-3.5 h-3.5" />
              <span>1. Personal & Contact Information</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email (Read Only)</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-500 font-semibold cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Banking Details for 15th/30th Cash-Outs */}
          <div className="space-y-2.5 p-3 bg-amber-50/60 rounded-xl border border-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#8B6508] font-extrabold uppercase text-[10px]">
                <Banknote className="w-3.5 h-3.5" />
                <span>2. South African Bank Details (15th/30th Payouts)</span>
              </div>
              <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">POPIA</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Bank Name *</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
              >
                <option value="Capitec Bank">Capitec Bank</option>
                <option value="FNB (First National Bank)">FNB (First National Bank)</option>
                <option value="Standard Bank">Standard Bank</option>
                <option value="Absa Bank">Absa Bank</option>
                <option value="Nedbank">Nedbank</option>
                <option value="TymeBank">TymeBank</option>
                <option value="African Bank">African Bank</option>
                <option value="Discovery Bank">Discovery Bank</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Account Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1489023412"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Account Type *</label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
                >
                  <option value="Savings">Savings Account</option>
                  <option value="Cheque">Cheque / Current Account</option>
                  <option value="Transmission">Transmission Account</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Universal Branch Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. 470010 (Capitec)"
                value={branchCode}
                onChange={(e) => setBranchCode(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold"
              />
            </div>
          </div>

          {/* SECTION 3: Physical Courier Delivery Address */}
          <div className="space-y-2.5 p-3 bg-pink-50/60 rounded-xl border border-pink-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-pink-700 font-extrabold uppercase text-[10px]">
                <Truck className="w-3.5 h-3.5" />
                <span>3. Physical Delivery Address (For Courier Dispatch)</span>
              </div>
              <span className="text-[9px] font-bold text-pink-700 bg-pink-100 px-2 py-0.5 rounded">Admin Shipping</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Street Address *</label>
              <input
                type="text"
                required
                placeholder="e.g. 142 Jan Smuts Avenue, Unit 4"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-pink-200 rounded-lg text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Suburb / Township *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rosebank"
                  value={suburb}
                  onChange={(e) => setSuburb(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-pink-200 rounded-lg text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">City / Town *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Johannesburg"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-pink-200 rounded-lg text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Province *</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-pink-200 rounded-lg text-xs font-semibold text-slate-900"
                >
                  <option value="Gauteng">Gauteng</option>
                  <option value="Western Cape">Western Cape</option>
                  <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                  <option value="Eastern Cape">Eastern Cape</option>
                  <option value="Free State">Free State</option>
                  <option value="Limpopo">Limpopo</option>
                  <option value="Mpumalanga">Mpumalanga</option>
                  <option value="North West">North West</option>
                  <option value="Northern Cape">Northern Cape</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Postal Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2196"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-pink-200 rounded-lg text-xs font-semibold"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Fixed Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="settings-form"
            disabled={isSaving}
            className="flex-1 py-2.5 bg-[#D4AF37] hover:bg-[#C5A028] disabled:opacity-60 text-slate-900 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md transition-all"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
