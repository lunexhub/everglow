import React, { useState } from 'react';
import { Wallet, TrendingUp, Users, Lock, Unlock, Download, Building2, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Profile, Transaction, Withdrawal } from '../types';
import { generateEarningsStatementPDF } from '../lib/pdfGenerator';

interface WalletViewProps {
  member: Profile;
  transactions?: Transaction[];
  withdrawals?: Withdrawal[];
  onRequestWithdrawal: (amount: number, bankDetails: any) => void;
}

export const WalletView: React.FC<WalletViewProps> = ({
  member,
  transactions = [],
  withdrawals = [],
  onRequestWithdrawal
}) => {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [cashoutAmount, setCashoutAmount] = useState<number>(Math.max(500, member.wallet_balance || 0));
  const [bankName, setBankName] = useState(member.bank_details?.bank_name || '');
  const [accountNumber, setAccountNumber] = useState(member.bank_details?.account_number || '');
  const [accountType, setAccountType] = useState(member.bank_details?.account_type || 'Savings');
  const [branchCode, setBranchCode] = useState(member.bank_details?.branch_code || '');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const minThreshold = 500.00;
  const isUnlocked = member.wallet_balance >= minThreshold;
  const neededToUnlock = Math.max(0, minThreshold - member.wallet_balance);
  const progressPercent = Math.min(100, (member.wallet_balance / minThreshold) * 100);

  // 15-Recruit Milestone Tracker
  const milestoneTarget = 15;
  const recruitCount = member.direct_recruits_count || 0;
  const recruitProgress = Math.min(100, (recruitCount / milestoneTarget) * 100);

  // Determine next 15th or 30th payout date
  const getNextPayoutDate = (): string => {
    const today = new Date();
    const day = today.getDate();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    if (day < 15) {
      return `15th ${monthNames[today.getMonth()]}`;
    } else if (day < 30) {
      return `30th ${monthNames[today.getMonth()]}`;
    } else {
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 15);
      return `15th ${monthNames[nextMonth.getMonth()]}`;
    }
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cashoutAmount < 500) return;
    
    onRequestWithdrawal(cashoutAmount, {
      bank_name: bankName,
      account_number: accountNumber,
      account_type: accountType,
      branch_code: branchCode
    });

    setWithdrawSuccess(true);
    setTimeout(() => {
      setWithdrawSuccess(false);
      setShowWithdrawModal(false);
    }, 2000);
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Wallet Overview 3-Column Desktop Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* Wallet Balance Hero Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 text-white rounded-2xl p-5 shadow-xl border border-amber-500/20 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/20 text-[#D4AF37] rounded-xl">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-amber-200/70 uppercase">
                  Available Wallet Balance
                </p>
                <h2 className="text-3xl font-extrabold font-brand-serif text-white">
                  R{member.wallet_balance.toFixed(2)}
                </h2>
              </div>
            </div>

            <button
              onClick={() => generateEarningsStatementPDF(member, transactions)}
              className="p-2 bg-white/10 hover:bg-white/20 text-amber-200 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
              title="Download PDF Earnings Statement"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Statement</span>
            </button>
          </div>

          {/* Lifetime Earnings Metric */}
          <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Lifetime Earnings:</span>
            </div>
            <span className="font-bold text-amber-300">R{member.lifetime_earnings.toFixed(2)}</span>
          </div>
        </div>

        {/* R500 Minimum Cash-Out Threshold Enforcer */}
        <div className="card-white p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isUnlocked ? (
              <div className="p-1.5 bg-amber-100 text-[#8B6508] rounded-lg">
                <Unlock className="w-4 h-4" />
              </div>
            ) : (
              <div className="p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                <Lock className="w-4 h-4" />
              </div>
            )}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                R500 Minimum Cash-Out Rule
              </h3>
              <p className="text-[11px] text-slate-500">
                {isUnlocked
                  ? 'Threshold unlocked! Ready for bank transfer.'
                  : `Earn R${neededToUnlock.toFixed(2)} more to unlock bank cash-out.`}
              </p>
            </div>
          </div>

          <span className="text-xs font-extrabold text-[#8B6508] bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            R500.00 Threshold
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3">
          <div
            className="bg-gradient-to-r from-amber-400 to-[#D4AF37] h-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {/* Action Cashout Button */}
        <button
          disabled={!isUnlocked}
          onClick={() => setShowWithdrawModal(true)}
          className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            isUnlocked
              ? 'bg-[#D4AF37] text-slate-900 shadow-md hover:bg-[#C5A028] cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isUnlocked ? (
            <>
              <Building2 className="w-4 h-4" />
              <span>[ Request Bank Cash-Out ]</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Cash-Out Locked (Min R500.00)</span>
            </>
          )}
        </button>
      </div>

      {/* 15th & 30th Bi-Monthly Payout Schedule Banner */}
      <div className="p-3.5 bg-gradient-to-r from-amber-50 to-pink-50 border border-amber-200 rounded-xl flex items-start gap-3">
        <div className="p-2 bg-white rounded-lg border border-amber-200 text-[#8B6508] shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <span>Bi-Monthly Payout Schedule (15th & 30th)</span>
          </h4>
          <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
            Withdrawal requests are accepted anytime (&ge; R500) and are processed by Admin on the <strong>15th</strong> and <strong>30th</strong> of each month.
          </p>
          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-[#8B6508] bg-white px-2 py-0.5 rounded border border-amber-200 mt-1.5">
            <Clock className="w-3 h-3" />
            <span>Next Payout Cycle: {getNextPayoutDate()}</span>
          </div>
        </div>
      </div>

      {/* 15-Recruit Milestone Tracker Card */}
      <div className="card-white p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-pink-100 text-pink-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                15-Recruit Milestone Tracker
              </h3>
              <p className="text-[11px] text-slate-500">
                Recruit 15 direct members to unlock your <strong>R1,000 Bonus</strong>!
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-pink-700 bg-pink-50 px-2 py-1 rounded-lg">
            {recruitCount} / {milestoneTarget} Recruits
          </span>
        </div>

        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-pink-400 to-[#D4AF37] h-full transition-all duration-500"
            style={{ width: `${recruitProgress}%` }}
          ></div>
        </div>
      </div>
      </div>

      {/* Bank Audit Transaction Ledger */}
      <div className="card-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Bank Audit Ledger & Transactions
          </h3>
          <span className="text-[10px] font-semibold text-slate-500">POPIA Secured</span>
        </div>

        {transactions.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No wallet transactions recorded yet. Commissions and withdrawals will appear here in real-time.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-900">{tx.description || tx.type.replace('_', ' ')}</p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(tx.created_at).toLocaleDateString('en-ZA')}
                  </p>
                </div>
                <span className={`font-bold ${tx.type === 'withdrawal' ? 'text-red-600' : 'text-emerald-600'}`}>
                  {tx.type === 'withdrawal' ? '-' : '+'}R{tx.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cash-Out Request History */}
      <div className="card-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Cash-Out Requests History
          </h3>
          <span className="text-[10px] font-semibold text-slate-500">15th / 30th Cycles</span>
        </div>

        {withdrawals.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-500">
            No cash-out requests submitted yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {withdrawals.map((w) => (
              <div key={w.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900">R{w.amount.toFixed(2)}</p>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                      w.status === 'paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      w.status === 'rejected' ? 'bg-red-100 text-red-800 border border-red-300' :
                      'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {w.status === 'paid' ? '✓ PAID' : w.status === 'rejected' ? '✕ REJECTED' : '⏳ PENDING'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {w.bank_name} ({w.account_number}) • {new Date(w.created_at).toLocaleDateString('en-ZA')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EFT Cash-Out Request Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full max-h-[85vh] overflow-y-auto my-auto shadow-2xl border border-amber-200">
            <h3 className="text-base font-bold text-slate-900 font-brand-serif mb-1 sticky top-0 bg-white pt-1 pb-2 z-10 border-b border-pink-100">
              Bank Cash-Out Request
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Payouts are processed on the upcoming <strong>15th or 30th</strong> payout cycle.
            </p>

            {withdrawSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Request Submitted!</h4>
                <p className="text-xs text-slate-600">
                  Your R{cashoutAmount.toFixed(2)} cash-out request has been logged for Admin payout on {getNextPayoutDate()}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWithdrawSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Withdrawal Amount (ZAR) *
                  </label>
                  <input
                    type="number"
                    min="500"
                    max={member.wallet_balance}
                    required
                    value={cashoutAmount}
                    onChange={(e) => setCashoutAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:border-[#D4AF37]"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Available: R{member.wallet_balance.toFixed(2)} (Min R500.00)</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Select South African Bank *
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 bg-white"
                  >
                    <option value="Capitec Bank">Capitec Bank</option>
                    <option value="FNB (First National Bank)">FNB (First National Bank)</option>
                    <option value="Standard Bank">Standard Bank</option>
                    <option value="Absa Bank">Absa Bank</option>
                    <option value="Nedbank">Nedbank</option>
                    <option value="TymeBank">TymeBank</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Account Number</label>
                    <input
                      type="text"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="10-digit #"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Branch Code</label>
                    <input
                      type="text"
                      required
                      value={branchCode}
                      onChange={(e) => setBranchCode(e.target.value)}
                      placeholder="e.g. 470010"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#D4AF37] text-slate-900 rounded-lg text-xs font-bold shadow-md hover:bg-[#C5A028]"
                  >
                    Submit Cash-Out
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
