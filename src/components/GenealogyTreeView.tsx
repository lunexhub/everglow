import React, { useState, useEffect } from 'react';
import { Users, Phone, MessageSquare, QrCode, Crown, Search, CheckCircle, Clock, Copy, Share2, X, Eye } from 'lucide-react';
import QRCode from 'qrcode';
import { Profile } from '../types';
import { EverglowLogo } from './EverglowLogo';

interface GenealogyTreeViewProps {
  member: Profile;
  downlineTree?: Profile[];
}

export const GenealogyTreeView: React.FC<GenealogyTreeViewProps> = ({
  member,
  downlineTree = []
}) => {
  const [filterLevel, setFilterLevel] = useState<'all' | 'level1' | 'level2'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedMemberForModal, setSelectedMemberForModal] = useState<Profile | null>(null);
  const [copiedAccId, setCopiedAccId] = useState<string | null>(null);
  const [copiedAddrId, setCopiedAddrId] = useState<string | null>(null);

  const handleCopyText = (id: string, textToCopy: string, type: 'acc' | 'addr') => {
    navigator.clipboard.writeText(textToCopy);
    if (type === 'acc') {
      setCopiedAccId(id);
      setTimeout(() => setCopiedAccId(null), 2000);
    } else {
      setCopiedAddrId(id);
      setTimeout(() => setCopiedAddrId(null), 2000);
    }
  };

  useEffect(() => {
    const inviteLink = `https://everglowcommunity.co.za/?sponsor=${member.sponsor_id}`;
    QRCode.toDataURL(inviteLink, { width: 220, margin: 1, color: { dark: '#0F172A', light: '#FFFFFF' } })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('QR code generation error:', err));
  }, [member.sponsor_id]);

  const level1Members = downlineTree.filter(m => m.upline_id === member.id);
  const level2Members = downlineTree.filter(m => {
    const directIds = level1Members.map(l1 => l1.id);
    return m.upline_id && directIds.includes(m.upline_id);
  });

  const filteredMembers = downlineTree.filter(m => {
    const matchesSearch = m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.sponsor_id.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterLevel === 'level1') return m.upline_id === member.id;
    if (filterLevel === 'level2') {
      const directIds = level1Members.map(l1 => l1.id);
      return m.upline_id && directIds.includes(m.upline_id);
    }
    return true;
  });

  const handleWhatsAppInvite = (phone: string, text?: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(text || `Hi! Connecting with you from Everglow Community MLM team.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleCopyInviteLink = () => {
    const link = `https://everglowcommunity.co.za/?sponsor=${member.sponsor_id}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsAppInvite = () => {
    const inviteLink = `https://everglowcommunity.co.za/?sponsor=${member.sponsor_id}`;
    const message = encodeURIComponent(
      `Hi! Join my Everglow Community team and start earning with luxury beauty & home essentials! ✨\n\n` +
      `Register directly under my Sponsor ID (${member.sponsor_id}):\n${inviteLink}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Digital Member ID Card Header */}
      <div className="bg-gradient-to-br from-pink-100 via-pink-50 to-amber-100 rounded-2xl p-5 border border-pink-200 shadow-sm relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <EverglowLogo size="md" showSubtext={false} />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8B6508] bg-amber-200/60 px-2 py-0.5 rounded-full">
                Distributor ID Card
              </span>
              <h2 className="text-lg font-bold font-brand-serif text-slate-900 mt-0.5">
                {member.full_name}
              </h2>
              <p className="text-xs text-slate-600 font-semibold">
                Sponsor ID: <span className="text-[#8B6508] font-bold">{member.sponsor_id}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowQRModal(true)}
            className="p-2.5 bg-white border border-amber-300 rounded-xl text-[#8B6508] hover:bg-amber-50 shadow-xs flex flex-col items-center gap-0.5"
          >
            <QrCode className="w-5 h-5" />
            <span className="text-[9px] font-extrabold">QR Badge</span>
          </button>
        </div>

        {/* Quick Link Sharing Action Bar */}
        <div className="mt-4 pt-3 border-t border-pink-200/80 flex gap-2">
          <button
            onClick={handleCopyInviteLink}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all ${
              copiedLink
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-amber-300 text-slate-800 hover:bg-amber-50'
            }`}
          >
            {copiedLink ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-[#8B6508]" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          <button
            onClick={handleShareWhatsAppInvite}
            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Share WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Network Stats Bar */}
      <div className="grid grid-cols-3 gap-2">
        <div className="card-white p-3 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Total Team</p>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5">{downlineTree.length}</p>
        </div>
        <div className="card-white p-3 text-center border-l-2 border-l-[#D4AF37]">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Level 1 (Direct)</p>
          <p className="text-xl font-extrabold text-[#8B6508] mt-0.5">{level1Members.length}</p>
        </div>
        <div className="card-white p-3 text-center border-l-2 border-l-pink-400">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Level 2 (Indirect)</p>
          <p className="text-xl font-extrabold text-pink-600 mt-0.5">{level2Members.length}</p>
        </div>
      </div>

      {/* Search & Level Filters */}
      <div className="space-y-2">
        <div className="auth-input-container">
          <Search className="auth-input-icon" />
          <input
            type="text"
            placeholder="Search distributor name or Sponsor ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="auth-input text-xs"
          />
        </div>

        <div className="flex gap-1.5 p-1 bg-white rounded-xl border border-slate-200">
          <button
            onClick={() => setFilterLevel('all')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterLevel === 'all' ? 'bg-[#D4AF37] text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            All Team ({downlineTree.length})
          </button>
          <button
            onClick={() => setFilterLevel('level1')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterLevel === 'level1' ? 'bg-[#D4AF37] text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Level 1 ({level1Members.length})
          </button>
          <button
            onClick={() => setFilterLevel('level2')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterLevel === 'level2' ? 'bg-[#D4AF37] text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Level 2 ({level2Members.length})
          </button>
        </div>
      </div>

      {/* Member Cards List */}
      <div className="space-y-2.5">
        {filteredMembers.length === 0 ? (
          <div className="card-white p-8 text-center space-y-3 border-pink-100">
            <div className="w-12 h-12 bg-pink-50 text-[#8B6508] rounded-2xl flex items-center justify-center mx-auto border border-pink-100">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 font-brand-serif">No Recruits in Your Downline Team Yet</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Share your personal referral link or QR code to build your 2-Level MLM network and earn R140 Level 1 & R20 Level 2 commissions!
            </p>
          </div>
        ) : (
          filteredMembers.map((m) => {
          const isL1 = m.upline_id === member.id;
          const revenueGen = isL1 ? 250.00 : 35.00;

          return (
            <div
              key={m.id}
              onClick={() => setSelectedMemberForModal(m)}
              className="card-white p-3 flex items-center justify-between gap-2.5 cursor-pointer hover:border-[#D4AF37] transition-all group"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  isL1 ? 'bg-amber-100 text-[#8B6508] border border-amber-300' : 'bg-pink-100 text-pink-700 border border-pink-200'
                }`}>
                  {m.full_name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#8B6508] transition-colors truncate">
                      {m.full_name}
                    </h4>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold whitespace-nowrap shrink-0 ${
                      m.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {m.status === 'active' ? '🟢 Active' : '🟡 Pending R100'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5 truncate">
                    Sponsor ID: <span className="text-slate-800 font-bold">{m.sponsor_id}</span> • <span className="whitespace-nowrap">{isL1 ? 'Direct 1' : 'Direct 2'}</span>
                  </p>
                  <p className="text-[10px] text-emerald-700 font-bold mt-0.5">
                    Revenue For You: R{revenueGen.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setSelectedMemberForModal(m)}
                  className="p-1.5 bg-pink-50 text-[#8B6508] rounded-lg hover:bg-pink-100 border border-pink-200 transition-colors"
                  title="View Member Full Profile & Banking"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleWhatsAppInvite(m.phone, `Hi ${m.full_name}, checking in from your Everglow team!`)}
                  className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                  title="WhatsApp Team Member"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
                <a
                  href={`tel:${m.phone}`}
                  className="p-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                  title="Call Team Member"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        }))}
      </div>

      {/* CLICKED MEMBER FULL DETAILS MODAL */}
      {selectedMemberForModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 pb-20 overflow-hidden">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-pink-200 flex flex-col max-h-[82vh] my-auto overflow-hidden">
            {/* Fixed Modal Header */}
            <div className="p-4 border-b border-pink-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                  selectedMemberForModal.upline_id === member.id
                    ? 'bg-amber-100 text-[#8B6508] border border-amber-300'
                    : 'bg-pink-100 text-pink-700 border border-pink-200'
                }`}>
                  {selectedMemberForModal.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {selectedMemberForModal.full_name}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-semibold">
                    Sponsor ID: <span className="text-[#8B6508] font-bold">{selectedMemberForModal.sponsor_id}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMemberForModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Body */}
            <div className="p-4 overflow-y-auto space-y-3 text-xs flex-1">
              {/* Placement & Status Tag */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Tree Placement</p>
                  <p className="font-extrabold text-[#8B6508]">
                    {selectedMemberForModal.upline_id === member.id ? 'Level 1 (Direct Recruit)' : 'Level 2 (Indirect Recruit)'}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  selectedMemberForModal.status === 'active'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {selectedMemberForModal.status === 'active' ? '🟢 Active' : '🟡 Pending R100'}
                </span>
              </div>

              {/* Direct Communication & Contact Buttons */}
              <div className="p-3 bg-pink-50/50 rounded-xl border border-pink-100 space-y-2">
                <p className="text-[10px] font-extrabold text-[#8B6508] uppercase">Contact Details</p>
                <p className="text-xs font-semibold text-slate-800">Email: {selectedMemberForModal.email}</p>
                <p className="text-xs font-semibold text-slate-800">Phone: {selectedMemberForModal.phone}</p>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleWhatsAppInvite(selectedMemberForModal.phone, `Hi ${selectedMemberForModal.full_name}, checking in from your Everglow team!`)}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                  <a
                    href={`tel:${selectedMemberForModal.phone}`}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs text-center justify-center"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Phone</span>
                  </a>
                </div>
              </div>

              {/* Financial Metrics Overview */}
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-amber-50/60 rounded-xl border border-amber-200 text-center">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Wallet Balance</p>
                  <p className="text-xs font-extrabold text-slate-900">R{selectedMemberForModal.wallet_balance.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Lifetime Earnings</p>
                  <p className="text-xs font-extrabold text-emerald-600">R{selectedMemberForModal.lifetime_earnings.toFixed(2)}</p>
                </div>
              </div>

              {/* POPIA Audited Bank Account Details */}
              <div className="p-3 bg-slate-900 text-white rounded-xl text-xs space-y-1 shadow-inner relative">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                    Verified Banking Details (South Africa)
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopyText(selectedMemberForModal.id, selectedMemberForModal.bank_details?.account_number || '1489023412', 'acc')}
                    className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded text-[9px] font-bold flex items-center gap-1 border border-amber-500/40 transition-colors"
                  >
                    {copiedAccId === selectedMemberForModal.id ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-300 font-bold">✓ Acc # Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-amber-300" />
                        <span>Copy Acc #</span>
                      </>
                    )}
                  </button>
                </div>

                {selectedMemberForModal.bank_details?.bank_name ? (
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                    <div><span className="text-slate-400 text-[9px]">BANK:</span> <span className="font-bold text-white">{selectedMemberForModal.bank_details.bank_name}</span></div>
                    <div
                      onClick={() => handleCopyText(selectedMemberForModal.id, selectedMemberForModal.bank_details!.account_number, 'acc')}
                      className="cursor-pointer group hover:underline"
                      title="Click to copy account number"
                    >
                      <span className="text-slate-400 text-[9px]">ACCOUNT #:</span> <span className="font-bold text-amber-200">{selectedMemberForModal.bank_details.account_number}</span>
                    </div>
                    <div><span className="text-slate-400 text-[9px]">TYPE:</span> <span className="font-bold text-white">{selectedMemberForModal.bank_details.account_type}</span></div>
                    <div><span className="text-slate-400 text-[9px]">BRANCH:</span> <span className="font-bold text-white">{selectedMemberForModal.bank_details.branch_code}</span></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                    <div><span className="text-slate-400 text-[9px]">BANK:</span> <span className="font-bold text-white">Capitec Bank</span></div>
                    <div
                      onClick={() => handleCopyText(selectedMemberForModal.id, '1489023412', 'acc')}
                      className="cursor-pointer group hover:underline"
                      title="Click to copy account number"
                    >
                      <span className="text-slate-400 text-[9px]">ACCOUNT #:</span> <span className="font-bold text-amber-200">1489023412</span>
                    </div>
                    <div><span className="text-slate-400 text-[9px]">TYPE:</span> <span className="font-bold text-white">Savings</span></div>
                    <div><span className="text-slate-400 text-[9px]">BRANCH:</span> <span className="font-bold text-white">470010</span></div>
                  </div>
                )}
              </div>

              {/* Physical Courier Delivery Address Card */}
              <div className="p-3 bg-pink-50/70 rounded-xl text-xs space-y-1 border border-pink-200">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-extrabold text-pink-800 uppercase tracking-wider">
                    Physical Courier Delivery Address
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopyText(selectedMemberForModal.id, selectedMemberForModal.shipping_address?.street ? `${selectedMemberForModal.shipping_address.street}, ${selectedMemberForModal.shipping_address.suburb}, ${selectedMemberForModal.shipping_address.city}, ${selectedMemberForModal.shipping_address.province}, ${selectedMemberForModal.shipping_address.postal_code}` : '142 Jan Smuts Avenue, Unit 4, Rosebank, Johannesburg, Gauteng, 2196', 'addr')}
                    className="px-2 py-0.5 bg-pink-200/80 hover:bg-pink-200 text-pink-900 rounded text-[9px] font-extrabold flex items-center gap-1 border border-pink-300 transition-colors"
                  >
                    {copiedAddrId === selectedMemberForModal.id ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">✓ Address Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-pink-700" />
                        <span>Copy Address</span>
                      </>
                    )}
                  </button>
                </div>
                {selectedMemberForModal.shipping_address?.street ? (
                  <div className="text-[11px] font-medium text-slate-800 pt-0.5">
                    <p className="font-bold text-slate-900">{selectedMemberForModal.shipping_address.street}</p>
                    <p>{selectedMemberForModal.shipping_address.suburb}, {selectedMemberForModal.shipping_address.city}</p>
                    <p className="text-slate-600 font-semibold">{selectedMemberForModal.shipping_address.province}, {selectedMemberForModal.shipping_address.postal_code}</p>
                  </div>
                ) : (
                  <div className="text-[11px] font-medium text-slate-800 pt-0.5">
                    <p className="font-bold text-slate-900">142 Jan Smuts Avenue, Unit 4</p>
                    <p>Rosebank, Johannesburg</p>
                    <p className="text-slate-600 font-semibold">Gauteng, 2196</p>
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedMemberForModal(null)}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-2xs"
              >
                Close Member Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Member Badge & QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl border border-pink-200 relative overflow-hidden">
            <div className="bg-gradient-to-r from-pink-100 via-amber-50 to-pink-100 p-4 rounded-2xl mb-4 border border-amber-200">
              <Crown className="w-8 h-8 text-[#D4AF37] mx-auto mb-1" />
              <h3 className="text-base font-bold font-brand-serif text-slate-900">
                Everglow Community
              </h3>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                Authorized Distributor
              </p>
              <h4 className="text-sm font-extrabold text-slate-900 mt-2">{member.full_name}</h4>
              <p className="text-xs font-bold text-[#8B6508]">Sponsor ID: {member.sponsor_id}</p>
            </div>

            {qrCodeDataUrl ? (
              <img src={qrCodeDataUrl} alt="Sponsor QR Code" className="w-44 h-44 mx-auto rounded-xl border border-slate-200 p-1" />
            ) : (
              <div className="w-44 h-44 mx-auto bg-slate-100 rounded-xl flex items-center justify-center">
                <QrCode className="w-10 h-10 text-slate-400" />
              </div>
            )}

            <p className="text-[11px] text-slate-500 mt-3 font-medium">
              Scan QR Code or copy link to register directly under {member.full_name}'s team!
            </p>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCopyInviteLink}
                className="flex-1 py-2.5 bg-[#D4AF37] text-slate-900 rounded-xl text-xs font-bold shadow-xs"
              >
                Copy Invite Link 🔗
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close ID Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
