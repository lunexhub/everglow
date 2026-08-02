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
  fetchTransactionsFromSupabase,
  deleteOrderFromSupabase
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
import { GlobalConfirmationModal, ToastContainer, ConfirmationModalState, ConfirmationVariant, ToastItem } from './components/ModernModalAndToast';

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

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [globalModal, setGlobalModal] = useState<ConfirmationModalState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    variant: 'info',
    onConfirm: () => {}
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const changeTab = (tab: 'store' | 'wallet' | 'network' | 'orders' | 'admin') => {
    setActiveTab(tab);
    localStorage.setItem('everglow_active_tab', tab);
  };

  const showNotification = (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'success', title?: string) => {
    const id = crypto.randomUUID();
    const newToast: ToastItem = { id, message: msg, type, title };
    setToasts(prev => [newToast, ...prev].slice(0, 4));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const requestConfirmation = (
    title: string,
    message: string,
    confirmText: string,
    variant: ConfirmationVariant = 'warning',
    onConfirm: () => void
  ) => {
    setGlobalModal({
      isOpen: true,
      title,
      message,
      confirmText,
      variant,
      onConfirm
    });
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

  const handleDeleteOrder = async (orderId: string) => {
    const orderToDelete = ordersList.find(o => o.id === orderId);
    setOrdersList(prev => prev.filter(o => o.id !== orderId));
    await deleteOrderFromSupabase(orderId, orderToDelete?.order_number);
    showNotification(`Order ${orderToDelete?.order_number || ''} deleted permanently!`);
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
      {/* Desktop Sticky Left Sidebar (≥ 1024px) */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-white border-r border-pink-100/90 flex-col z-30 shadow-xs justify-between p-5">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-pink-100">
            <EverglowLogo size="md" showSubtext={false} />
            <div>
              <h1 className="text-base font-extrabold font-brand-serif text-slate-900 tracking-tight leading-none">
                Everglow <span className="text-[#8B6508]">Community</span>
              </h1>
              <p className="text-[9px] font-semibold text-slate-500 italic mt-1">
                "Beauty in Every Glow"
              </p>
            </div>
          </div>

          {/* User Profile Badge Card */}
          <div className="p-3 bg-gradient-to-r from-amber-50 to-pink-50/60 rounded-xl border border-amber-200/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                {currentUser.full_name || currentUser.email.split('@')[0]}
              </span>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${currentUser.role === 'admin' ? 'bg-amber-200 text-amber-900 border border-amber-300' : 'bg-pink-100 text-pink-800'}`}>
                {currentUser.role}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              Code: <strong className="text-[#8B6508]">{currentUser.sponsor_id}</strong>
            </p>
          </div>

          {/* Sidebar Navigation Items */}
          <nav className="space-y-1.5">
            <button
              onClick={() => changeTab('store')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'store' ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-slate-900 shadow-xs' : 'text-slate-600 hover:bg-pink-50 hover:text-slate-900'}`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Product Store</span>
            </button>

            <button
              onClick={() => changeTab('wallet')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'wallet' ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-slate-900 shadow-xs' : 'text-slate-600 hover:bg-pink-50 hover:text-slate-900'}`}
            >
              <Wallet className="w-4 h-4" />
              <span>Earnings & Wallet</span>
            </button>

            <button
              onClick={() => changeTab('network')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'network' ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-slate-900 shadow-xs' : 'text-slate-600 hover:bg-pink-50 hover:text-slate-900'}`}
            >
              <Network className="w-4 h-4" />
              <span>Genealogy Tree</span>
            </button>

            <button
              onClick={() => changeTab('orders')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'orders' ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-slate-900 shadow-xs' : 'text-slate-600 hover:bg-pink-50 hover:text-slate-900'}`}
            >
              <Package className="w-4 h-4" />
              <span>My Orders</span>
            </button>

            {currentUser.role === 'admin' && (
              <button
                onClick={() => changeTab('admin')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'admin' ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-slate-900 shadow-xs' : 'text-slate-600 hover:bg-pink-50 hover:text-slate-900'}`}
              >
                <Crown className="w-4 h-4 text-[#8B6508]" />
                <span>Admin Dashboard</span>
              </button>
            )}
          </nav>
        </div>

        {/* Sidebar Bottom Widgets & Logout */}
        <div className="space-y-3 pt-4 border-t border-pink-100">
          {/* Quick Wallet Widget */}
          <div className="p-3 bg-slate-900 text-white rounded-xl space-y-1 shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Available Wallet</span>
            <div className="text-base font-extrabold text-[#D4AF37]">
              R{(currentUser.wallet_balance || 0).toFixed(2)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex-1 py-2 px-3 bg-pink-50 hover:bg-pink-100 text-[#8B6508] border border-pink-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Top Mobile Header (< 1024px) */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-pink-100 px-4 py-2.5 flex items-center justify-between shadow-2xs">
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

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Global Modern Confirmation Modal */}
      <GlobalConfirmationModal modal={globalModal} onClose={() => setGlobalModal(prev => ({ ...prev, isOpen: false }))} />

      {/* Main Content Area (Responsive Desktop Grid Container) */}
      <main className="flex-1 p-4 max-w-lg mx-auto w-full lg:ml-64 lg:mx-0 lg:max-w-none lg:w-[calc(100vw-16rem)] lg:p-8 min-w-0">
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
            onDeleteOrder={handleDeleteOrder}
            onRequestConfirmation={requestConfirmation}
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

      {/* Mobile Bottom Navigation Bar (< 1024px) */}
      <nav className="bottom-nav lg:hidden flex items-center justify-around">
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
