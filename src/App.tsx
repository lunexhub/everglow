import React, { useState, useEffect } from 'react';
import { ShoppingBag, Wallet, Network, Package, Crown, LogOut, RefreshCw, Bell, ShieldCheck, Settings } from 'lucide-react';
import { Profile, Product, OrderItem, Promotion, Order, OrderFulfillmentStatus, CommissionSettings, Withdrawal, Transaction } from './types';
import { isDemoModeActive, setDemoModeState } from './lib/supabase';
import { 
  fetchProductsFromSupabase, 
  fetchPromotionsFromSupabase, 
  fetchOrdersFromSupabase, 
  saveOrderToSupabase, 
  approveOrderInSupabase,
  updateOrderStatusInSupabase,
  saveProductToSupabase,
  savePromotionToSupabase,
  fetchMembersFromSupabase,
  fetchCommissionSettings,
  saveCommissionSettings,
  updateProfileInSupabase,
  saveWithdrawalToSupabase,
  fetchWithdrawalsFromSupabase,
  fetchTransactionsFromSupabase
} from './lib/supabaseService';

import { AuthModal } from './components/AuthModal';
import { StoreView } from './components/StoreView';
import { WalletView } from './components/WalletView';
import { GenealogyTreeView } from './components/GenealogyTreeView';
import { MyOrdersView } from './components/MyOrdersView';
import { AdminDashboard } from './components/AdminDashboard';
import { PendingApprovalView } from './components/PendingApprovalView';
import { EverglowLogo } from './components/EverglowLogo';
import { SettingsModal } from './components/SettingsModal';

