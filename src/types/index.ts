export type UserRole = 'member' | 'admin';
export type MemberStatus = 'pending_r100' | 'active';
export type OrderPaymentStatus = 'pending' | 'approved' | 'rejected';
export type OrderFulfillmentStatus = 'pending' | 'packing' | 'in_transit' | 'delivered';
export type TransactionType = 'level1_commission' | 'level2_commission' | 'recruitment_bonus' | 'withdrawal';
export type WithdrawalStatus = 'pending' | 'paid' | 'rejected';

export interface BankDetails {
  bank_name: string;
  account_number: string;
  account_type: string;
  branch_code: string;
}

export interface ShippingAddress {
  street: string;
  suburb: string;
  city: string;
  province: string;
  postal_code: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  sponsor_id: string;
  upline_id: string | null;
  role: UserRole;
  status: MemberStatus;
  wallet_balance: number;
  lifetime_earnings: number;
  direct_recruits_count: number;
  bank_details?: BankDetails;
  shipping_address?: ShippingAddress;
  is_demo?: boolean;
  created_at: string;
}

export interface ComboItem {
  product_id: string;
  name: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  pack_size: 5 | 10;
  wholesale_price: number;
  retail_price_unit: number;
  stock_qty: number;
  category: 'beauty' | 'detergents' | 'essentials';
  description: string;
  is_combo: boolean;
  combo_items?: ComboItem[];
  image_url?: string;
  images?: string[]; // Up to 5 product gallery images
  is_demo?: boolean;
  created_at?: string;
}

export interface CommissionSettings {
  id: string;
  level1_bonus: number;   // ZAR: Direct sponsor commission per order
  level2_bonus: number;   // ZAR: Level-2 upline commission per order
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  image_url?: string;
  is_free_gift?: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  member_id: string;
  items: OrderItem[];
  total_amount: number;
  payment_status: OrderPaymentStatus;
  fulfillment_status: OrderFulfillmentStatus;
  courier_name?: string;
  waybill_number?: string;
  waybill_url?: string;
  pop_receipt_url?: string;
  is_demo?: boolean;
  created_at: string;
  member?: Profile;
}

export interface Transaction {
  id: string;
  member_id: string;
  type: TransactionType;
  source_order_id?: string;
  source_member_id?: string;
  amount: number;
  status: 'credited' | 'pending' | 'withdrawn';
  description?: string;
  is_demo?: boolean;
  created_at: string;
}

export interface Withdrawal {
  id: string;
  member_id: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_type: string;
  branch_code: string;
  status: WithdrawalStatus;
  target_payout_date: string;
  rejection_reason?: string;
  is_demo?: boolean;
  created_at: string;
  member?: Profile;
}

export interface Promotion {
  id: string;
  title: string;
  banner_text: string;
  rule_type: 'bogo' | 'spend_threshold';
  min_spend?: number;
  trigger_product_id?: string;
  gift_product_id?: string;
  gift_item_name?: string;
  image_url?: string;
  is_active: boolean;
  start_date: string;
  end_date?: string;
  is_demo?: boolean;
  created_at?: string;
}
