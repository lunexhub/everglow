import React, { useState } from 'react';
import { ShoppingBag, ShoppingCart, Sparkles, Tag, ShieldCheck, Plus, Minus, Upload, CheckCircle2, Gift, TrendingUp, Filter, Trash2, ArrowRight, X, ChevronDown, Package } from 'lucide-react';
import { Product, OrderItem, Profile, Promotion, CommissionSettings } from '../types';
import { generateOrderInvoicePDF } from '../lib/pdfGenerator';

interface StoreViewProps {
  member: Profile;
  products?: Product[];
  promotions?: Promotion[];
  commissionSettings?: CommissionSettings;
  onPlaceOrder: (items: OrderItem[], totalAmount: number, popUrl?: string) => void;
}

export const StoreView: React.FC<StoreViewProps> = ({
  member,
  products = [],
  promotions = [],
  commissionSettings,
  onPlaceOrder
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'beauty' | 'essentials'>('all');
  const [cart, setCart] = useState<{ [productId: string]: number }>({});
  const [selectedImages, setSelectedImages] = useState<{ [productId: string]: string }>({});
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'pop'>('cart');
  const [isCartMinimized, setIsCartMinimized] = useState(false);
  const [popFile, setPopFile] = useState<File | null>(null);
  const [popPreview, setPopPreview] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Auto 0-Inventory Hiding Rule: Filter out items with 0 stock
  const inStockProducts = products.filter(p => p.stock_qty > 0);

  const filteredProducts = inStockProducts.filter(p => {
    if (activeTab === 'beauty') return p.category === 'beauty';
    if (activeTab === 'essentials') return p.category === 'essentials' || p.category === 'detergents';
    return true;
  });

  const activePromo = promotions.find(pr => pr.is_active);

  const handleQuantityChange = (productId: string, delta: number) => {
    setCart(prev => {
      const current = prev[productId] || 0;
      const updated = Math.max(0, current + delta);
      if (updated === 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: updated };
    });
  };

  const getCartTotal = (): number => {
    return Object.entries(cart).reduce((sum, [productId, qty]) => {
      const p = products.find(prod => prod.id === productId);
      return sum + (p ? p.wholesale_price * qty : 0);
    }, 0);
  };

  const getCartRetailValue = (): number => {
    return Object.entries(cart).reduce((sum, [productId, qty]) => {
      const p = products.find(prod => prod.id === productId);
      if (!p) return sum;
      return sum + (p.pack_size * p.retail_price_unit * qty);
    }, 0);
  };

  const getCartMemberProfit = (): number => {
    return getCartRetailValue() - getCartTotal();
  };

  const getCartCount = (): number => {
    return Object.values(cart).reduce((sum, q) => sum + q, 0);
  };

  const isPromoTriggered = (): boolean => {
    if (!activePromo) return false;
    if (activePromo.rule_type === 'spend_threshold' && activePromo.min_spend) {
      return getCartTotal() >= activePromo.min_spend;
    }
    return false;
  };

  const handlePopUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPopFile(file);
      setPopPreview(URL.createObjectURL(file));
    }
  };

  const handleConfirmCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    const orderItems: OrderItem[] = Object.entries(cart).map(([productId, qty]) => {
      const p = products.find(prod => prod.id === productId)!;
      return {
        product_id: p.id,
        product_name: p.name,
        quantity: qty,
        unit_price: p.wholesale_price,
        image_url: p.image_url
      };
    });

    // Auto add free promo gift if condition met
    if (isPromoTriggered() && activePromo?.gift_product_id) {
      const giftP = products.find(prod => prod.id === activePromo.gift_product_id);
      if (giftP) {
        orderItems.push({
          product_id: giftP.id,
          product_name: giftP.name,
          quantity: 1,
          unit_price: 0,
          image_url: giftP.image_url,
          is_free_gift: true
        });
      }
    }

    const total = getCartTotal();
    onPlaceOrder(orderItems, total, popPreview || undefined);

    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      setShowCheckoutModal(false);
      setCart({});
    }, 2000);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Active Promotion Engine Banner */}
      {activePromo && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 p-3.5 rounded-2xl shadow-md border border-amber-300 relative overflow-hidden">
          <div className="flex items-center gap-3">
            {activePromo.image_url ? (
              <img
                src={activePromo.image_url}
                alt="Campaign Gift"
                className="w-14 h-14 object-cover rounded-xl border-2 border-white/80 shadow-md shrink-0"
              />
            ) : (
              <div className="p-2 bg-white/30 rounded-xl shrink-0">
                <Gift className="w-6 h-6 text-slate-900" />
              </div>
            )}
            <div className="min-w-0">
              <span className="text-[9px] font-extrabold uppercase tracking-wider bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full">
                Active Promotion
              </span>
              <h3 className="text-xs font-extrabold text-slate-950 mt-1 truncate">
                {activePromo.title}
              </h3>
              <p className="text-[11px] font-medium text-slate-900 mt-0.5 line-clamp-2">
                {activePromo.banner_text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Store Combo Filter Tabs */}
      <div className="flex gap-1.5 p-1 bg-white rounded-xl border border-slate-200 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex-1 ${
            activeTab === 'all' ? 'bg-[#D4AF37] text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          All Combos ({inStockProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('beauty')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex-1 ${
            activeTab === 'beauty' ? 'bg-[#D4AF37] text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Beauty Combos ✨
        </button>
        <button
          onClick={() => setActiveTab('essentials')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex-1 ${
            activeTab === 'essentials' ? 'bg-[#D4AF37] text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Hygiene Combos 🧴
        </button>
      </div>

      {/* Product Grid */}
      <div className="space-y-3.5">
        {filteredProducts.length === 0 ? (
        <div className="card-white p-8 text-center space-y-3 my-6 border-pink-100">
          <div className="w-14 h-14 bg-pink-50 text-[#8B6508] rounded-2xl flex items-center justify-center mx-auto border border-pink-100 shadow-2xs">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 font-brand-serif">No Wholesale Products Available Yet</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            There are currently no products in this category. As the Admin creates product combos, they will appear here live in real-time.
          </p>
        </div>
      ) : (
        filteredProducts.map((p) => {
          const qtyInCart = cart[p.id] || 0;
          const totalRetailValue = p.pack_size * p.retail_price_unit;
          const memberProfit = totalRetailValue - p.wholesale_price;

          return (
            <div key={p.id} className="card-white p-4 space-y-3 relative overflow-hidden">
              {p.is_combo && (
                <span className="absolute top-3 right-3 z-10 bg-pink-100 text-pink-700 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-pink-200 shadow-xs">
                  Custom Combo
                </span>
              )}

              {/* Main Product Image & 5-Photo Gallery Strip */}
              {p.image_url && (
                <div className="space-y-1.5">
                  <div className="w-full h-44 bg-slate-100 rounded-xl overflow-hidden border border-pink-100 relative">
                    <img
                      src={selectedImages[p.id] || p.image_url}
                      alt={p.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80';
                      }}
                      className="w-full h-full object-cover transition-all duration-300"
                    />
                  </div>

                  {/* Thumbnail Strip (Up to 5 Photos) */}
                  {p.images && p.images.length > 1 && (
                    <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none">
                      {p.images.slice(0, 5).map((imgUrl, imgIdx) => {
                        const isSelected = (selectedImages[p.id] || p.image_url) === imgUrl;
                        return (
                          <button
                            key={imgIdx}
                            type="button"
                            onClick={() => setSelectedImages(prev => ({ ...prev, [p.id]: imgUrl }))}
                            className={`w-11 h-11 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                              isSelected ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]' : 'border-slate-200 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={imgUrl}
                              alt={`Thumbnail ${imgIdx + 1}`}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80';
                              }}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {p.pack_size}-Pack Wholesale
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    • In Stock ({p.stock_qty})
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 font-brand-serif mt-0.5 break-words">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed break-all font-medium">
                  {p.description}
                </p>
              </div>

              {/* Combo Mix Breakdown if Combo */}
              {p.is_combo && p.combo_items && p.combo_items.length > 0 && (
                <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/90 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-[#8B6508] uppercase tracking-wide">
                      📦 Included Combo Items Mix:
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

              {/* Wholesale Price & Pack Size Summary */}
              <div className="flex items-center justify-between p-2.5 bg-amber-50/40 rounded-xl border border-amber-200/60">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Wholesale Price</p>
                  <p className="text-sm font-black text-slate-900">R{p.wholesale_price.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Pack Size</p>
                  <p className="text-xs font-extrabold text-[#8B6508] bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                    {p.pack_size} Items Total
                  </p>
                </div>
              </div>

              {/* Level 1 & Level 2 Commissions Info */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                <span>Direct 1 Bonus: <strong className="text-slate-800">R{(commissionSettings?.level1_bonus ?? (p as any).level1_bonus ?? 92).toFixed(2)}</strong></span>
                <span>Direct 2 Bonus: <strong className="text-slate-800">R{(commissionSettings?.level2_bonus ?? (p as any).level2_bonus ?? 10).toFixed(2)}</strong></span>
              </div>

              {/* Quantity Counter & Add to Cart */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-base font-extrabold text-slate-900">
                  R{p.wholesale_price.toFixed(2)}
                </span>

                <div className="flex items-center gap-2">
                  {qtyInCart > 0 ? (
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => handleQuantityChange(p.id, -1)}
                        className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-800"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold text-slate-900 w-4 text-center">
                        {qtyInCart}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(p.id, 1)}
                        className="w-7 h-7 rounded-lg bg-[#D4AF37] shadow-xs flex items-center justify-center text-slate-900"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleQuantityChange(p.id, 1)}
                      className="px-4 py-2 bg-[#D4AF37] text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-[#C5A028]"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add Stock Pack</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        }))}
      </div>

      {/* Floating Shopping Trolley & Basket Component */}
      {getCartCount() > 0 && (
        isCartMinimized ? (
          /* Minimized Floating Small Basket FAB Badge */
          <div className="fixed bottom-16 right-3 z-40 flex items-center gap-2 animate-bounce-short">
            <button
              onClick={() => {
                setCheckoutStep('cart');
                setShowCheckoutModal(true);
              }}
              className="p-3.5 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white rounded-2xl shadow-2xl border-2 border-amber-400/80 flex items-center justify-center relative hover:scale-105 active:scale-95 transition-all group"
              title="Open Basket"
            >
              <ShoppingCart className="w-6 h-6 text-[#D4AF37]" />
              <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-slate-950 text-[10px] font-black w-5.5 h-5.5 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-950">
                {getCartCount()}
              </span>
            </button>

            <button
              onClick={() => setIsCartMinimized(false)}
              className="p-1.5 bg-slate-900/90 text-amber-300 rounded-lg text-[9px] font-bold border border-amber-400/30 hover:bg-slate-800 shadow-md"
              title="Expand Bar"
            >
              Expand ➔
            </button>
          </div>
        ) : (
          /* Full Width Luxury Floating Basket Bar */
          <div className="fixed bottom-16 left-3 right-3 max-w-lg mx-auto bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white rounded-2xl p-2 shadow-2xl z-40 flex items-center justify-between gap-2 border border-amber-400/40 backdrop-blur-md animate-slide-up">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {/* Shopping Cart Icon with Item Count Badge */}
              <div className="relative p-2 bg-amber-500/20 text-[#D4AF37] rounded-xl border border-amber-400/30 shrink-0">
                <ShoppingCart className="w-4 h-4 text-[#D4AF37]" />
                <span className="absolute -top-1.5 -right-1.5 bg-[#D4AF37] text-slate-950 text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md">
                  {getCartCount()}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold text-amber-300 uppercase tracking-wider truncate">
                  {getCartCount()} Item{getCartCount() > 1 ? 's' : ''} in Basket
                </p>
                <h4 className="text-xs sm:text-sm font-black text-white leading-none whitespace-nowrap">
                  R{getCartTotal().toFixed(2)}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => {
                  setCheckoutStep('cart');
                  setShowCheckoutModal(true);
                }}
                className="px-3 py-2 bg-[#D4AF37] hover:bg-[#C5A028] text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-md transition-all whitespace-nowrap"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>View Basket</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              {/* Minimize Button */}
              <button
                onClick={() => setIsCartMinimized(true)}
                className="p-1.5 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-xl transition-colors shrink-0"
                title="Minimize Basket Bar"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      )}

      {/* Modern Shopping Cart & Order Summary Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 pb-20 overflow-hidden">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-pink-200 flex flex-col max-h-[82vh] my-auto overflow-hidden">
            {/* Fixed Modal Header */}
            <div className="p-4 border-b border-pink-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-pink-100 text-pink-700 rounded-xl">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-brand-serif text-slate-900 leading-tight">
                    {orderSuccess
                      ? 'Order Submitted'
                      : checkoutStep === 'cart'
                      ? `Your Wholesale Basket (${getCartCount()})`
                      : 'Payment & POP Receipt'}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-semibold">
                    {orderSuccess
                      ? 'Invoice Generated'
                      : checkoutStep === 'cart'
                      ? 'Step 1 of 2: Review Selected Combos'
                      : 'Step 2 of 2: Bank EFT & POP Upload'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            {orderSuccess ? (
              <div className="p-6 text-center space-y-4 my-auto">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900">Order Submitted Successfully!</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your wholesale stock order status is now <span className="font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">🟡 Pending Approval</span>. Admin will verify POP payment, process commissions, and assign courier tracking!
                </p>
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="w-full py-3 bg-[#D4AF37] text-slate-950 rounded-xl text-xs font-bold shadow-md"
                >
                  Done & Return to Store
                </button>
              </div>
            ) : checkoutStep === 'cart' ? (
              /* STEP 1: REVIEW BASKET ITEMS (Clean 2-Row Non-Colliding Layout) */
              <div className="p-4 overflow-y-auto space-y-3 text-xs flex-1">
                <div className="space-y-2">
                  {Object.entries(cart).map(([productId, qty]) => {
                    const product = products.find(p => p.id === productId);
                    if (!product || qty === 0) return null;
                    const itemTotal = product.wholesale_price * qty;

                    return (
                      <div key={productId} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        {/* Row 1: Thumbnail Image, Title, Price and Subtotal */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={selectedImages[product.id] || product.image_url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80'}
                              alt={product.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80';
                              }}
                              className="w-11 h-11 object-cover rounded-xl border border-pink-100 shrink-0"
                            />
                            <div className="min-w-0">
                              <h5 className="font-extrabold text-slate-900 text-xs leading-tight">{product.name}</h5>
                              <p className="text-[10px] text-[#8B6508] font-bold mt-0.5">
                                R{product.wholesale_price.toFixed(2)} / pack
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Subtotal</p>
                            <p className="text-xs font-black text-slate-900">R{itemTotal.toFixed(2)}</p>
                          </div>
                        </div>

                        {/* Row 2: Combo Mix Breakdown & Quantity Controls */}
                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                          {product.combo_items && product.combo_items.length > 0 ? (
                            <span className="text-[9px] text-slate-600 font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200 truncate max-w-[170px]">
                              {product.combo_items.map(i => `${i.quantity}x ${i.name}`).join(' + ')}
                            </span>
                          ) : (
                            <span className="text-[9px] text-slate-400 font-semibold">Wholesale Pack</span>
                          )}

                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(product.id, -1)}
                                className="w-6 h-6 rounded bg-slate-100 text-slate-800 font-bold flex items-center justify-center hover:bg-slate-200"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-5 text-center font-bold text-xs">{qty}</span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(product.id, 1)}
                                className="w-6 h-6 rounded bg-[#D4AF37] text-slate-900 font-bold flex items-center justify-center hover:bg-[#C5A028]"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleQuantityChange(product.id, -qty)}
                              className="p-1.5 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                              title="Remove Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Promo Gift Notice */}
                {isPromoTriggered() && (
                  <div className="p-3 bg-amber-100/90 border border-amber-300 rounded-xl flex items-center gap-3 text-amber-950 font-bold text-xs shadow-2xs">
                    {activePromo?.image_url ? (
                      <img
                        src={activePromo.image_url}
                        alt="Promo Gift"
                        className="w-12 h-12 object-cover rounded-lg border border-amber-400 shrink-0"
                      />
                    ) : (
                      <Gift className="w-5 h-5 text-[#8B6508] shrink-0" />
                    )}
                    <div className="min-w-0">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                        🎉 FREE GIFT TRIGGERED!
                      </span>
                      <p className="text-xs font-extrabold text-slate-900 mt-0.5">
                        {activePromo?.gift_item_name || '1x Free Campaign Gift Item'}
                      </p>
                      <p className="text-[10px] text-slate-600 font-semibold">Auto-added to your wholesale stock order</p>
                    </div>
                  </div>
                )}

                {/* Wholesale Order Financial Summary */}
                <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-700">Total Wholesale Order Cost:</span>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Includes {getCartCount()} stock combo pack{getCartCount() > 1 ? 's' : ''}</p>
                  </div>
                  <span className="text-base font-black text-slate-900">R{getCartTotal().toFixed(2)}</span>
                </div>
              </div>
            ) : (
              /* STEP 2: PRO-FORMA INVOICE PREVIEW, WHATSAPP, PDF & POP UPLOAD FORM */
              <form id="checkout-form" onSubmit={handleConfirmCheckout} className="p-4 overflow-y-auto space-y-3.5 text-xs flex-1">
                {/* Pro-Forma Invoice Header & Address Box */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-300 shadow-2xs space-y-2">
                  <div className="flex justify-between items-center border-b border-pink-100 pb-2">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8B6508] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Pro-Forma Tax Invoice
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-900 mt-1">Customer: {member.full_name}</h4>
                      <p className="text-[10px] text-slate-600 font-medium">Sponsor ID: {member.sponsor_id} • {member.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-amber-700">#EG-{Math.floor(1000 + Math.random() * 9000)}</p>
                      <p className="text-[10px] font-bold text-slate-700">Date: {new Date().toLocaleDateString('en-ZA')}</p>
                    </div>
                  </div>

                  {/* Delivery Shipping Address Details */}
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px]">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Fulfillment Delivery Address</p>
                    <p className="font-bold text-slate-900">{member.shipping_address?.street || '142 Jan Smuts Avenue, Unit 4'}</p>
                    <p className="text-slate-700 font-medium">{member.shipping_address?.suburb ? `${member.shipping_address.suburb}, ${member.shipping_address.city}` : 'Rosebank, Johannesburg'}</p>
                    <p className="text-slate-600 font-semibold">{member.shipping_address?.province ? `${member.shipping_address.province}, ${member.shipping_address.postal_code}` : 'Gauteng, 2196'}</p>
                  </div>
                </div>

                {/* Everglow Official Banking Details Box */}
                <div className="p-3 bg-slate-900 text-white rounded-xl space-y-1 shadow-inner">
                  <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                    Official Everglow Bank Details (EFT Payment)
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                    <div><span className="text-slate-400 text-[9px]">BANK:</span> <span className="font-bold text-white">Capitec Bank</span></div>
                    <div><span className="text-slate-400 text-[9px]">ACCOUNT #:</span> <span className="font-bold text-amber-200">1489023412</span></div>
                    <div><span className="text-slate-400 text-[9px]">TYPE:</span> <span className="font-bold text-white">Savings</span></div>
                    <div><span className="text-slate-400 text-[9px]">BRANCH:</span> <span className="font-bold text-white">470010</span></div>
                  </div>
                </div>

                {/* 1-Click PDF Download & WhatsApp Share Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const tempOrder: Order = {
                        id: `order-temp`,
                        order_number: `#EG-${Math.floor(1000 + Math.random() * 9000)}`,
                        member_id: member.id,
                        items: Object.entries(cart).map(([pId, q]) => {
                          const p = products.find(prod => prod.id === pId);
                          return {
                            product_id: pId,
                            product_name: p?.name || 'Wholesale Pack',
                            quantity: q,
                            unit_price: p?.wholesale_price || 0,
                            image_url: p?.image_url
                          };
                        }),
                        total_amount: getCartTotal(),
                        payment_status: 'pending',
                        fulfillment_status: 'pending',
                        created_at: new Date().toISOString()
                      };
                      generateOrderInvoicePDF(tempOrder, member);
                    }}
                    className="py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 border border-slate-300 shadow-2xs"
                  >
                    <span>📥 Download PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const itemsText = Object.entries(cart).map(([pId, q]) => {
                        const p = products.find(prod => prod.id === pId);
                        return `• ${q}x ${p?.name || 'Pack'} (R${((p?.wholesale_price || 0) * q).toFixed(2)})`;
                      }).join('\n');

                      const text = encodeURIComponent(
                        `*EVERGLOW COMMUNITY PRO-FORMA INVOICE*\n` +
                        `Customer: ${member.full_name} (${member.sponsor_id})\n` +
                        `Date: ${new Date().toLocaleDateString('en-ZA')}\n\n` +
                        `*Order Items:*\n${itemsText}\n\n` +
                        `*Total Amount Due: R${getCartTotal().toFixed(2)}*\n\n` +
                        `*Payment Banking Details (Capitec Bank):*\n` +
                        `Account Number: 1489023412\n` +
                        `Branch Code: 470010\n` +
                        `Account Type: Savings\n\n` +
                        `Sending POP Receipt for Admin Verification.`
                      );
                      window.open(`https://wa.me/27729162168?text=${text}`, '_blank');
                    }}
                    className="py-2 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs transition-colors"
                  >
                    <span>💬 Send POP to WhatsApp (+27 72 916 2168)</span>
                  </button>
                </div>

                {/* Upload POP Receipt */}
                <div className="space-y-1 pt-1">
                  <label className="block text-[10px] font-bold text-slate-700 uppercase">
                    Upload Proof of Payment (POP Receipt) *
                  </label>
                  <label className="flex flex-col items-center justify-center gap-1.5 p-3.5 bg-amber-50/60 border-2 border-dashed border-amber-300 rounded-xl cursor-pointer hover:bg-amber-100/40 transition-colors text-center">
                    <Upload className="w-5 h-5 text-[#8B6508]" />
                    <span className="text-xs font-bold text-slate-800">
                      {popFile ? popFile.name : 'Tap to upload POP image or PDF receipt'}
                    </span>
                    <span className="text-[9px] text-slate-500 font-semibold">Accepts JPG, PNG, or PDF format</span>
                    <input type="file" accept="image/*,.pdf" onChange={handlePopUpload} className="hidden" />
                  </label>
                </div>
              </form>
            )}

            {/* Fixed Modal Footer Buttons */}
            {!orderSuccess && (
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2 shrink-0">
                {checkoutStep === 'cart' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowCheckoutModal(false)}
                      className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold shadow-2xs"
                    >
                      Continue Shopping
                    </button>
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('pop')}
                      className="flex-1 py-2.5 bg-[#D4AF37] hover:bg-[#C5A028] text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-1 shadow-md"
                    >
                      <span>Proceed to POP</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('cart')}
                      className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold shadow-2xs"
                    >
                      Back to Basket
                    </button>
                    <button
                      type="submit"
                      form="checkout-form"
                      className="flex-1 py-2.5 bg-[#D4AF37] hover:bg-[#C5A028] text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-1 shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Order & POP</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