export function App() {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [promotionsList, setPromotionsList] = useState<Promotion[]>([]);
  const [membersList, setMembersList] = useState<Profile[]>([]);
  const [withdrawalsList, setWithdrawalsList] = useState<Withdrawal[]>([]);
  const [transactionsList, setTransactionsList] = useState<Transaction[]>([]);
  const [commissionSettings, setCommissionSettings] = useState<CommissionSettings>({
    id: 'global',
    level1_bonus: 92,
    level2_bonus: 10,
    updated_at: new Date().toISOString()
  });

  const [ordersList, setOrdersListState] = useState<Order[]>(() => {
    const cached = localStorage.getItem('everglow_orders_cache');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [];
  });

  const setOrdersList = (action: Order[] | ((prev: Order[]) => Order[])) => {
    setOrdersListState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      try { localStorage.setItem('everglow_orders_cache', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  // Initial Load from Supabase Real Database
  useEffect(() => {
    const loadRealData = async () => {
      const liveProds = await fetchProductsFromSupabase();
      setProductsList(liveProds);

      const livePromos = await fetchPromotionsFromSupabase();
      setPromotionsList(livePromos);

      const liveOrders = await fetchOrdersFromSupabase();
      if (liveOrders && liveOrders.length > 0) {
        const cachedStr = localStorage.getItem('everglow_orders_cache');
        if (cachedStr) {
          try {
            const cachedOrders: Order[] = JSON.parse(cachedStr);
            const merged = liveOrders.map(lo => {
              const cachedMatch = cachedOrders.find(c => c.id === lo.id || c.order_number === lo.order_number);
              if (cachedMatch && cachedMatch.payment_status === 'approved' && lo.payment_status !== 'approved') {
                approveOrderInSupabase(lo.id, lo.order_number);
                return { ...lo, payment_status: 'approved' as const, fulfillment_status: (cachedMatch.fulfillment_status || 'packing') as OrderFulfillmentStatus };
              }
              if (cachedMatch) {
                return { ...lo, ...cachedMatch };
              }
              return lo;
            });
            const unsynced = cachedOrders.filter(co => !liveOrders.some(lo => lo.id === co.id || lo.order_number === co.order_number));
            setOrdersList([...unsynced, ...merged]);
          } catch (e) {
            setOrdersList(liveOrders);
          }
        } else {
          setOrdersList(liveOrders);
        }
      }

      const liveMembers = await fetchMembersFromSupabase();
      setMembersList(liveMembers);

      const liveCommission = await fetchCommissionSettings();
      setCommissionSettings(liveCommission);

      const liveWithdrawals = await fetchWithdrawalsFromSupabase();
      setWithdrawalsList(liveWithdrawals);

      const liveTxns = await fetchTransactionsFromSupabase();
      setTransactionsList(liveTxns);
    };

    loadRealData();
  }, []);

  const [currentUser, setCurrentUser] = useState<Profile | null>(() => {
    const saved = localStorage.getItem('everglow_active_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.is_demo || parsed.wallet_balance === 14500) {
          localStorage.removeItem('everglow_active_user');
          return null;
        }
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<'store' | 'wallet' | 'network' | 'orders' | 'admin'>(() => {
    const savedTab = localStorage.getItem('everglow_active_tab') as any;
    if (savedTab && ['store', 'wallet', 'network', 'orders', 'admin'].includes(savedTab)) {
      return savedTab;
    }
    const savedUser = localStorage.getItem('everglow_active_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.role === 'admin') return 'admin';
      } catch (e) {}
    }
    return 'store';
  });

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const changeTab = (tab: 'store' | 'wallet' | 'network' | 'orders' | 'admin') => {
    setActiveTab(tab);
    localStorage.setItem('everglow_active_tab', tab);
  };

  const [profileSaving, setProfileSaving] = useState(false);

  const handleUpdateProfile = async (updated: Profile) => {
    setProfileSaving(true);
    const success = await updateProfileInSupabase(updated);
    setProfileSaving(false);
    if (success) {
      setCurrentUser(updated);
      localStorage.setItem('everglow_active_user', JSON.stringify(updated));
      setIsSettingsOpen(false);
      showNotification('✅ Profile, bank details & address saved!');
    } else {
      showNotification('⚠️ Save failed — check your connection and try again.');
    }
  };

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const handleLoginSuccess = (user: Profile) => {
    setCurrentUser(user);
    localStorage.setItem('everglow_active_user', JSON.stringify(user));
    if (user.role === 'admin') {
      changeTab('admin');
    } else {
      changeTab('store');
    }
    showNotification(`Welcome back, ${user.full_name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('everglow_active_user');
    localStorage.removeItem('everglow_active_tab');
  };

  const handlePlaceOrder = async (items: OrderItem[], totalAmount: number, popUrl?: string) => {
    const newOrder: Order = {
      id: crypto.randomUUID(),
      order_number: `#EG-${Math.floor(1000 + Math.random() * 9000)}`,
      member_id: currentUser?.id || '00000000-0000-0000-0000-000000000002',
      items,
      total_amount: totalAmount,
      payment_status: 'pending',
      fulfillment_status: 'pending',
      pop_receipt_url: popUrl,
      created_at: new Date().toISOString()
    };

    setOrdersList(prev => [newOrder, ...prev]);
    await saveOrderToSupabase(newOrder);
    showNotification(`Order placed for R${totalAmount.toFixed(2)}! Submitted for Admin verification.`);
  };

  const handleRequestWithdrawal = async (amount: number, bankDetails: any) => {
    if (!currentUser) return;
    const newWithdrawal: Partial<Withdrawal> = {
      member_id: currentUser.id,
      amount,
      bank_name: bankDetails.bank_name || '',
      account_number: bankDetails.account_number || '',
      account_type: bankDetails.account_type || '',
      branch_code: bankDetails.branch_code || '',
      status: 'pending',
      target_payout_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    };
    await saveWithdrawalToSupabase(newWithdrawal);
    const updatedWithdrawals = await fetchWithdrawalsFromSupabase();
    setWithdrawalsList(updatedWithdrawals);
    showNotification(`Cash-out request of R${amount.toFixed(2)} logged & saved for 15th/30th payout cycle!`);
  };

  const handleUpdateOrderStage = async (orderId: string, stage: OrderFulfillmentStatus) => {
    const isApprovedStage = stage === 'packing' || stage === 'in_transit' || stage === 'delivered';
    
    setOrdersList(prev => prev.map(o => o.id === orderId ? { 
      ...o, 
      fulfillment_status: stage,
      payment_status: isApprovedStage ? 'approved' : o.payment_status
    } : o));

    if (isApprovedStage) {
      await approveOrderInSupabase(orderId);
    } else {
      await updateOrderStatusInSupabase(orderId, { fulfillment_status: stage });
    }

    showNotification(`Order ${stage.toUpperCase()}! ${isApprovedStage ? 'Payment Approved & Commissions Credited.' : ''}`);
  };

  const handleUpdateWaybillUrl = async (orderId: string, url: string) => {
    setOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, waybill_url: url } : o));
    await updateOrderStatusInSupabase(orderId, { waybill_url: url });
    showNotification(`Waybill tracking link updated!`);
  };

  // If not logged in, show Auth Screen
  if (!currentUser) {
    return <AuthModal onLoginSuccess={handleLoginSuccess} isDemoMode={false} />;
  }

  // If new member is pending R100 POP approval
  if (currentUser.role === 'member' && currentUser.status === 'pending_r100') {
    return <PendingApprovalView member={currentUser} onLogout={handleLogout} />;
  }

  const effectiveMemberProfile = currentUser;

  return (
    <div className="min-h-screen bg-[#FFF1F5] text-slate-900 flex flex-col">
      {/* Top Mobile Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-pink-100 px-4 py-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          <EverglowLogo size="sm" showSubtext={false} />
          <div>
            <h1 className="text-sm font-bold font-brand-serif text-slate-900 tracking-tight leading-none">
              Everglow <span className="text-[#8B6508]">Community</span>
            </h1>
            <p className="text-[8px] font-semibold text-slate-500 italic mt-0.5">
              "Beauty in Every Glow, Clean in Every Home."
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Member & Admin Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 bg-[#FFF1F5] hover:bg-pink-100 text-[#8B6508] border border-pink-200 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold shadow-2xs"
            title="Account, Bank & Courier Settings"
          >
            <Settings className="w-4 h-4 text-[#8B6508]" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          {currentUser.role === 'admin' && (
            <span className="text-[10px] font-extrabold text-[#8B6508] bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
              ADMIN
            </span>
          )}

          {/* User Sign Out */}
          <button
            onClick={handleLogout}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Toast Notification Banner */}
      {notificationMsg && (
        <div className="fixed top-14 left-4 right-4 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl border border-amber-400 flex items-center gap-2 animate-bounce">
          <Bell className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        {activeTab === 'store' && (
          <StoreView
            products={productsList}
            promotions={promotionsList}
            member={effectiveMemberProfile}
            commissionSettings={commissionSettings}
            onPlaceOrder={handlePlaceOrder}
          />
        )}
        {activeTab === 'wallet' && (
          <WalletView
            member={effectiveMemberProfile}
            transactions={transactionsList.filter(t => t.member_id === effectiveMemberProfile.id)}
            withdrawals={withdrawalsList.filter(w => w.member_id === effectiveMemberProfile.id)}
            onRequestWithdrawal={handleRequestWithdrawal}
          />
        )}
        {activeTab === 'network' && (
          <GenealogyTreeView
            member={effectiveMemberProfile}
            downlineTree={membersList}
          />
        )}
        {activeTab === 'orders' && (
          <MyOrdersView
            member={effectiveMemberProfile}
            orders={ordersList}
            onUpdateOrderStage={handleUpdateOrderStage}
            onUpdateWaybillUrl={handleUpdateWaybillUrl}
          />
        )}
        {activeTab === 'admin' && currentUser.role === 'admin' && (
          <AdminDashboard
            admin={currentUser}
            productsList={productsList}
            onUpdateProducts={setProductsList}
            promotionsList={promotionsList}
            onUpdatePromotions={setPromotionsList}
            ordersList={ordersList}
            onUpdateOrders={setOrdersList}
            membersList={membersList}
            commissionSettings={commissionSettings}
            onUpdateCommissionSettings={async (updated) => {
              setCommissionSettings(updated);
              await saveCommissionSettings(updated);
            }}
            showNotification={showNotification}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="bottom-nav flex items-center justify-around">
        <button
          onClick={() => changeTab('store')}
          className={activeTab === 'store' ? 'nav-pill-active' : 'nav-pill-inactive'}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Store</span>
        </button>

        <button
          onClick={() => changeTab('wallet')}
          className={activeTab === 'wallet' ? 'nav-pill-active' : 'nav-pill-inactive'}
        >
          <Wallet className="w-4 h-4" />
          <span>Wallet</span>
        </button>

        <button
          onClick={() => changeTab('network')}
          className={activeTab === 'network' ? 'nav-pill-active' : 'nav-pill-inactive'}
        >
          <Network className="w-4 h-4" />
          <span>Tree</span>
        </button>

        <button
          onClick={() => changeTab('orders')}
          className={activeTab === 'orders' ? 'nav-pill-active' : 'nav-pill-inactive'}
        >
          <Package className="w-4 h-4" />
          <span>Orders</span>
        </button>

        {currentUser.role === 'admin' && (
          <button
            onClick={() => changeTab('admin')}
            className={activeTab === 'admin' ? 'nav-pill-active' : 'nav-pill-inactive'}
          >
            <Crown className="w-4 h-4 text-[#8B6508]" />
            <span>Admin</span>
          </button>
        )}
      </nav>

      {/* Account, Banking & Courier Address Settings Modal */}
      <SettingsModal
        member={effectiveMemberProfile}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateProfile={handleUpdateProfile}
        isSaving={profileSaving}
      />
    </div>
  );
}

export default App;
