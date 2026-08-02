import { supabase } from './supabase';
import { Product, Promotion, Order, Withdrawal, Profile, Transaction, CommissionSettings } from '../types';

// ----------------------------------------------------
// PRODUCTS SUPABASE CRUD SERVICE
// ----------------------------------------------------
export const fetchProductsFromSupabase = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products from Supabase:', error.message);
      return [];
    }
    return (data || []) as Product[];
  } catch (err) {
    console.error('Error fetching products:', err);
    return [];
  }
};

export const saveProductToSupabase = async (product: Product): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('products')
      .upsert([product]);
    
    if (error) {
      console.error('Supabase error saving product:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to save product to Supabase:', err);
    return false;
  }
};

export const deleteProductFromSupabase = async (productId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    
    if (error) {
      console.error('Supabase error deleting product:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to delete product:', err);
    return false;
  }
};

// ----------------------------------------------------
// PROFILE UPDATE SERVICE
// ----------------------------------------------------
export const updateProfileInSupabase = async (profile: Profile): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        bank_details: profile.bank_details || {},
        shipping_address: profile.shipping_address || {},
      })
      .eq('id', profile.id);

    if (error) {
      console.error('Error updating profile:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to update profile:', err);
    return false;
  }
};

// ----------------------------------------------------
// COMMISSION SETTINGS (Global Bonus Engine)
// ----------------------------------------------------
export const fetchCommissionSettings = async (): Promise<CommissionSettings> => {
  const defaults: CommissionSettings = { id: 'global', level1_bonus: 92, level2_bonus: 10, updated_at: new Date().toISOString() };
  try {
    const { data, error } = await supabase
      .from('commission_settings')
      .select('*')
      .eq('id', 'global')
      .single();
    if (error || !data) return defaults;
    return data as CommissionSettings;
  } catch {
    return defaults;
  }
};

export const saveCommissionSettings = async (settings: CommissionSettings): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('commission_settings')
      .upsert([{ ...settings, updated_at: new Date().toISOString() }]);
    if (error) {
      console.error('Error saving commission settings:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to save commission settings:', err);
    return false;
  }
};

// ----------------------------------------------------
// WITHDRAWALS SUPABASE SERVICE
// ----------------------------------------------------
export const fetchWithdrawalsFromSupabase = async (): Promise<Withdrawal[]> => {
  try {
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching withdrawals:', error.message);
      return [];
    }
    return (data || []) as Withdrawal[];
  } catch (err) {
    console.error('Failed to fetch withdrawals:', err);
    return [];
  }
};

export const updateWithdrawalStatusInSupabase = async (
  withdrawalId: string,
  updates: Partial<Withdrawal>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('withdrawals')
      .update(updates)
      .eq('id', withdrawalId);
    if (error) {
      console.error('Error updating withdrawal:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to update withdrawal:', err);
    return false;
  }
};

export const saveWithdrawalToSupabase = async (withdrawal: Partial<Withdrawal>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('withdrawals')
      .insert([withdrawal]);
    if (error) {
      console.error('Error creating withdrawal in Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to create withdrawal:', err);
    return false;
  }
};

export const updateMemberStatusInSupabase = async (memberId: string, status: 'active' | 'pending_r100'): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', memberId);
    if (error) {
      console.error('Error updating member status:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to update member status:', err);
    return false;
  }
};

export const togglePromotionInSupabase = async (promoId: string, is_active: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('promotions')
      .update({ is_active })
      .eq('id', promoId);
    if (error) {
      console.error('Error toggling promotion in Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to toggle promotion:', err);
    return false;
  }
};

export const updateProductStockInSupabase = async (productId: string, stock_qty: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('products')
      .update({ stock_qty })
      .eq('id', productId);
    if (error) {
      console.error('Error updating stock in Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to update stock:', err);
    return false;
  }
};

