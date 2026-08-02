import { jsPDF } from 'jspdf';
import { Order, Profile, Transaction } from '../types';

/**
 * Format currency to South African Rand (R) with commas
 */
const formatZAR = (amount: number): string => {
  return 'R ' + amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * GENERATE MODERN ORDER INVOICE PDF
 */
export const generateOrderInvoicePDF = (order: Order, member: Profile) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // Brand Header Banner (Luxury Blush Pink & Deep Slate)
  doc.setFillColor(255, 241, 245); // Blush Pink (#FFF1F5)
  doc.rect(0, 0, 210, 46, 'F');

  // Gold Top Border Strip
  doc.setFillColor(212, 175, 55); // Warm Gold (#D4AF37)
  doc.rect(0, 0, 210, 4, 'F');

  // Brand Title & Slogan
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(180, 138, 29); // Rich Gold (#B48A1D)
  doc.text('EVERGLOW COMMUNITY', 14, 19);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85); // Slate-700 High Contrast
  doc.text('Beauty in Every Glow, Clean in Every Home.', 14, 25);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Official Wholesale & Reseller Invoice • VAT Exempt', 14, 30);

  // Document Title & Reference
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // Deep Slate
  doc.text('TAX INVOICE', 196, 19, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(180, 138, 29);
  doc.text(order.order_number, 196, 25, { align: 'right' });

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-ZA')}`, 196, 31, { align: 'right' });

  // Distributor Info Card (Left)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225); // Slate-300
  doc.setLineWidth(0.3);
  doc.roundedRect(14, 50, 88, 38, 3, 3, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(180, 138, 29); // Dark Gold
  doc.text('DISTRIBUTOR / CUSTOMER INFO', 18, 57);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42); // Crisp Dark Slate
  doc.text(member.full_name, 18, 64);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Sponsor ID: ${member.sponsor_id}`, 18, 70);
  doc.text(`Email: ${member.email}`, 18, 76);
  doc.text(`Phone: ${member.phone}`, 18, 82);

  // Fulfillment & Customer Shipping Delivery Address Card (Right)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(108, 50, 88, 38, 3, 3, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(180, 138, 29);
  doc.text('DELIVERY & SHIPPING ADDRESS', 112, 57);

  const street = member.shipping_address?.street || '142 Jan Smuts Avenue, Unit 4';
  const suburbCity = member.shipping_address?.suburb
    ? `${member.shipping_address.suburb}, ${member.shipping_address.city}`
    : 'Rosebank, Johannesburg';
  const provinceCode = member.shipping_address?.province
    ? `${member.shipping_address.province}, ${member.shipping_address.postal_code}`
    : 'Gauteng, 2196';

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(street, 112, 64);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(suburbCity, 112, 70);
  doc.text(provinceCode, 112, 75);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  const waybillText = order.waybill_number
    ? `Waybill #: ${order.waybill_number} (${order.courier_name || 'Courier'})`
    : 'Dispatch: Pending POP Verification';
  doc.text(waybillText, 112, 82);

  // Everglow Official EFT Banking Details Banner
  doc.setFillColor(255, 241, 245); // Blush Tint
  doc.setDrawColor(244, 114, 182); // Pink Border
  doc.roundedRect(14, 92, 182, 16, 3, 3, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(180, 138, 29);
  doc.text('OFFICIAL EVERGLOW BANK DETAILS (EFT PAYMENT REFERENCE)', 18, 98);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Bank: Capitec Bank   |   Account #: 1489023412   |   Branch: 470010   |   Ref: ${order.order_number}`, 18, 104);

  // Items Table Header
  doc.setFillColor(15, 23, 42); // Deep Slate Header (#0F172A)
  doc.rect(14, 113, 182, 9, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('PRODUCT DESCRIPTION', 18, 119);
  doc.text('QTY', 120, 119, { align: 'center' });
  doc.text('UNIT PRICE', 155, 119, { align: 'right' });
  doc.text('TOTAL AMOUNT', 192, 119, { align: 'right' });

  // Items Table Rows
  let y = 129;
  order.items.forEach((item, index) => {
    // Alternating Row Background
    if (index % 2 === 0) {
      doc.setFillColor(250, 245, 247); // Light Blush Tint
      doc.rect(14, y - 6, 182, 9, 'F');
    }

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);

    const title = item.product_name + (item.is_free_gift ? ' [FREE PROMO GIFT]' : '');
    doc.text(title, 18, y);
    doc.text(item.quantity.toString(), 120, y, { align: 'center' });
    doc.text(formatZAR(item.unit_price), 155, y, { align: 'right' });
    doc.text(item.is_free_gift ? 'FREE' : formatZAR(item.quantity * item.unit_price), 192, y, { align: 'right' });

    y += 9;
  });

  // Divider Line
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 196, y);

  // Total Summary Box
  y += 6;
  doc.setFillColor(255, 241, 245);
  doc.roundedRect(120, y, 76, 18, 3, 3, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(180, 138, 29); // Gold-Dark
  doc.text('TOTAL AMOUNT DUE:', 125, y + 11);
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(formatZAR(order.total_amount), 191, y + 11, { align: 'right' });

  // Bottom Footer Notice
  doc.setFontSize(8);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text('Thank you for building your business with Everglow Community South Africa.', 14, 280);
  doc.text('POPIA Compliant • Official System Generated Document', 196, 280, { align: 'right' });

  doc.save(`Invoice_${order.order_number}.pdf`);
};

/**
 * GENERATE MODERN COMMISSION EARNINGS STATEMENT PDF
 */
export const generateEarningsStatementPDF = (member: Profile, transactions: Transaction[]) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // Brand Header Banner (Luxury Blush Pink)
  doc.setFillColor(255, 241, 245);
  doc.rect(0, 0, 210, 48, 'F');

  // Gold Top Border Strip
  doc.setFillColor(212, 175, 55);
  doc.rect(0, 0, 210, 4, 'F');

  // Brand Title & Slogan
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(212, 175, 55);
  doc.text('EVERGLOW COMMUNITY', 14, 20);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Beauty in Every Glow, Clean in Every Home.', 14, 26);

  // Document Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('COMMISSION STATEMENT', 196, 20, { align: 'right' });

  doc.setFontSize(8.5);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-ZA')}`, 196, 26, { align: 'right' });

  // Member & Wallet Summary Cards
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(241, 245, 249);
  doc.roundedRect(14, 54, 88, 32, 3, 3, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(139, 101, 8);
  doc.text('DISTRIBUTOR ACCOUNT', 18, 61);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(member.full_name, 18, 68);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Sponsor ID: ${member.sponsor_id}`, 18, 74);
  doc.text(`Account Role: ${member.role.toUpperCase()}`, 18, 79);

  // Financial Metrics Summary Box (Right)
  doc.setFillColor(255, 241, 245);
  doc.roundedRect(108, 54, 88, 32, 3, 3, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(139, 101, 8);
  doc.text('AVAILABLE WALLET BALANCE', 114, 61);
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(formatZAR(member.wallet_balance), 114, 67);

  doc.setFontSize(8);
  doc.setTextColor(139, 101, 8);
  doc.text('LIFETIME COMMISSIONS EARNED', 114, 75);
  doc.setFontSize(11);
  doc.setTextColor(16, 185, 129); // Emerald Green (#10B981)
  doc.text(formatZAR(member.lifetime_earnings), 114, 81);

  // Table Header
  doc.setFillColor(30, 41, 59);
  doc.rect(14, 94, 182, 9, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('DATE', 18, 100);
  doc.text('CATEGORY', 46, 100);
  doc.text('DESCRIPTION', 88, 100);
  doc.text('AMOUNT', 192, 100, { align: 'right' });

  // Table Rows
  let y = 110;
  transactions.forEach((tx, index) => {
    // Alternating Row Background
    if (index % 2 === 0) {
      doc.setFillColor(250, 245, 247);
      doc.rect(14, y - 6, 182, 9, 'F');
    }

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);

    const dateStr = new Date(tx.created_at).toLocaleDateString('en-ZA');
    const categoryStr = tx.type.replace('_', ' ').toUpperCase();
    const rawDesc = tx.description || '-';

    // Truncate long descriptions cleanly so they NEVER overlap the right-aligned Amount column!
    const truncatedDesc = rawDesc.length > 42 ? rawDesc.substring(0, 40) + '...' : rawDesc;

    doc.text(dateStr, 18, y);
    doc.text(categoryStr, 46, y);
    doc.text(truncatedDesc, 88, y);

    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(139, 101, 8);
    doc.text(formatZAR(tx.amount), 192, y, { align: 'right' });

    y += 9;

    // Page Break handling if transactions exceed page height
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  // Footer
  doc.setFontSize(8);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Everglow Community MLM E-Wallet Audit Ledger.', 14, 280);
  doc.text('POPIA Compliant • Official Financial Document', 196, 280, { align: 'right' });

  doc.save(`Earnings_Statement_${member.sponsor_id}.pdf`);
};
