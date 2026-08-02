import React, { useState, useEffect } from 'react';
import { Crown, Package, Users, DollarSign, Truck, CheckCircle2, XCircle, Plus, Eye, RefreshCw, Sparkles, AlertTriangle, Calendar, Layers, Trash2, Upload, Image as ImageIcon, X, Copy, Search, Gift, Settings2, Edit3 } from 'lucide-react';
import { Profile, Product, Order, Withdrawal, Transaction, Promotion, OrderFulfillmentStatus, CommissionSettings } from '../types';
import { 
  saveProductToSupabase, 
  deleteProductFromSupabase, 
  savePromotionToSupabase, 
  saveOrderToSupabase, 
  updateOrderStatusInSupabase, 
  fetchWithdrawalsFromSupabase, 
  updateWithdrawalStatusInSupabase, 
  fetchTransactionsFromSupabase,
  updateMemberStatusInSupabase,
  togglePromotionInSupabase,
  updateProductStockInSupabase,
  deletePromotionFromSupabase,
  approveOrderInSupabase,
  deleteOrderFromSupabase
} from '../lib/supabaseService';

interface AdminDashboardProps {
  admin: Profile;
  productsList?: Product[];
  onUpdateProducts?: (products: Product[]) => void;
  promotionsList?: Promotion[];
  onUpdatePromotions?: (promotions: Promotion[]) => void;
  ordersList?: Order[];
  onUpdateOrders?: (orders: Order[]) => void;
  membersList?: Profile[];
  commissionSettings?: CommissionSettings;
  onUpdateCommissionSettings?: (settings: CommissionSettings) => void;
  showNotification?: (message: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  admin,
  productsList: externalProductsList,
  onUpdateProducts,
  promotionsList: externalPromotionsList,
  onUpdatePromotions,
  ordersList: externalOrdersList,
  onUpdateOrders,
  membersList = [],
  commissionSettings: externalCommissionSettings,
  onUpdateCommissionSettings,
  showNotification
}) => {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'combos' | 'registrations' | 'orders' | 'payouts' | 'members' | 'ledger' | 'promos' | 'settings'>('orders');
  const [orderPipelineFilter, setOrderPipelineFilter] = useState<'all' | 'pending' | 'approved' | 'in_transit' | 'delivered'>('all');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [copiedAccId, setCopiedAccId] = useState<string | null>(null);
  const [copiedAddrId, setCopiedAddrId] = useState<string | null>(null);
  const [waybillInputs, setWaybillInputs] = useState<{ [orderId: string]: string }>({});
  const [waybillUrlInputs, setWaybillUrlInputs] = useState<{ [orderId: string]: string }>({});
  const [courierInputs, setCourierInputs] = useState<{ [orderId: string]: string }>({});

  // Orders Management State Sync
  const [internalOrdersList, setInternalOrdersList] = useState<Order[]>([]);
  const ordersList = externalOrdersList || internalOrdersList;

  const setOrdersList = (action: Order[] | ((prev: Order[]) => Order[])) => {
    const next = typeof action === 'function' ? action(ordersList) : action;
    if (onUpdateOrders) {
      onUpdateOrders(next);
    }
    setInternalOrdersList(next);
  };

  const handleUpdateOrderStage = (orderId: string, stage: OrderFulfillmentStatus) => {
    const order = ordersList.find(o => o.id === orderId);
    const waybill = waybillInputs[orderId] || order?.waybill_number || `TCG-${Math.floor(100000 + Math.random() * 900000)}`;
    const courier = courierInputs[orderId] || order?.courier_name || 'The Courier Guy';
    const waybillUrl = waybillUrlInputs[orderId] || order?.waybill_url || `https://portal.thecourierguy.co.za/track?tracking_number=${waybill}`;

    const updatedOrders = ordersList.map(o => o.id === orderId ? {
      ...o,
      fulfillment_status: stage,
      waybill_number: waybill,
      courier_name: courier,
      waybill_url: waybillUrl
    } : o);

    setOrdersList(updatedOrders);
    notify(`Order ${order?.order_number || ''} updated to ${stage.toUpperCase()}! Synced to customer in real-time.`);
  };

  const handleWaybillUrlChange = (orderId: string, url: string) => {
    setWaybillUrlInputs(prev => ({ ...prev, [orderId]: url }));
    setOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, waybill_url: url } : o));
  };

  const handleWaybillNumberChange = (orderId: string, waybillNum: string) => {
    setWaybillInputs(prev => ({ ...prev, [orderId]: waybillNum }));
    setOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, waybill_number: waybillNum } : o));
  };

  const handleCourierChange = (orderId: string, courierName: string) => {
    setCourierInputs(prev => ({ ...prev, [orderId]: courierName }));
    setOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, courier_name: courierName } : o));
  };

  // Master Action Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    variant: 'danger' | 'success' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    variant: 'info',
    onConfirm: () => {}
  });

  const notify = (msg: string) => {
    if (showNotification) {
      showNotification(msg);
    } else {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(null), 3500);
    }
  };

  const requestConfirmation = (
    title: string,
    message: string,
    confirmText: string,
    variant: 'danger' | 'success' | 'warning' | 'info',
    onConfirm: () => void
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      variant,
      onConfirm
    });
  };

  // Promotions Management State & Handlers
  const [internalPromotions, setInternalPromotions] = useState<Promotion[]>([]);
  const promotionsList = externalPromotionsList || internalPromotions;

  const setPromotionsList = (action: Promotion[] | ((prev: Promotion[]) => Promotion[])) => {
    const next = typeof action === 'function' ? action(promotionsList) : action;
    if (onUpdatePromotions) {
      onUpdatePromotions(next);
    }
    setInternalPromotions(next);
  };

  const handleTogglePromotion = (promoId: string) => {
    const target = promotionsList.find(p => p.id === promoId);
    const action = target?.is_active ? 'disable' : 'enable';

    requestConfirmation(
      `${action === 'enable' ? 'Enable' : 'Disable'} Promotion Campaign`,
      `Are you sure you want to ${action} the campaign "${target?.title}"?`,
      `${action === 'enable' ? 'Enable Promo' : 'Disable Promo'}`,
      action === 'enable' ? 'success' : 'warning',
      () => {
        const nextState = !target?.is_active;
        setPromotionsList(prev => prev.map(p => p.id === promoId ? { ...p, is_active: nextState } : p));
        togglePromotionInSupabase(promoId, nextState);
        notify(`Promotion campaign ${action}d successfully!`);
      }
    );
  };

  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [promoTitle, setPromoTitle] = useState('');
  const [promoBanner, setPromoBanner] = useState('');
  const [promoMinSpend, setPromoMinSpend] = useState('1000');
  const [promoGiftName, setPromoGiftName] = useState('1x Everglow Branded T-Shirt');
  const [promoImageUrl, setPromoImageUrl] = useState<string>('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80');

  const handleOpenNewPromoModal = () => {
    setEditingPromo(null);
    setPromoTitle('');
    setPromoBanner('');
    setPromoMinSpend('');
    setPromoGiftName('');
    setPromoImageUrl('');
    setShowPromoModal(true);
  };

  const handleEditPromotion = (promo: Promotion) => {
    setEditingPromo(promo);
    setPromoTitle(promo.title);
    setPromoBanner(promo.banner_text || promo.title);
    setPromoMinSpend(String(promo.min_spend || 0));
    setPromoGiftName(promo.gift_item_name || '1x Free Gift');
    setPromoImageUrl(promo.image_url || '');
    setShowPromoModal(true);
  };

  const handleDeletePromotion = (promoId: string, promoTitleStr: string) => {
    requestConfirmation(
      "Delete Promotion Campaign",
      `Are you sure you want to delete "${promoTitleStr}"? This campaign will be permanently removed.`,
      "Delete Campaign",
      "danger",
      async () => {
        setPromotionsList(prev => prev.filter(p => p.id !== promoId));
        await deletePromotionFromSupabase(promoId);
        notify(`Promotion campaign "${promoTitleStr}" deleted.`);
      }
    );
  };

  const handlePromoImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setPromoImageUrl(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePromotionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPromo) {
      const updatedPromo: Promotion = {
        ...editingPromo,
        title: promoTitle,
        banner_text: promoBanner || promoTitle,
        min_spend: parseFloat(promoMinSpend) || 0,
        gift_item_name: promoGiftName || '1x Free Gift',
        image_url: promoImageUrl
      };
      setPromotionsList(prev => prev.map(p => p.id === editingPromo.id ? updatedPromo : p));
      await savePromotionToSupabase(updatedPromo);
      setShowPromoModal(false);
      setEditingPromo(null);
      notify(`Promotion "${promoTitle}" updated successfully!`);
    } else {
      const newPromo: Promotion = {
        id: crypto.randomUUID(),
        title: promoTitle,
        banner_text: promoBanner || promoTitle,
        rule_type: 'spend_threshold',
        min_spend: parseFloat(promoMinSpend) || 1000,
        gift_item_name: promoGiftName || '1x Free Gift',
        image_url: promoImageUrl,
        is_active: true,
        start_date: new Date().toISOString()
      };
      setPromotionsList(prev => [newPromo, ...prev.map(p => ({ ...p, is_active: false }))]);
      await savePromotionToSupabase(newPromo);
      setShowPromoModal(false);
      notify('New promotion created with gift image and activated in Store & Supabase!');
    }
  };

  const handleCopyText = (id: string, textToCopy: string, type: 'acc' | 'addr') => {
    navigator.clipboard.writeText(textToCopy);
    if (type === 'acc') {
      setCopiedAccId(id);
      setTimeout(() => setCopiedAccId(null), 2000);
    } else {
      setCopiedAddrId(id);
      setTimeout(() => setCopiedAddrId(null), 2000);
    }
    notify('Copied to clipboard!');
  };

  const handleDispatchOrder = (orderId: string) => {
    const waybill = waybillInputs[orderId] || `TCG-${Math.floor(100000 + Math.random() * 900000)}`;
    const courier = courierInputs[orderId] || 'The Courier Guy';
    const order = ordersList.find(o => o.id === orderId);

    requestConfirmation(
      "Dispatch Courier Order",
      `Are you sure you want to dispatch Order ${order?.order_number || orderId} via ${courier} with Waybill #: ${waybill}?`,
      "Dispatch Shipment",
      "info",
      () => {
        setOrdersList(prev => prev.map(o => o.id === orderId ? {
          ...o,
          fulfillment_status: 'in_transit',
          waybill_number: waybill,
          courier_name: courier
        } : o));
        updateOrderStatusInSupabase(orderId, {
          fulfillment_status: 'in_transit',
          waybill_number: waybill,
          courier_name: courier
        });
        notify(`Order ${order?.order_number || ''} dispatched via ${courier} (Waybill: ${waybill})!`);
      }
    );
  };

  const handleMarkDelivered = (orderId: string) => {
    const order = ordersList.find(o => o.id === orderId);
    requestConfirmation(
      "Mark Order as Delivered",
      `Are you sure you want to mark Order ${order?.order_number || orderId} as DELIVERED to customer?`,
      "Mark Delivered",
      "success",
      () => {
        setOrdersList(prev => prev.map(o => o.id === orderId ? {
          ...o,
          fulfillment_status: 'delivered'
        } : o));
        updateOrderStatusInSupabase(orderId, { fulfillment_status: 'delivered' });
        notify(`Order ${order?.order_number || ''} marked as DELIVERED!`);
      }
    );
  };

  const handleRejectOrder = (orderId: string) => {
    const order = ordersList.find(o => o.id === orderId);
    requestConfirmation(
      "Reject Order Payment",
      `Are you sure you want to reject payment for Order ${order?.order_number || orderId}?`,
      "Reject Payment",
      "danger",
      () => {
        setOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: 'rejected' } : o));
        updateOrderStatusInSupabase(orderId, { payment_status: 'rejected' });
        notify(`Order ${order?.order_number || ''} marked as payment REJECTED.`);
      }
    );
  };

  // Internal State Management (Fallback if external prop not provided)
  const [internalProductsList, setInternalProductsList] = useState<Product[]>([]);
  const productsList = externalProductsList || internalProductsList;

  const setProductsList = (action: Product[] | ((prev: Product[]) => Product[])) => {
    const nextProducts = typeof action === 'function' ? action(productsList) : action;
    if (onUpdateProducts) {
      onUpdateProducts(nextProducts);
    }
    setInternalProductsList(nextProducts);
  };

  const [pendingMembers, setPendingMembers] = useState<Profile[]>([]);
  const [withdrawalsList, setWithdrawalsList] = useState<Withdrawal[]>([]);
  const [transactionsList, setTransactionsList] = useState<Transaction[]>([]);

  // Derive pendingMembers from the real membersList prop
  useEffect(() => {
    setPendingMembers(membersList.filter(m => m.status === 'pending_r100'));
  }, [membersList]);

  // Fetch real withdrawals and transactions from Supabase on mount
  useEffect(() => {
    const loadAdminData = async () => {
      const [liveWithdrawals, liveTxns] = await Promise.all([
        fetchWithdrawalsFromSupabase(),
        fetchTransactionsFromSupabase()
      ]);
      setWithdrawalsList(liveWithdrawals);
      setTransactionsList(liveTxns);
    };
    loadAdminData();
  }, []);

  // Combo Builder Form State
  const [showComboModal, setShowComboModal] = useState(false);

  // New Combo Form State
  const [comboName, setComboName] = useState('');
  const [comboPackSize, setComboPackSize] = useState<5 | 10>(10);
  const [wholesalePrice, setWholesalePrice] = useState('900');
  const [retailUnit, setRetailUnit] = useState('180');
  const [level1Bonus, setLevel1Bonus] = useState('92');
  const [level2Bonus, setLevel2Bonus] = useState('10');
  const [comboCategory, setComboCategory] = useState<'beauty' | 'detergents' | 'essentials'>('beauty');

  // Global Commission Settings — local state ensures display updates instantly on Save
  const defaultCommission: CommissionSettings = { id: 'global', level1_bonus: 92, level2_bonus: 10, updated_at: new Date().toISOString() };
  const [localCommissionSettings, setLocalCommissionSettings] = useState<CommissionSettings>(
    externalCommissionSettings || defaultCommission
  );
  const commissionSettings = localCommissionSettings;

  const [editLevel1, setEditLevel1] = useState(String(localCommissionSettings.level1_bonus));
  const [editLevel2, setEditLevel2] = useState(String(localCommissionSettings.level2_bonus));
  const [commissionSaving, setCommissionSaving] = useState(false);

  // Sync from prop when Supabase data first arrives
  useEffect(() => {
    if (externalCommissionSettings) {
      setLocalCommissionSettings(externalCommissionSettings);
      setEditLevel1(String(externalCommissionSettings.level1_bonus));
      setEditLevel2(String(externalCommissionSettings.level2_bonus));
    }
  }, [externalCommissionSettings]);

  const handleSaveCommissionSettings = async () => {
    const l1 = parseFloat(editLevel1);
    const l2 = parseFloat(editLevel2);
    if (isNaN(l1) || isNaN(l2) || l1 < 0 || l2 < 0) {
      notify('Please enter valid positive bonus amounts.');
      return;
    }
    setCommissionSaving(true);
    const updated: CommissionSettings = { ...localCommissionSettings, level1_bonus: l1, level2_bonus: l2, updated_at: new Date().toISOString() };
    // Update local display immediately — no waiting for prop round-trip
    setLocalCommissionSettings(updated);
    if (onUpdateCommissionSettings) {
      await onUpdateCommissionSettings(updated);
    }
    setCommissionSaving(false);
    notify(`✅ Saved! L1: R${l1.toFixed(2)} | L2: R${l2.toFixed(2)} — Applied to all products.`);
  };
  const [comboDesc, setComboDesc] = useState('');
  const [comboStock, setComboStock] = useState('50');

  // Dynamic Combo Items Mix Builder State
  const [comboItems, setComboItems] = useState<{ name: string; quantity: number }[]>([
    { name: '', quantity: 1 }
  ]);

  const [comboPhotos, setComboPhotos] = useState<string[]>([]);

  const handleComboPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (evt.target?.result) {
            const dataUrl = evt.target.result as string;
            setComboPhotos(prev => [...prev, dataUrl].slice(0, 5));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveComboPhoto = (index: number) => {
    setComboPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddComboItem = () => {
    setComboItems(prev => [...prev, { name: '', quantity: 1 }]);
  };

  const handleUpdateComboItem = (index: number, field: 'name' | 'quantity', val: any) => {
    setComboItems(prev => {
      const next = [...prev];
      if (field === 'quantity') {
        next[index].quantity = Math.max(1, parseInt(val) || 1);
      } else {
        next[index].name = val;
      }
      return next;
    });
  };

  const handleRemoveComboItem = (index: number) => {
    setComboItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteProduct = (pId: string, pName: string) => {
    requestConfirmation(
      "Delete Product Combo",
      `Are you sure you want to remove "${pName}" from the wholesale catalog? Members will no longer be able to order this pack.`,
      "Delete Combo",
      "danger",
      async () => {
        setProductsList(prev => prev.filter(p => p.id !== pId));
        await deleteProductFromSupabase(pId);
        notify(`Product combo "${pName}" deleted from catalog.`);
      }
    );
  };

  const handleCreateComboSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comboName.trim()) return notify('Please enter a Combo Name.');
    
    const validItems = comboItems.filter(item => item.name.trim().length > 0);
    const calculatedPackSize = validItems.reduce((sum, item) => sum + item.quantity, 0) || comboPackSize;

    const newProd: Product = {
      id: crypto.randomUUID(),
      name: comboName,
      pack_size: calculatedPackSize as any,
      wholesale_price: parseFloat(wholesalePrice) || 900,
      retail_price_unit: parseFloat(retailUnit) || 180,
      stock_qty: parseInt(comboStock) || 50,
      category: comboCategory,
      description: comboDesc || `Wholesale Combo Pack containing ${calculatedPackSize} items.`,
      is_combo: true,
      combo_items: validItems.map(item => ({ product_id: crypto.randomUUID(), name: item.name, quantity: item.quantity })),
      image_url: comboPhotos[0] || undefined,
      images: comboPhotos.length > 0 ? comboPhotos : []
    };

    setProductsList(prev => [newProd, ...prev]);
    await saveProductToSupabase(newProd);
    setShowComboModal(false);
    notify('New Custom Combo created with dynamic component mix! Live in Member Store & Supabase.');
  };



  // 1. Approve R100 Registration
  const handleApproveRegistration = (memberId: string) => {
    const member = pendingMembers.find(m => m.id === memberId);
    requestConfirmation(
      "Approve R100 Member Registration",
      `Are you sure you want to approve R100 registration payment for ${member?.full_name || 'this member'}? Account will be activated & placed in sponsor level 1 tree.`,
      "Approve & Activate",
      "success",
      () => {
        setPendingMembers(prev => prev.filter(m => m.id !== memberId));
        updateMemberStatusInSupabase(memberId, 'active');
        notify(`Member ${member?.full_name || ''} approved & activated in tree!`);
      }
    );
  };

  // 2. Approve Stock Order & Fire Commissions
  const handleApproveOrder = (orderId: string) => {
    const order = ordersList.find(o => o.id === orderId);
    requestConfirmation(
      "Approve Order & Credit Commissions",
      `Are you sure you want to approve payment for Order ${order?.order_number || orderId}? Level 1 and 2 referral commissions will be credited immediately.`,
      "Approve Payment",
      "success",
      () => {
        setOrdersList(prev => prev.map(o => {
          if (o.id === orderId) {
            return { ...o, payment_status: 'approved', fulfillment_status: 'packing' };
          }
          return o;
        }));
        approveOrderInSupabase(orderId);
        notify(`Order ${order?.order_number || ''} approved! Commissions credited & saved in SQL.`);
      }
    );
  };

  const handleDeleteOrder = (orderId: string, orderNumber?: string) => {
    const order = ordersList.find(o => o.id === orderId);
    requestConfirmation(
      "Delete Order Record",
      `Are you sure you want to PERMANENTLY DELETE Order ${order?.order_number || orderNumber || orderId}? This record will be removed from local state & Supabase database.`,
      "Delete Order",
      "danger",
      async () => {
        setOrdersList(prev => prev.filter(o => o.id !== orderId));
        await deleteOrderFromSupabase(orderId, orderNumber);
        notify(`Order ${order?.order_number || ''} deleted permanently.`);
      }
    );
  };



  // 4. Approve Bank Payout (15th/30th Cycle)
  const handleApprovePayout = (wId: string) => {
    const w = withdrawalsList.find(item => item.id === wId);
    requestConfirmation(
      "Approve 15th/30th Bank Cash-Out",
      `Are you sure you want to approve payout of R${w?.amount.toFixed(2)} to ${w?.bank_name} Acc ${w?.account_number}?`,
      "Approve Payout",
      "success",
      () => {
        setWithdrawalsList(prev => prev.map(item => item.id === wId ? { ...item, status: 'paid' } : item));
        updateWithdrawalStatusInSupabase(wId, { status: 'paid' });
        notify(`Bank payout of R${w?.amount.toFixed(2)} approved and marked as paid!`);
      }
    );
  };

  // 5. Reject Bank Payout
  const handleRejectPayout = (wId: string) => {
    const w = withdrawalsList.find(item => item.id === wId);
    requestConfirmation(
      "Reject Cash-Out Request",
      `Are you sure you want to reject cash-out request of R${w?.amount.toFixed(2)}? Funds will be auto-refunded to member wallet.`,
      "Reject Payout",
      "danger",
      () => {
        setWithdrawalsList(prev => prev.map(item => item.id === wId ? { ...item, status: 'rejected' } : item));
        updateWithdrawalStatusInSupabase(wId, { status: 'rejected' });
        notify(`Payout rejected. R${w?.amount.toFixed(2)} auto-refunded to member wallet.`);
      }
    );
  };

  // Inventory Stock Quantity Toggle
  const handleUpdateStock = (pId: string, newQty: number) => {
    const qty = Math.max(0, newQty);
    setProductsList(prev => prev.map(p => p.id === pId ? { ...p, stock_qty: qty } : p));
    updateProductStockInSupabase(pId, qty);
  };

  // Financial Ledger Computations — all from real Supabase data
  const totalSalesRevenue = ordersList.reduce((sum, o) => sum + (o.payment_status === 'approved' ? o.total_amount : 0), 0);
  const totalCommissionsPaid = transactionsList
    .filter(t => t.status === 'credited' || t.status === 'withdrawn')
    .reduce((sum, t) => sum + t.amount, 0);
  const companyNetRetention = totalSalesRevenue - totalCommissionsPaid;
  const pendingLiabilities = withdrawalsList.filter(w => w.status === 'pending').reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="space-y-4 pb-20">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white p-4 rounded-2xl shadow-xl border border-amber-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 text-[#D4AF37] rounded-xl shrink-0">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold font-brand-serif text-white leading-tight">
              Single Admin Control Center
            </h2>
            <p className="text-xs text-amber-200/70 font-medium">
              Financial Governance & System Master Controls
            </p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold text-[#D4AF37] bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/40">
          ADMIN
        </span>
      </div>

      {/* Master Admin Sponsor Referral Link Card */}
      <div className="card-white p-4 space-y-3 border-l-4 border-l-[#D4AF37] bg-gradient-to-r from-amber-50/50 to-pink-50/30">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8B6508] bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
              Master Admin Sponsor ID: {admin.sponsor_id || 'EG-0001'}
            </span>
            <h3 className="text-xs font-bold text-slate-900 mt-1">
              Your Master Admin Referral Link
            </h3>
            <p className="text-[11px] text-slate-600">
              Share your link to recruit first-generation distributors. You earn <strong>R{commissionSettings.level1_bonus.toFixed(0)} Level 1 & R{commissionSettings.level2_bonus.toFixed(0)} Level 2 bonuses</strong> + house retention profits on wholesale sales!
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleCopyText('admin-ref', `https://everglowcommunity.co.za/?sponsor=${admin.sponsor_id || 'EG-0001'}`, 'acc')}
            className="px-3 py-2 bg-[#D4AF37] hover:bg-amber-500 text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Master Ref Link</span>
          </button>
        </div>
        <div className="p-2.5 bg-white/80 rounded-xl border border-pink-100 flex items-center justify-between text-xs font-mono text-slate-700">
          <span className="truncate">https://everglowcommunity.co.za/?sponsor={admin.sponsor_id || 'EG-0001'}</span>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Active Root Node
          </span>
        </div>
      </div>

      {/* Admin Quick Nav Bar (Sticky on Scroll) */}
      <div className="sticky top-11 lg:top-0 z-20 w-full py-2 bg-[#FFF1F5]/95 backdrop-blur-md transition-all">
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <button
          onClick={() => setActiveTab('combos')}
          className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'combos' ? 'bg-[#D4AF37] text-slate-900' : 'text-slate-600'
          }`}
        >
          Combos & Inventory
        </button>
        <button
          onClick={() => setActiveTab('registrations')}
          className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'registrations' ? 'bg-[#D4AF37] text-slate-900' : 'text-slate-600'
          }`}
        >
          R100 Reg Queue ({pendingMembers.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'orders' ? 'bg-[#D4AF37] text-slate-900' : 'text-slate-600'
          }`}
        >
          Orders Queue ({ordersList.filter(o => o.payment_status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('payouts')}
          className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'payouts' ? 'bg-[#D4AF37] text-slate-900' : 'text-slate-600'
          }`}
        >
          15th/30th Cash-Outs ({withdrawalsList.filter(w => w.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'members' ? 'bg-[#D4AF37] text-slate-900' : 'text-slate-600'
          }`}
        >
          Members & Banking Info
        </button>
        <button
          onClick={() => setActiveTab('promos')}
          className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'promos' ? 'bg-[#D4AF37] text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          🎁 Active Promotions
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'ledger' ? 'bg-[#D4AF37] text-slate-900' : 'text-slate-600'
          }`}
        >
          Master Ledger
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
            activeTab === 'settings' ? 'bg-[#D4AF37] text-slate-900' : 'text-slate-600'
          }`}
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Commission Settings</span>
        </button>
      </div>
    </div>

      {/* TAB 1: COMBOS & INVENTORY BUILDER */}
      {activeTab === 'combos' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase">Product & Custom Combo Engine</h3>
            <button
              onClick={() => setShowComboModal(true)}
              className="px-3 py-1.5 bg-[#D4AF37] text-slate-900 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product / Combo</span>
            </button>
          </div>

          <div className="space-y-3">
            {productsList.map((p) => (
              <div key={p.id} className="card-white p-4 space-y-3">
                {/* Row 1: Image, Title, Price info, and Delete button inside card top right */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {p.image_url && (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80';
                        }}
                        className="w-11 h-11 object-cover rounded-xl border border-pink-100 shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-bold text-slate-900 leading-tight break-words">{p.name}</h4>
                        {p.is_combo && (
                          <span className="bg-pink-100 text-pink-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border border-pink-200 shrink-0">
                            Combo
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                        Wholesale: R{p.wholesale_price.toFixed(2)} | L1: R{commissionSettings.level1_bonus.toFixed(2)} | L2: R{commissionSettings.level2_bonus.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Delete Trash Button inside Top Right of Card */}
                  <button
                    onClick={() => handleDeleteProduct(p.id, p.name)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors shrink-0 shadow-2xs"
                    title="Remove Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Dynamic Combo Component Mix Breakdown */}
                {p.combo_items && p.combo_items.length > 0 && (
                  <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/90 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-[#8B6508] uppercase tracking-wide">
                        📦 Included Combo Mix:
                      </span>
                      <span className="text-[10px] font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-amber-200 shadow-2xs">
                        Total: {p.combo_items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)} items
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-1 pt-0.5">
                      {p.combo_items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs bg-white px-2.5 py-1 rounded-lg border border-amber-100/80 gap-2 min-w-0">
                          <span className="font-semibold text-slate-800 break-all min-w-0 flex-1">
                            🧴 {item.name}
                          </span>
                          <span className="font-extrabold text-[#8B6508] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                            {item.quantity} units
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Row 2: Stock Controls along Card Bottom */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Stock Inventory: </span>
                    <span className={`text-xs font-extrabold ${p.stock_qty === 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {p.stock_qty === 0 ? 'Out of Stock (Hidden)' : `${p.stock_qty} in stock`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
                    <button
                      onClick={() => handleUpdateStock(p.id, p.stock_qty - 10)}
                      className="w-7 h-7 bg-white rounded-lg shadow-2xs text-slate-800 font-bold text-xs flex items-center justify-center hover:bg-slate-100"
                      title="Decrease Stock (-10)"
                    >
                      -
                    </button>
                    <span className="text-xs font-extrabold text-slate-900 px-1">
                      {p.stock_qty}
                    </span>
                    <button
                      onClick={() => handleUpdateStock(p.id, p.stock_qty + 10)}
                      className="w-7 h-7 bg-[#D4AF37] rounded-lg shadow-2xs text-slate-900 font-bold text-xs flex items-center justify-center hover:bg-[#C5A028]"
                      title="Increase Stock (+10)"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PENDING R100 REGISTRATIONS QUEUE */}
      {activeTab === 'registrations' && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase">Pending Member R100 Approvals</h3>
          {pendingMembers.length === 0 ? (
            <div className="card-white p-6 text-center text-xs text-slate-500">
              No pending registration payments in queue.
            </div>
          ) : (
            pendingMembers.map((m) => (
              <div key={m.id} className="card-white p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{m.full_name}</h4>
                    <p className="text-xs text-slate-500">{m.email} • {m.phone}</p>
                    <p className="text-xs font-bold text-[#8B6508] mt-0.5">Sponsor Code: {m.sponsor_id}</p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    R100 POP Attached
                  </span>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleApproveRegistration(m.id)}
                    className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Activate Member</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: ORDERS & SHIPPING FULFILLMENT QUEUE */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase">Wholesale Orders & EFT Payment Pipeline</h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Filter by payment verification stage and manage courier tracking</p>
          </div>

          {/* Pipeline Filter Bar */}
          <div className="flex gap-1.5 p-1 bg-white rounded-xl border border-slate-200 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setOrderPipelineFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all whitespace-nowrap ${
                orderPipelineFilter === 'all' ? 'bg-[#D4AF37] text-slate-950 shadow-xs' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>All Orders ({ordersList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setOrderPipelineFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all whitespace-nowrap flex items-center gap-1 ${
                orderPipelineFilter === 'pending' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>⏳ Pending POP ({ordersList.filter(o => o.payment_status === 'pending').length})</span>
            </button>
            <button
              type="button"
              onClick={() => setOrderPipelineFilter('approved')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all whitespace-nowrap flex items-center gap-1 ${
                orderPipelineFilter === 'approved' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>✅ Approved ({ordersList.filter(o => o.payment_status === 'approved').length})</span>
            </button>
            <button
              type="button"
              onClick={() => setOrderPipelineFilter('in_transit')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all whitespace-nowrap flex items-center gap-1 ${
                orderPipelineFilter === 'in_transit' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>🚚 In-Transit ({ordersList.filter(o => o.fulfillment_status === 'in_transit').length})</span>
            </button>
            <button
              type="button"
              onClick={() => setOrderPipelineFilter('delivered')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all whitespace-nowrap flex items-center gap-1 ${
                orderPipelineFilter === 'delivered' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>🏁 Delivered ({ordersList.filter(o => o.fulfillment_status === 'delivered').length})</span>
            </button>
          </div>

          {/* Orders List Filtered by Pipeline */}
          {ordersList.filter(order => {
            if (orderPipelineFilter === 'pending') return order.payment_status === 'pending';
            if (orderPipelineFilter === 'approved') return order.payment_status === 'approved';
            if (orderPipelineFilter === 'in_transit') return order.fulfillment_status === 'in_transit';
            if (orderPipelineFilter === 'delivered') return order.fulfillment_status === 'delivered';
            return true;
          }).length === 0 ? (
            <div className="card-white p-8 text-center text-xs text-slate-500 space-y-1">
              <p className="font-bold text-slate-700">No orders found in this pipeline filter.</p>
              <p className="text-[10px]">Switch filter tabs above to view orders in other fulfillment stages.</p>
            </div>
          ) : (
            ordersList
              .filter(order => {
                if (orderPipelineFilter === 'pending') return order.payment_status === 'pending';
                if (orderPipelineFilter === 'approved') return order.payment_status === 'approved';
                if (orderPipelineFilter === 'in_transit') return order.fulfillment_status === 'in_transit';
                if (orderPipelineFilter === 'delivered') return order.fulfillment_status === 'delivered';
                return true;
              })
              .map((order) => {
                const memberInfo = order.member || admin;

                return (
                  <div key={order.id} className="card-white p-4 space-y-3 border-l-4 border-l-amber-400">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8B6508] bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                          {order.order_number}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 mt-1">
                          Customer: {memberInfo.full_name} ({memberInfo.sponsor_id})
                        </h4>
                        <p className="text-[10px] text-slate-500">{memberInfo.email} • {memberInfo.phone}</p>
                        <p className="text-[10px] text-slate-400">{new Date(order.created_at).toLocaleDateString('en-ZA')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">R{order.total_amount.toFixed(2)}</p>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border inline-block mt-0.5 ${
                          order.payment_status === 'approved' 
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                            : order.payment_status === 'rejected'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                        }`}>
                          {order.payment_status === 'approved' 
                            ? '✅ PAYMENT APPROVED' 
                            : order.payment_status === 'rejected'
                            ? '❌ REJECTED'
                            : '⏳ PENDING POP VERIFICATION'}
                        </span>
                      </div>
                    </div>

                    {/* Attached EFT POP Receipt / PDF Button */}
                    {order.pop_receipt_url && (
                      <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="p-1 bg-white rounded border border-amber-300 text-xs font-bold">📄</span>
                          <div>
                            <p className="text-[10px] font-extrabold text-amber-900">Attached EFT Proof of Payment (POP PDF / Receipt)</p>
                            <p className="text-[9px] text-amber-700">Uploaded by member at checkout</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => window.open(order.pop_receipt_url, '_blank')}
                          className="px-2.5 py-1 bg-[#D4AF37] hover:bg-[#C5A028] text-slate-950 rounded-lg text-[10px] font-extrabold shadow-2xs transition-colors"
                        >
                          View EFT POP 👁️
                        </button>
                      </div>
                    )}

                    {/* Real-Time Interactive Courier Fulfillment Stage Controls */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-slate-700 uppercase flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-[#8B6508]" />
                          <span>Fulfillment Stage (Click to update member in real-time)</span>
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          order.fulfillment_status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                          order.fulfillment_status === 'in_transit' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.fulfillment_status.toUpperCase()}
                        </span>
                      </div>

                      {/* Stage Pills */}
                      <div className="grid grid-cols-4 gap-1.5 text-center pt-1">
                        <div
                          className={`py-2 px-1 rounded-xl text-[10px] font-extrabold transition-all border ${
                            order.payment_status === 'approved'
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                              : 'bg-amber-500 text-slate-950 border-amber-400 shadow-2xs animate-pulse'
                          }`}
                        >
                          {order.payment_status === 'approved' ? '1. Paid ✅' : '1. POP Pending ⏳'}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStage(order.id, 'packing')}
                          className={`py-2 px-1 rounded-xl text-[10px] font-extrabold transition-all border cursor-pointer active:scale-95 ${
                            order.fulfillment_status === 'packing'
                              ? 'bg-[#D4AF37] text-slate-950 border-amber-500 shadow-md ring-2 ring-amber-400 scale-102'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-50 hover:border-amber-300'
                          }`}
                        >
                          2. Packing
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStage(order.id, 'in_transit')}
                          className={`py-2 px-1 rounded-xl text-[10px] font-extrabold transition-all border cursor-pointer active:scale-95 ${
                            order.fulfillment_status === 'in_transit'
                              ? 'bg-[#D4AF37] text-slate-950 border-amber-500 shadow-md ring-2 ring-amber-400 scale-102'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-50 hover:border-amber-300'
                          }`}
                        >
                          3. In Transit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStage(order.id, 'delivered')}
                          className={`py-2 px-1 rounded-xl text-[10px] font-extrabold transition-all border cursor-pointer active:scale-95 ${
                            order.fulfillment_status === 'delivered'
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400 scale-102'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-emerald-50 hover:border-emerald-300'
                          }`}
                        >
                          4. Delivered
                        </button>
                      </div>

                      {/* Courier & Waybill Entry Inputs */}
                      <div className="grid grid-cols-2 gap-2 pt-1.5">
                        <div>
                          <label className="block text-[9px] font-extrabold text-slate-700 uppercase mb-0.5">Courier Provider</label>
                          <select
                            value={courierInputs[order.id] || order.courier_name || 'The Courier Guy'}
                            onChange={(e) => handleCourierChange(order.id, e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#D4AF37]"
                          >
                            <option value="The Courier Guy">The Courier Guy</option>
                            <option value="Aramex South Africa">Aramex SA</option>
                            <option value="RAM Hand-to-Hand Courier">RAM Courier</option>
                            <option value="Fastway Couriers">Fastway Couriers</option>
                            <option value="PostNet Courier">PostNet</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-extrabold text-slate-700 uppercase mb-0.5">Waybill Tracking #</label>
                          <input
                            type="text"
                            placeholder="e.g. TCG-94812"
                            value={waybillInputs[order.id] !== undefined ? waybillInputs[order.id] : (order.waybill_number || '')}
                            onChange={(e) => handleWaybillNumberChange(order.id, e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>
                      </div>

                      {/* Waybill Direct Tracking Link Input (URL) */}
                      <div className="pt-0.5">
                        <label className="block text-[9px] font-extrabold text-slate-700 uppercase mb-0.5 flex items-center justify-between">
                          <span>🔗 Paste Courier Waybill Link (URL)</span>
                          <span className="text-[8px] font-bold text-amber-700">Real-Time Sync</span>
                        </label>
                        <input
                          type="url"
                          placeholder="e.g. https://portal.thecourierguy.co.za/track?tracking_number=TCG-94812"
                          value={waybillUrlInputs[order.id] !== undefined ? waybillUrlInputs[order.id] : (order.waybill_url || '')}
                          onChange={(e) => handleWaybillUrlChange(order.id, e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border-2 border-amber-200 focus:border-amber-500 rounded-lg text-[11px] font-mono text-slate-900 font-bold focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Admin Fulfillment Action Buttons */}
                    <div className="flex gap-2">
                      {order.payment_status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveOrder(order.id)}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verify EFT & Approve Payment</span>
                          </button>
                          <button
                            onClick={() => handleRejectOrder(order.id)}
                            className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      {order.fulfillment_status !== 'delivered' && (
                        <button
                          onClick={() => handleDispatchOrder(order.id)}
                          className="flex-1 py-2 bg-[#D4AF37] hover:bg-[#C5A028] text-slate-950 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 shadow-xs"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>{order.fulfillment_status === 'in_transit' ? 'Update Waybill' : '🚚 Dispatch (In-Transit)'}</span>
                        </button>
                      )}

                      {order.fulfillment_status === 'in_transit' && (
                        <button
                          onClick={() => handleMarkDelivered(order.id)}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>🟢 Mark Delivered</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteOrder(order.id, order.order_number)}
                        className="py-2 px-3 bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-300 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        title="Admin: Delete Order Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* TAB 4: 15th & 30th BANK PAYOUT APPROVALS QUEUE */}
      {activeTab === 'payouts' && (
        <div className="space-y-3">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-[#8B6508]">
            <Calendar className="w-4 h-4" />
            <span>Scheduled Payout Governance (15th & 30th Bi-Monthly Windows)</span>
          </div>

          {withdrawalsList.length === 0 ? (
            <div className="card-white p-6 text-center text-xs text-slate-500">
              No cash-out requests pending.
            </div>
          ) : (
            withdrawalsList.map((w) => {
              const memberInfo = w.member || admin;
              return (
                <div key={w.id} className="card-white p-4 space-y-3 border-l-4 border-l-[#D4AF37]">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8B6508] bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                        Target Payout: 15th / 30th Cycle
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">
                        {memberInfo.full_name} <span className="text-xs text-slate-500 font-semibold">({memberInfo.sponsor_id})</span>
                      </h4>
                      <p className="text-xs text-slate-600">{memberInfo.email} • {memberInfo.phone}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-base font-extrabold text-slate-900">R{w.amount.toFixed(2)}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        w.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {w.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* POPIA Audited Bank Account Verification Card */}
                  <div className="p-3 bg-slate-900 text-white rounded-xl text-xs space-y-1 shadow-inner relative">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                        Verified Bank Account Details (South Africa)
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCopyText(w.id, w.account_number, 'acc')}
                        className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-lg text-[10px] font-extrabold flex items-center gap-1 border border-amber-500/40 transition-all shadow-xs"
                      >
                        {copiedAccId === w.id ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
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

                    <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                      <div>
                        <p className="text-[9px] text-slate-400">BANK NAME</p>
                        <p className="font-bold text-white">{w.bank_name}</p>
                      </div>
                      <div
                        onClick={() => handleCopyText(w.id, w.account_number, 'acc')}
                        className="cursor-pointer group bg-slate-800/60 p-1 rounded border border-slate-700 hover:border-amber-400 transition-colors"
                        title="Click to copy account number"
                      >
                        <p className="text-[9px] text-slate-400 flex items-center justify-between">
                          <span>ACCOUNT NUMBER</span>
                          <Copy className="w-2.5 h-2.5 text-amber-400 opacity-60 group-hover:opacity-100" />
                        </p>
                        <p className="font-bold text-amber-200 text-xs font-mono group-hover:underline">
                          {w.account_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400">ACCOUNT TYPE</p>
                        <p className="font-bold text-white">{w.account_type || 'Savings'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400">BRANCH CODE</p>
                        <p className="font-bold text-white">{w.branch_code}</p>
                      </div>
                    </div>
                  </div>

                  {w.status === 'pending' && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleApprovePayout(w.id)}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve EFT & Disburse R{w.amount.toFixed(2)}</span>
                      </button>
                      <button
                        onClick={() => handleRejectPayout(w.id)}
                        className="py-2.5 px-3 bg-red-100 text-red-700 hover:bg-red-200 rounded-xl text-xs font-bold"
                      >
                        Reject & Refund
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 5: MEMBERS & BANKING DETAILS DIRECTORY */}
      {activeTab === 'members' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase">Registered Members & Banking Directory</h3>
            <span className="text-[10px] font-extrabold text-[#8B6508] bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
              POPIA Admin Privileged Access
            </span>
          </div>

          {/* Member Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search member by Name, Email, or Sponsor ID..."
              value={memberSearchQuery}
              onChange={(e) => setMemberSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-3">
            {membersList.length === 0 ? (
              <div className="card-white p-6 text-center text-xs text-slate-500">
                No members registered yet. Registered members will appear here.
              </div>
            ) : (
              membersList.filter(m =>
                m.full_name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                m.email.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                m.sponsor_id.toLowerCase().includes(memberSearchQuery.toLowerCase())
              ).map((m) => (
              <div key={m.id} className="card-white p-4 space-y-3 border-l-4 border-l-pink-300">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8B6508] bg-amber-100 px-2 py-0.5 rounded-full">
                      Sponsor ID: {m.sponsor_id}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{m.full_name}</h4>
                    <p className="text-xs text-slate-600">{m.email} • {m.phone}</p>
                  </div>

                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    m.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {m.status.toUpperCase()}
                  </span>
                </div>

                {/* Financial Overview */}
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-pink-50/50 rounded-xl border border-pink-100 text-center">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Wallet Balance</p>
                    <p className="text-xs font-extrabold text-slate-900">R{m.wallet_balance.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Lifetime Earnings</p>
                    <p className="text-xs font-extrabold text-emerald-600">R{m.lifetime_earnings.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Direct Recruits</p>
                    <p className="text-xs font-extrabold text-[#8B6508]">{m.direct_recruits_count}</p>
                  </div>
                </div>

                {/* Banking Information Card */}
                <div className="p-3 bg-slate-900 text-white rounded-xl text-xs space-y-1 shadow-inner relative">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                      Banking Details (South Africa)
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCopyText(m.id, m.bank_details?.account_number || '1489023412', 'acc')}
                      className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded text-[9px] font-bold flex items-center gap-1 border border-amber-500/40 transition-colors"
                    >
                      {copiedAccId === m.id ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
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

                  {m.bank_details?.bank_name ? (
                    <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                      <div><span className="text-slate-400 text-[9px]">BANK:</span> <span className="font-bold text-white">{m.bank_details.bank_name}</span></div>
                      <div
                        onClick={() => handleCopyText(m.id, m.bank_details!.account_number, 'acc')}
                        className="cursor-pointer group hover:underline"
                        title="Click to copy account number"
                      >
                        <span className="text-slate-400 text-[9px]">ACCOUNT #:</span> <span className="font-bold text-amber-200">{m.bank_details.account_number}</span>
                      </div>
                      <div><span className="text-slate-400 text-[9px]">TYPE:</span> <span className="font-bold text-white">{m.bank_details.account_type}</span></div>
                      <div><span className="text-slate-400 text-[9px]">BRANCH:</span> <span className="font-bold text-white">{m.bank_details.branch_code}</span></div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic pt-1">No banking details provided by member yet.</p>
                  )}
                </div>

                {/* Physical Courier Shipping Address Card */}
                <div className="p-3 bg-pink-50/60 rounded-xl text-xs space-y-1 border border-pink-200">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-extrabold text-pink-800 uppercase tracking-wider flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      <span>Physical Courier Shipping Address</span>
                    </p>
                    {m.shipping_address?.street && (
                      <button
                        type="button"
                        onClick={() => handleCopyText(m.id, `${m.shipping_address?.street}, ${m.shipping_address?.suburb}, ${m.shipping_address?.city}, ${m.shipping_address?.province}, ${m.shipping_address?.postal_code}`, 'addr')}
                        className="px-2 py-0.5 bg-pink-200/80 hover:bg-pink-200 text-pink-900 rounded text-[9px] font-extrabold flex items-center gap-1 border border-pink-300 transition-colors"
                      >
                        {copiedAddrId === m.id ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">✓ Address Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-pink-700" />
                            <span>Copy Address</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  {m.shipping_address?.street ? (
                    <div className="text-[11px] font-medium text-slate-800 pt-0.5">
                      <p className="font-bold text-slate-900">{m.shipping_address.street}</p>
                      <p>{m.shipping_address.suburb}, {m.shipping_address.city}</p>
                      <p className="text-slate-600 font-semibold">{m.shipping_address.province}, {m.shipping_address.postal_code}</p>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic pt-0.5">No shipping address provided by member yet.</p>
                  )}
                </div>
              </div>
            )))}
          </div>
        </div>
      )}

      {/* TAB 5: MASTER FINANCIAL LEDGER */}
      {activeTab === 'ledger' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="card-white p-4 border-l-4 border-l-emerald-500">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Sales Revenue</p>
              <h4 className="text-xl font-extrabold text-slate-900 mt-1">R{totalSalesRevenue.toFixed(2)}</h4>
            </div>
            <div className="card-white p-4 border-l-4 border-l-amber-500">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Commissions Paid</p>
              <h4 className="text-xl font-extrabold text-[#8B6508] mt-1">R{totalCommissionsPaid.toFixed(2)}</h4>
            </div>
            <div className="card-white p-4 border-l-4 border-l-indigo-500">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Company Net Retention</p>
              <h4 className="text-xl font-extrabold text-indigo-700 mt-1">R{companyNetRetention.toFixed(2)}</h4>
            </div>
            <div className="card-white p-4 border-l-4 border-l-pink-500">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Pending Liabilities</p>
              <h4 className="text-xl font-extrabold text-pink-600 mt-1">R{pendingLiabilities.toFixed(2)}</h4>
            </div>
          </div>
        </div>
      )}

      {/* TAB: COMMISSION SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-[#8B6508] rounded-xl">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase">Global Commission Settings</h3>
              <p className="text-[10px] text-slate-500 font-semibold">These bonuses apply to ALL products & combos automatically</p>
            </div>
          </div>

          {/* Current settings display */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card-white p-4 border-l-4 border-l-emerald-500 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Current Level 1 Bonus</p>
              <p className="text-2xl font-extrabold text-emerald-700">R{commissionSettings.level1_bonus.toFixed(2)}</p>
              <p className="text-[9px] text-slate-500">Paid to direct sponsor per order</p>
            </div>
            <div className="card-white p-4 border-l-4 border-l-amber-500 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Current Level 2 Bonus</p>
              <p className="text-2xl font-extrabold text-[#8B6508]">R{commissionSettings.level2_bonus.toFixed(2)}</p>
              <p className="text-[9px] text-slate-500">Paid to level-2 upline per order</p>
            </div>
          </div>

          {/* Edit form */}
          <div className="card-white p-4 space-y-4 border-t-4 border-t-[#D4AF37]">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">Update Global Bonus Amounts (ZAR)</h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1.5">
                  Level 1 Bonus (R) — Direct Sponsor
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-extrabold text-slate-400">R</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editLevel1}
                    onChange={(e) => setEditLevel1(e.target.value)}
                    className="w-full pl-7 pr-3 py-2.5 border-2 border-slate-200 focus:border-[#D4AF37] rounded-xl font-extrabold text-slate-900 text-sm focus:outline-none transition-colors"
                    placeholder="92.00"
                  />
                </div>
                <p className="text-[9px] text-slate-400 mt-1 font-medium">Credited to the member who made the sale</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1.5">
                  Level 2 Bonus (R) — Upline Sponsor
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-extrabold text-slate-400">R</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editLevel2}
                    onChange={(e) => setEditLevel2(e.target.value)}
                    className="w-full pl-7 pr-3 py-2.5 border-2 border-slate-200 focus:border-[#D4AF37] rounded-xl font-extrabold text-slate-900 text-sm focus:outline-none transition-colors"
                    placeholder="10.00"
                  />
                </div>
                <p className="text-[9px] text-slate-400 mt-1 font-medium">Credited to the sponsor's sponsor (2 levels up)</p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[10px] text-amber-900 font-medium space-y-0.5">
              <p>⚡ <strong>Applies to all products:</strong> Once saved, these bonus rates apply to every combo and product in the store — no need to edit each one individually.</p>
              <p>📅 Last updated: {new Date(commissionSettings.updated_at).toLocaleString('en-ZA')}</p>
            </div>

            <button
              type="button"
              onClick={handleSaveCommissionSettings}
              disabled={commissionSaving}
              className="w-full py-3 bg-[#D4AF37] hover:bg-[#C5A028] disabled:opacity-60 text-slate-900 rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2"
            >
              {commissionSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Settings2 className="w-4 h-4" />
              )}
              {commissionSaving ? 'Saving to Supabase...' : 'Save Global Commission Settings'}
            </button>
          </div>
        </div>
      )}

      {/* TAB: PROMOTIONS ENGINE */}
      {activeTab === 'promos' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase">Active Promotions Governance</h3>
              <p className="text-[10px] text-slate-500 font-semibold">Manage store banners, gift triggers, and promotional rules</p>
            </div>

            <button
              onClick={handleOpenNewPromoModal}
              className="px-3 py-1.5 bg-[#D4AF37] hover:bg-[#C5A028] text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Campaign</span>
            </button>
          </div>

          <div className="space-y-3">
            {promotionsList.map((promo) => (
              <div key={promo.id} className="card-white p-4 space-y-3 border-l-4 border-l-amber-500">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        promo.is_active ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {promo.is_active ? '🟢 ACTIVE IN STORE' : '🔴 DISABLED'}
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Rule: Min Spend R{promo.min_spend || 0}
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-900 mt-1.5">{promo.title}</h4>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">{promo.banner_text}</p>
                  </div>

                  {/* Toggle Promo Active Switch */}
                  <button
                    onClick={() => handleTogglePromotion(promo.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-2xs ${
                      promo.is_active
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {promo.is_active ? 'Turn OFF' : 'Enable Promo'}
                  </button>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between text-slate-700 font-semibold">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-[#8B6508]" />
                    <span>Free Gift Attached: <strong>{promo.gift_item_name || '1x Free Gift'}</strong></span>
                  </div>
                  
                  {/* Edit & Delete Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditPromotion(promo)}
                      className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                      title="Edit Promo Campaign"
                    >
                      <Edit3 className="w-3 h-3 text-slate-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeletePromotion(promo.id, promo.title)}
                      className="px-2 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE NEW PROMOTION MODAL */}
      {showPromoModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 pb-20 overflow-hidden">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-pink-200 flex flex-col max-h-[82vh] my-auto overflow-hidden">
            <div className="p-4 border-b border-pink-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-[#8B6508] rounded-xl">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-brand-serif text-slate-900 leading-tight">
                    {editingPromo ? 'Edit Promotion Campaign' : 'Create New Promotion Campaign'}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-semibold">Set store gift triggers and spend limits</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPromoModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePromotionSubmit} className="p-4 overflow-y-auto space-y-3 text-xs flex-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Women's Month Special Promo"
                  value={promoTitle}
                  onChange={(e) => setPromoTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Banner Subtitle / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spend R1,000+ & get a FREE Hand Sanitizer!"
                  value={promoBanner}
                  onChange={(e) => setPromoBanner(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Min Spend (ZAR) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="1000"
                    value={promoMinSpend}
                    onChange={(e) => setPromoMinSpend(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Free Gift Item *</label>
                  <input
                    type="text"
                    required
                    placeholder="1x Everglow Branded T-Shirt"
                    value={promoGiftName}
                    onChange={(e) => setPromoGiftName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-bold text-[11px]"
                  />
                </div>
              </div>

              {/* Campaign / Gift Image Selector from Device Gallery */}
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Campaign / Free Gift Image (From Device Gallery)
                </label>

                <div className="flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-2 px-3 py-2 bg-pink-50 border border-pink-200 hover:border-[#D4AF37] rounded-xl cursor-pointer hover:bg-pink-100 shrink-0 transition-colors shadow-2xs">
                    <Upload className="w-4 h-4 text-[#8B6508]" />
                    <span className="text-xs font-bold text-[#8B6508]">+ Upload from Device Gallery</span>
                    <input type="file" accept="image/*" onChange={handlePromoImageUpload} className="hidden" />
                  </label>

                  {promoImageUrl && (
                    <button
                      type="button"
                      onClick={() => setPromoImageUrl('')}
                      className="text-[10px] text-red-600 font-bold hover:underline"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                {/* Image Thumbnail Preview */}
                {promoImageUrl && (
                  <div className="mt-2 p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2.5">
                    <img
                      src={promoImageUrl}
                      alt="Campaign Gift Preview"
                      className="w-12 h-12 object-cover rounded-lg border border-amber-300 shrink-0"
                    />
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Uploaded Gift Image Preview</p>
                      <p className="text-xs font-extrabold text-slate-900 line-clamp-1">{promoGiftName || 'Custom Special Gift'}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[10px] text-amber-900 space-y-1 font-medium">
                <p>⚡ <strong>Real-Time Sync:</strong> Once created, this promotion will instantly display on the Member Store & auto-add the free gift in the basket review whenever the minimum spend condition is met!</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPromoModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#D4AF37] hover:bg-[#C5A028] text-slate-950 rounded-xl font-extrabold shadow-md"
                >
                  {editingPromo ? 'Save Changes 💾' : 'Launch Promotion 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM COMBO CREATION MODAL */}
      {showComboModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 pb-24 overflow-hidden">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-pink-200 flex flex-col max-h-[78vh] my-auto overflow-hidden">
            {/* Fixed Modal Header */}
            <div className="p-4 border-b border-pink-100 flex items-center justify-between bg-white shrink-0">
              <h3 className="text-base font-bold font-brand-serif text-slate-900 leading-tight">
                Add Product / Combo Builder
              </h3>
              <button
                type="button"
                onClick={() => setShowComboModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="combo-builder-form" onSubmit={handleCreateComboSubmit} className="p-4 overflow-y-auto space-y-3 text-xs flex-1">
              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">Combo Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Combo A - Deluxe Glow Kit"
                  value={comboName}
                  onChange={(e) => setComboName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col justify-end">
                  <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1 leading-tight h-6 flex items-end">
                    Wholesale Price (R)
                  </label>
                  <input
                    type="number"
                    required
                    value={wholesalePrice}
                    onChange={(e) => setWholesalePrice(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-bold"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1 leading-tight h-6 flex items-end">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    required
                    value={comboStock}
                    onChange={(e) => setComboStock(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-bold"
                  />
                </div>
              </div>

              {/* Level 1 & 2 bonus fields REMOVED — now set globally in Settings tab */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[10px] text-emerald-800 font-medium flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Global Bonuses Apply:</strong> L1 = R{commissionSettings.level1_bonus.toFixed(2)} | L2 = R{commissionSettings.level2_bonus.toFixed(2)}. Change these in the <strong>Commission Settings</strong> tab.
                </span>
              </div>

              {/* Dynamic Combo Component Products & Quantities Editor */}
              <div className="space-y-2 p-3 bg-amber-50/60 rounded-xl border border-amber-200/80">
                <div className="flex items-center justify-between">
                  <label className="block font-extrabold text-[#8B6508] uppercase text-[10px]">
                    Combo Items & Quantities Mix
                  </label>
                  <button
                    type="button"
                    onClick={handleAddComboItem}
                    className="text-[10px] font-extrabold text-[#8B6508] bg-white px-2 py-0.5 rounded-lg border border-amber-300 shadow-2xs hover:bg-amber-100"
                  >
                    + Add Item Line
                  </button>
                </div>

                <div className="space-y-2">
                  {comboItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-1.5 bg-white p-2 rounded-xl border border-amber-200 shadow-2xs">
                      <input
                        type="text"
                        required
                        placeholder="Product Name (e.g. Exfoliating Gel 50g)"
                        value={item.name}
                        onChange={(e) => handleUpdateComboItem(idx, 'name', e.target.value)}
                        className="min-w-0 flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#D4AF37]"
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Qty</span>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleUpdateComboItem(idx, 'quantity', Number(e.target.value))}
                          className="w-11 px-1 py-1.5 border border-slate-200 rounded-lg text-xs text-center font-extrabold text-slate-900 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      {comboItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveComboItem(idx)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                          title="Remove item line"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-[9px] font-bold text-[#8B6508]">
                  Total Combo Pack Size: {comboItems.reduce((sum, i) => sum + Number(i.quantity || 0), 0)} items in kit
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">Combo Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Leave blank to auto-generate from combo mix breakdown above"
                  value={comboDesc}
                  onChange={(e) => setComboDesc(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              {/* Interactive Photo Selection Grid (Up to 5 Gallery Photos) */}
              <div className="space-y-2 p-3 bg-pink-50/60 rounded-xl border border-pink-200/80">
                <div className="flex items-center justify-between">
                  <label className="block font-extrabold text-[#8B6508] uppercase text-[10px]">
                    Product Gallery Photos ({comboPhotos.length}/5 Selected)
                  </label>
                  <span className="text-[9px] font-bold text-slate-400">
                    From Device Gallery
                  </span>
                </div>

                {/* Selected Photos Thumbnail Grid */}
                <div className="grid grid-cols-5 gap-1.5">
                  {comboPhotos.map((url, idx) => (
                    <div key={idx} className="relative w-full h-14 bg-white rounded-lg overflow-hidden border border-pink-200 group shadow-2xs">
                      <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveComboPhoto(idx)}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center shadow-xs hover:bg-red-700 transition-colors"
                        title="Remove Photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Add Photo Button (If under 5 photos) */}
                  {comboPhotos.length < 5 && (
                    <label className="h-14 bg-white border-2 border-dashed border-pink-300 hover:border-[#D4AF37] rounded-lg flex flex-col items-center justify-center cursor-pointer text-[#8B6508] transition-colors shadow-2xs">
                      <Upload className="w-4 h-4 text-[#8B6508]" />
                      <span className="text-[8px] font-extrabold mt-0.5">+ Select</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleComboPhotoSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <p className="text-[9px] text-slate-500 italic leading-none pt-0.5">
                  Tap <strong>"+ Select"</strong> to pick photos directly from your phone/computer gallery.
                </p>
              </div>
            </form>

            {/* Fixed Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowComboModal(false)}
                className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="combo-builder-form"
                className="flex-1 py-2.5 bg-[#D4AF37] hover:bg-[#C5A028] text-slate-900 rounded-xl text-xs font-bold shadow-md"
              >
                Save Combo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERNAL TOAST FALLBACK */}
      {toastMsg && (
        <div className="fixed bottom-20 left-4 right-4 max-w-sm mx-auto bg-slate-900 text-amber-300 px-4 py-3 rounded-2xl shadow-2xl z-50 flex items-center justify-between border border-amber-500/50 animate-bounce">
          <span className="text-xs font-bold">{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* MASTER ACTION CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-pink-200 p-6 space-y-5 relative my-auto animate-scale-up">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl border shrink-0 ${
                  confirmModal.variant === 'danger' ? 'bg-rose-100 border-rose-200 text-rose-600' :
                  confirmModal.variant === 'success' ? 'bg-emerald-100 border-emerald-200 text-emerald-600' :
                  confirmModal.variant === 'warning' ? 'bg-amber-100 border-amber-200 text-amber-600' :
                  'bg-amber-100 border-amber-300 text-[#8B6508]'
                }`}>
                  {confirmModal.variant === 'danger' ? <Trash2 className="w-6 h-6" /> :
                   confirmModal.variant === 'success' ? <CheckCircle2 className="w-6 h-6" /> :
                   confirmModal.variant === 'warning' ? <AlertTriangle className="w-6 h-6" /> :
                   <Sparkles className="w-6 h-6" />}
                </div>
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#8B6508] bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                    Everglow Security
                  </span>
                  <h3 className="text-base font-extrabold font-brand-serif text-slate-900 mt-1 leading-tight">
                    {confirmModal.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium bg-pink-50/50 p-4 rounded-2xl border border-pink-100">
              {confirmModal.message}
            </p>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-extrabold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  confirmModal.onConfirm();
                }}
                className={`flex-1 py-3 text-white rounded-2xl text-xs font-black shadow-lg transition-all cursor-pointer ${
                  confirmModal.variant === 'danger' ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-rose-600/30' :
                  confirmModal.variant === 'success' ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-emerald-600/30' :
                  confirmModal.variant === 'warning' ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-amber-500/30' :
                  'bg-gradient-to-r from-[#D4AF37] to-[#C5A028] text-slate-950 shadow-amber-500/30'
                }`}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
