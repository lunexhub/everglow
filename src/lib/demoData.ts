import { Product, Profile, Order, Transaction, Withdrawal, Promotion } from '../types';

export const DEMO_ADMIN_PROFILE: Profile = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'admin@everglowcommunity.co.za',
  full_name: 'Everglow Master Admin',
  phone: '+27 82 000 0000',
  sponsor_id: 'EG-MASTER',
  upline_id: null,
  role: 'admin',
  status: 'active',
  wallet_balance: 14500.00,
  lifetime_earnings: 89400.00,
  direct_recruits_count: 24,
  is_demo: true,
  created_at: new Date().toISOString()
};

export const DEMO_MEMBER_PROFILE: Profile = {
  id: '00000000-0000-0000-0000-000000000002',
  email: 'thabo.nkosi@everglowcommunity.co.za',
  full_name: 'Thabo Nkosi',
  phone: '+27 73 456 7890',
  sponsor_id: 'EG-7749',
  upline_id: '00000000-0000-0000-0000-000000000001',
  role: 'member',
  status: 'active',
  wallet_balance: 650.00,
  lifetime_earnings: 2850.00,
  direct_recruits_count: 12,
  bank_details: {
    bank_name: 'Capitec Bank',
    account_number: '1489023412',
    account_type: 'Savings',
    branch_code: '470010'
  },
  shipping_address: {
    street: '142 Jan Smuts Avenue',
    suburb: 'Rosebank',
    city: 'Johannesburg',
    province: 'Gauteng',
    postal_code: '2196'
  },
  is_demo: true,
  created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
};

export const DEMO_DOWNLINE_TREE: Profile[] = [
  // Level 1 Directs
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'nomsa.khumalo@gmail.com',
    full_name: 'Nomsa Khumalo',
    phone: '+27 83 111 2233',
    sponsor_id: 'EG-8812',
    upline_id: '00000000-0000-0000-0000-000000000002',
    role: 'member',
    status: 'active',
    wallet_balance: 450.00,
    lifetime_earnings: 1250.00,
    direct_recruits_count: 3,
    is_demo: true,
    created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'sipho.dlamini@yahoo.com',
    full_name: 'Sipho Dlamini',
    phone: '+27 72 333 4455',
    sponsor_id: 'EG-9034',
    upline_id: '00000000-0000-0000-0000-000000000002',
    role: 'member',
    status: 'active',
    wallet_balance: 800.00,
    lifetime_earnings: 1900.00,
    direct_recruits_count: 5,
    is_demo: true,
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    email: 'zanele.mokoena@outlook.com',
    full_name: 'Zanele Mokoena',
    phone: '+27 81 555 6677',
    sponsor_id: 'EG-5012',
    upline_id: '00000000-0000-0000-0000-000000000002',
    role: 'member',
    status: 'pending_r100',
    wallet_balance: 0.00,
    lifetime_earnings: 0.00,
    direct_recruits_count: 0,
    is_demo: true,
    created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  },
  // Level 2 Indirects
  {
    id: '00000000-0000-0000-0000-000000000006',
    email: 'lerato.petersen@gmail.com',
    full_name: 'Lerato Petersen',
    phone: '+27 84 999 8877',
    sponsor_id: 'EG-6109',
    upline_id: '00000000-0000-0000-0000-000000000003',
    role: 'member',
    status: 'active',
    wallet_balance: 200.00,
    lifetime_earnings: 450.00,
    direct_recruits_count: 1,
    is_demo: true,
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
  }
];