// ----------------------------------------------------
// TRANSACTIONS SUPABASE SERVICE
// ----------------------------------------------------
export const fetchTransactionsFromSupabase = async (): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching transactions:', error.message);
      return [];
    }
    return (data || []) as Transaction[];
  } catch (err) {
    console.error('Failed to fetch transactions:', err);
    return [];
  }
};

// ----------------------------------------------------
// PROMOTIONS SUPABASE CRUD SERVICE
// ----------------------------------------------------
export const fetchPromotionsFromSupabase = async (): Promise<Promotion[]> => {
  try {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching promotions from Supabase:', error.message);
      return [];
    }
    return (data || []) as Promotion[];
  } catch (err) {
    console.error('Error fetching promotions:', err);
    return [];
  }
};

export const savePromotionToSupabase = async (promo: Promotion): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('promotions')
      .upsert([promo]);
    
    if (error) {
      console.error('Supabase error saving promotion:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to save promotion:', err);
    return false;
  }
};

export const deletePromotionFromSupabase = async (promoId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', promoId);

    if (error) {
      console.error('Supabase error deleting promotion:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to delete promotion:', err);
    return false;
  }
};

// ----------------------------------------------------
// ORDERS SUPABASE CRUD SERVICE
// ----------------------------------------------------
export const fetchOrdersFromSupabase = async (): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders from Supabase:', error.message);
      return [];
    }
    return (data || []) as Order[];
  } catch (err) {
    console.error('Error fetching orders:', err);
    return [];
  }
};

export const saveOrderToSupabase = async (order: Order): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('orders')
      .upsert([order]);
    
    if (error) {
      console.error('Supabase error saving order:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to save order:', err);
    return false;
  }
};

export const approveOrderInSupabase = async (orderId: string, orderNumber?: string): Promise<boolean> => {
  try {
    // 1. Update by ID
    const { error: directErr } = await supabase
      .from('orders')
      .update({ payment_status: 'approved', fulfillment_status: 'packing' })
      .eq('id', orderId);

    if (directErr && orderNumber) {
      console.warn('Id update failed, retrying order_number update:', directErr.message);
      await supabase
        .from('orders')
        .update({ payment_status: 'approved', fulfillment_status: 'packing' })
        .eq('order_number', orderNumber);
    }

    // 2. Attempt SQL stored procedure for atomic commission calculation & wallet crediting
    const { error: rpcErr } = await supabase.rpc('approve_order_and_credit_commissions', {
      p_order_id: orderId
    });

    if (rpcErr) {
      console.warn('RPC approve_order_and_credit_commissions warning:', rpcErr.message);
    }

    return true;
  } catch (err) {
    console.error('Failed to approve order in Supabase:', err);
    return false;
  }
};

export const updateOrderStatusInSupabase = async (
  orderId: string, 
  updates: Partial<Order>,
  orderNumber?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId);

    if (error && orderNumber) {
      await supabase
        .from('orders')
        .update(updates)
        .eq('order_number', orderNumber);
    }
    return true;
  } catch (err) {
    console.error('Failed to update order status:', err);
    return false;
  }
};

// ----------------------------------------------------
// PROFILES & AUTHENTICATION SUPABASE SERVICE
// ----------------------------------------------------
export const fetchMembersFromSupabase = async (): Promise<Profile[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching members from Supabase:', error.message);
      return [];
    }
    return (data || []) as Profile[];
  } catch (err) {
    console.error('Error fetching members:', err);
    return [];
  }
};

export const fetchProfileFromSupabase = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }
    return data as Profile;
  } catch (err) {
    console.error('Error fetching profile:', err);
    return null;
  }
};

// Recognized admin emails
const ADMIN_EMAILS = [
  'admin@everglowcommunity.co.za',
  'ntebogeng2016@gmail.com'
];

