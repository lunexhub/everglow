import React, { useState } from 'react';
import { Package, Truck, CheckCircle2, Clock, Download, ExternalLink, MessageSquare, AlertCircle, Link as LinkIcon, Check } from 'lucide-react';
import { Order, Profile, OrderFulfillmentStatus } from '../types';
import { generateOrderInvoicePDF } from '../lib/pdfGenerator';

interface MyOrdersViewProps {
  member: Profile;
  orders?: Order[];
  onUpdateOrderStage?: (orderId: string, stage: OrderFulfillmentStatus) => void;
  onUpdateWaybillUrl?: (orderId: string, url: string) => void;
}

export const MyOrdersView: React.FC<MyOrdersViewProps> = ({
  member,
  orders = [],
  onUpdateOrderStage,
  onUpdateWaybillUrl
}) => {
  const [editingUrlOrderId, setEditingUrlOrderId] = useState<string | null>(null);
  const [tempUrlInput, setTempUrlInput] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'in_transit' | 'delivered'>('all');

  const getFulfillmentStep = (status: string) => {
    switch (status) {
      case 'pending': return 1;
      case 'packing': return 2;
      case 'in_transit': return 3;
      case 'delivered': return 4;
      default: return 1;
    }
  };

  const filteredOrders = orders.filter(o => {
    if (filterStatus === 'pending') return o.payment_status === 'pending';
    if (filterStatus === 'approved') return o.payment_status === 'approved';
    if (filterStatus === 'in_transit') return o.fulfillment_status === 'in_transit';
    if (filterStatus === 'delivered') return o.fulfillment_status === 'delivered';
    return true;
  });

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 font-brand-serif">
          Wholesale Stock Orders
        </h2>
        <span className="text-xs font-semibold text-slate-500">
          {orders.length} Total Orders
        </span>
      </div>

      {/* Order Status Filter Bar */}
      <div className="flex gap-1.5 p-1 bg-white rounded-xl border border-slate-200 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all whitespace-nowrap ${
            filterStatus === 'all' ? 'bg-[#D4AF37] text-slate-950 shadow-xs' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Orders ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('pending')}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all whitespace-nowrap ${
            filterStatus === 'pending' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          ⏳ Pending ({orders.filter(o => o.payment_status === 'pending').length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('approved')}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all whitespace-nowrap ${
            filterStatus === 'approved' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          ✅ Approved ({orders.filter(o => o.payment_status === 'approved').length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('in_transit')}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all whitespace-nowrap ${
            filterStatus === 'in_transit' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          🚚 In-Transit ({orders.filter(o => o.fulfillment_status === 'in_transit').length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('delivered')}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all whitespace-nowrap ${
            filterStatus === 'delivered' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          🏁 Delivered ({orders.filter(o => o.fulfillment_status === 'delivered').length})
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="card-white p-8 text-center space-y-3">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No Orders in this Status</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Switch status filters above to view orders in other fulfillment stages.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredOrders.map((order) => {
            const step = getFulfillmentStep(order.fulfillment_status);

            return (
              <div key={order.id} className="card-white p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-extrabold text-[#8B6508] bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      {order.order_number}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(order.created_at).toLocaleDateString('en-ZA')}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-900">
                      R{order.total_amount.toFixed(2)}
                    </span>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                        order.payment_status === 'approved' 
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                          : order.payment_status === 'rejected'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                      }`}>
                        {order.payment_status === 'approved' 
                          ? '✅ PAYMENT APPROVED' 
                          : order.payment_status === 'rejected'
                          ? '❌ PAYMENT REJECTED'
                          : '⏳ PENDING ADMIN APPROVAL'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pending Approval Notice for Members & Admin Quick-Action */}
                {order.payment_status === 'pending' && (
                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[10px] text-amber-900 font-medium space-y-1.5">
                    <p>⏳ <strong>Payment Verification Pending:</strong> Your order proof of payment is submitted and waiting for Admin approval. Stock packing and upline commissions will be processed once verified.</p>
                    {member.role === 'admin' && (
                      <button
                        type="button"
                        onClick={() => onUpdateOrderStage?.(order.id, 'packing')}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-lg flex items-center justify-center gap-1 shadow-2xs cursor-pointer transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Admin: Approve EFT Payment Now</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Items Summary with E-Commerce Product Images */}
                <div className="space-y-2 py-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 text-xs bg-pink-50/40 p-2 rounded-xl border border-pink-100/60">
                      <div className="flex items-center gap-2.5">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80';
                            }}
                            className="w-10 h-10 object-cover rounded-lg border border-pink-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-[#8B6508] font-bold text-[10px] shrink-0">
                            EG
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1">{item.product_name}</p>
                          <p className="text-[10px] text-slate-500 font-semibold">Qty: {item.quantity} {item.is_free_gift ? '• [FREE GIFT]' : ''}</p>
                        </div>
                      </div>
                      <span className="font-extrabold text-slate-900 shrink-0">
                        {item.is_free_gift ? 'FREE' : `R${(item.quantity * item.unit_price).toFixed(2)}`}
                      </span>
                    </div>
                  ))}
                </div>
                  
                {/* Real-Time Delivery Fulfillment Timeline */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Real-Time Courier Fulfillment Timeline (Tap stage to update)
                    </p>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border ${
                      order.payment_status === 'approved' 
                        ? 'text-[#8B6508] bg-amber-50 border-amber-200' 
                        : 'text-amber-800 bg-amber-100 border-amber-300'
                    }`}>
                      {order.payment_status === 'approved' ? 'Admin Verified' : 'Awaiting Payment Approval'}
                    </span>
                  </div>
                  
                  {/* Interactive Fulfillment Stage Pills */}
                  <div className="grid grid-cols-4 gap-1 text-center">
                    <button
                      type="button"
                      onClick={() => onUpdateOrderStage?.(order.id, 'pending')}
                      className={`p-1.5 rounded-lg text-[9px] font-extrabold transition-all border cursor-pointer active:scale-95 ${
                        order.payment_status === 'approved' 
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs' 
                          : 'bg-amber-500 text-slate-950 border-amber-400 shadow-2xs animate-pulse'
                      }`}
                    >
                      {order.payment_status === 'approved' ? '1. Paid ✅' : '1. POP Pending ⏳'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateOrderStage?.(order.id, 'packing')}
                      className={`p-1.5 rounded-lg text-[9px] font-extrabold transition-all border cursor-pointer active:scale-95 ${
                        step >= 2 ? 'bg-[#D4AF37] text-slate-950 border-amber-400 shadow-2xs' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-amber-50'
                      }`}
                    >
                      2. Packing
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateOrderStage?.(order.id, 'in_transit')}
                      className={`p-1.5 rounded-lg text-[9px] font-extrabold transition-all border cursor-pointer active:scale-95 ${
                        step >= 3 ? 'bg-[#D4AF37] text-slate-950 border-amber-400 shadow-2xs' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-amber-50'
                      }`}
                    >
                      3. In Transit
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateOrderStage?.(order.id, 'delivered')}
                      className={`p-1.5 rounded-lg text-[9px] font-extrabold transition-all border cursor-pointer active:scale-95 ${
                        step >= 4 ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-emerald-50'
                      }`}
                    >
                      4. Delivered
                    </button>
                  </div>
                </div>

                {/* Waybill & Courier Tracking info */}
                {order.courier_name && order.waybill_number && (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#8B6508]" />
                        <div>
                          <p className="font-bold text-slate-900">{order.courier_name}</p>
                          <p className="text-[10px] text-slate-500 font-mono font-bold">Waybill #: {order.waybill_number}</p>
                        </div>
                      </div>
                      <a
                        href={order.waybill_url || `https://www.google.com/search?q=${encodeURIComponent(order.courier_name + ' track ' + order.waybill_number)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-[#D4AF37] text-slate-950 border border-amber-400 rounded-lg text-[10px] font-extrabold flex items-center gap-1 hover:bg-amber-400 shadow-2xs transition-colors"
                      >
                        <span>Track</span>
                        <ExternalLink className="w-3 h-3 text-slate-950" />
                      </a>
                    </div>

                    {/* Inline Waybill Link Editor */}
                    {editingUrlOrderId === order.id ? (
                      <div className="flex items-center gap-1.5 pt-1">
                        <input
                          type="url"
                          placeholder="Paste Waybill Link URL..."
                          value={tempUrlInput}
                          onChange={(e) => setTempUrlInput(e.target.value)}
                          className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded-lg text-[10px] font-mono text-slate-900 focus:outline-none focus:border-[#D4AF37]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (onUpdateWaybillUrl && tempUrlInput.trim()) {
                              onUpdateWaybillUrl(order.id, tempUrlInput.trim());
                            }
                            setEditingUrlOrderId(null);
                          }}
                          className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-0.5"
                        >
                          <Check className="w-3 h-3" />
                          <span>Save</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5 border-t border-slate-200/60">
                        <span className="font-mono text-slate-600 truncate max-w-[200px]">
                          {order.waybill_url ? order.waybill_url : 'No tracking URL attached'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUrlOrderId(order.id);
                            setTempUrlInput(order.waybill_url || '');
                          }}
                          className="font-bold text-[#8B6508] hover:underline flex items-center gap-0.5"
                        >
                          <LinkIcon className="w-3 h-3" />
                          <span>Edit Link</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => generateOrderInvoicePDF(order, member)}
                    className="flex-1 py-2 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-200"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF Invoice</span>
                  </button>
                  <a
                    href={`https://wa.me/27820000000?text=${encodeURIComponent(`Hi Everglow Support, inquiring about order ${order.order_number}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-emerald-100"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Support</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