export const DEMO_PRODUCTS: Product[] = [
  {
    id: '22222222-2222-2222-2222-222222222201',
    name: 'Combo A - Starter Beauty Mix',
    pack_size: 10,
    wholesale_price: 1140.00,
    retail_price_unit: 220.00,
    level1_bonus: 140.00,
    level2_bonus: 20.00,
    stock_qty: 50,
    category: 'beauty',
    description: 'Wholesale Beauty Combo: 4x Exfoliating Gel 50g + 6x Serum Glow 100ml.',
    is_combo: true,
    image_url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1608248597261-e4d99435b0ff?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80'
    ],
    combo_items: [
      { product_id: 'prod-001', name: 'Exfoliating Gel 50g', quantity: 4 },
      { product_id: 'prod-002', name: 'Serum Glow 100ml', quantity: 6 }
    ]
  },
  {
    id: '22222222-2222-2222-2222-222222222202',
    name: 'Combo B - Deluxe Skincare & Hair Pack',
    pack_size: 10,
    wholesale_price: 900.00,
    retail_price_unit: 180.00,
    level1_bonus: 100.00,
    level2_bonus: 15.00,
    stock_qty: 35,
    category: 'beauty',
    description: 'Wholesale Skincare Combo: 5x Serum Glow 100ml + 5x Beard & Hairline Oil 50ml.',
    is_combo: true,
    image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1608248597261-e4d99435b0ff?w=500&auto=format&fit=crop&q=80'
    ],
    combo_items: [
      { product_id: 'prod-002', name: 'Serum Glow 100ml', quantity: 5 },
      { product_id: 'prod-003', name: 'Beard & Hairline Oil 50ml', quantity: 5 }
    ]
  },
  {
    id: '22222222-2222-2222-2222-222222222203',
    name: 'Combo C - Hygiene & Home Sanitizer Pack',
    pack_size: 10,
    wholesale_price: 850.00,
    retail_price_unit: 170.00,
    level1_bonus: 90.00,
    level2_bonus: 12.50,
    stock_qty: 60,
    category: 'essentials',
    description: 'Wholesale Hygiene Combo: 6x Hand & Seat Toilet Sanitizer 100ml + 4x Exfoliating Gel 50g.',
    is_combo: true,
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1512290900673-700247215904?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80'
    ],
    combo_items: [
      { product_id: 'prod-004', name: 'Hand & Seat Toilet Sanitizer 100ml', quantity: 6 },
      { product_id: 'prod-001', name: 'Exfoliating Gel 50g', quantity: 4 }
    ]
  },
  {
    id: '22222222-2222-2222-2222-222222222204',
    name: 'Combo D - Royal Everglow Master Kit',
    pack_size: 10,
    wholesale_price: 1250.00,
    retail_price_unit: 240.00,
    level1_bonus: 150.00,
    level2_bonus: 25.00,
    stock_qty: 25,
    category: 'beauty',
    description: 'Wholesale All-in-One Master Combo: 4x Exfoliating Gel + 3x Serum Glow + 3x Beard Oil.',
    is_combo: true,
    image_url: 'https://images.unsplash.com/photo-1608248597261-e4d99435b0ff?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1608248597261-e4d99435b0ff?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80'
    ],
    combo_items: [
      { product_id: 'prod-001', name: 'Exfoliating Gel 50g', quantity: 4 },
      { product_id: 'prod-002', name: 'Serum Glow 100ml', quantity: 3 },
      { product_id: 'prod-003', name: 'Beard & Hairline Oil 50ml', quantity: 3 }
    ]
  }
];

export const DEMO_ORDERS: Order[] = [
  {
    id: '33333333-3333-3333-3333-333333333301',
    order_number: '#EG-8942',
    member_id: '00000000-0000-0000-0000-000000000002',
    items: [
      {
        product_id: '11111111-1111-1111-1111-111111111103',
        product_name: 'Serum Glow 100ml (10-Pack)',
        quantity: 1,
        unit_price: 900.00,
        image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80'
      }
    ],
    total_amount: 900.00,
    payment_status: 'approved',
    fulfillment_status: 'in_transit',
    courier_name: 'The Courier Guy',
    waybill_number: 'TCG-ZA-9912048',
    pop_receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=60',
    is_demo: true,
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: '33333333-3333-3333-3333-333333333302',
    order_number: '#EG-9014',
    member_id: '00000000-0000-0000-0000-000000000002',
    items: [
      {
        product_id: '22222222-2222-2222-2222-222222222201',
        product_name: 'Combo A - Deluxe Glow Kit',
        quantity: 1,
        unit_price: 1140.00,
        image_url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&auto=format&fit=crop&q=80'
      }
    ],
    total_amount: 1140.00,
    payment_status: 'pending',
    fulfillment_status: 'pending',
    pop_receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=60',
    is_demo: true,
    created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  }
];

export const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: '44444444-4444-4444-4444-444444444401',
    member_id: '00000000-0000-0000-0000-000000000002',
    type: 'level1_commission',
    amount: 250.00,
    status: 'credited',
    description: 'Direct 1 Bonus from Nomsa Khumalo (Order #EG-7712)',
    is_demo: true,
    created_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: '44444444-4444-4444-4444-444444444402',
    member_id: '00000000-0000-0000-0000-000000000002',
    type: 'level2_commission',
    amount: 35.00,
    status: 'credited',
    description: 'Direct 2 Bonus from Lerato Petersen (Order #EG-6520)',
    is_demo: true,
    created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
  }
];

export const DEMO_PROMOTIONS: Promotion[] = [
  {
    id: '55555555-5555-5555-5555-555555555501',
    title: '🎉 Women Month Special: FREE Everglow Branded T-Shirt',
    banner_text: 'Spend R1,000+ and get a FREE Premium Everglow Branded Cotton T-Shirt!',
    rule_type: 'spend_threshold',
    min_spend: 1000.00,
    gift_item_name: '1x Everglow Branded T-Shirt',
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80',
    is_active: true,
    start_date: new Date().toISOString(),
    is_demo: true
  }
];