export const signInWithSupabase = async (email: string, pass: string): Promise<{ profile: Profile | null; error: string | null }> => {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const isAdmin = ADMIN_EMAILS.includes(normalizedEmail);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: pass
    });

    if (authError) {
      return { profile: null, error: authError.message };
    }

    if (authData.user) {
      let profile = await fetchProfileFromSupabase(authData.user.id);
      
      if (!profile) {
        // First-time sign-in for newly created Auth user, construct profile in database
        const createdProfile: Profile = {
          id: authData.user.id,
          email: authData.user.email || normalizedEmail,
          full_name: isAdmin ? 'Everglow Master Admin' : (authData.user.user_metadata?.full_name || normalizedEmail.split('@')[0]),
          phone: authData.user.user_metadata?.phone || '',
          sponsor_id: isAdmin ? 'EG-0001' : await generateUniqueSponsorId(),
          upline_id: null,
          role: isAdmin ? 'admin' : 'member',
          status: 'active',
          wallet_balance: 0.00,
          lifetime_earnings: 0.00,
          direct_recruits_count: 0,
          created_at: new Date().toISOString()
        };
        await supabase.from('profiles').upsert([createdProfile]);
        profile = createdProfile;
      } else if (isAdmin && profile.role !== 'admin') {
        profile = { ...profile, role: 'admin', status: 'active' };
        await supabase.from('profiles').update({ role: 'admin', status: 'active' }).eq('id', profile.id);
      }

      return { profile, error: null };
    }

    return { profile: null, error: 'User account not found' };
  } catch (err: any) {
    return { profile: null, error: err.message || 'Authentication failed' };
  }
};

export const generateUniqueSponsorId = async (): Promise<string> => {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('sponsor_id');

    const existingIds = new Set((data || []).map(p => p.sponsor_id));

    // Try generating a 4-digit ID EG-1000 to EG-9999 that doesn't exist yet
    for (let i = 0; i < 100; i++) {
      const candidate = `EG-${Math.floor(1000 + Math.random() * 9000)}`;
      if (!existingIds.has(candidate)) {
        return candidate;
      }
    }

    return `EG-${Date.now().toString().slice(-4)}`;
  } catch (err) {
    return `EG-${Math.floor(1000 + Math.random() * 9000)}`;
  }
};

export const signUpWithSupabase = async (
  email: string,
  pass: string,
  fullName: string,
  phone: string,
  sponsorId: string
): Promise<{ profile: Profile | null; error: string | null }> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
          sponsor_id: sponsorId
        }
      }
    });

    if (authError) {
      return { profile: null, error: authError.message };
    }

    const userId = authData.user?.id || `usr-${Date.now()}`;
    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase().trim());
    const assignedSponsorId = isAdmin ? 'EG-0001' : await generateUniqueSponsorId();

    // Resolve sponsor code to upline's profile UUID and update recruit count
    let uplineUuid: string | null = null;
    if (sponsorId && sponsorId.trim()) {
      const formattedSponsorCode = sponsorId.trim().toUpperCase();
      const { data: sponsorData } = await supabase
        .from('profiles')
        .select('id, direct_recruits_count')
        .eq('sponsor_id', formattedSponsorCode)
        .single();

      if (sponsorData) {
        uplineUuid = sponsorData.id;
        // Increment sponsor's recruit count
        await supabase
          .from('profiles')
          .update({ direct_recruits_count: (sponsorData.direct_recruits_count || 0) + 1 })
          .eq('id', sponsorData.id);
      }
    }

    const newProfile: Profile = {
      id: userId,
      email,
      full_name: fullName || 'New Member',
      phone: phone || '',
      sponsor_id: assignedSponsorId,
      upline_id: uplineUuid,
      role: isAdmin ? 'admin' : 'member',
      status: 'pending_r100',
      wallet_balance: 0.00,
      lifetime_earnings: 0.00,
      direct_recruits_count: 0,
      created_at: new Date().toISOString()
    };

    await supabase.from('profiles').upsert([newProfile]);
    return { profile: newProfile, error: null };
  } catch (err: any) {
    return { profile: null, error: err.message || 'Registration failed' };
  }
};
