export interface PrintOrderItem {
  name: string;
  sku?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface PrintOrderData {
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentMethod: string;
  paymentStatus?: string;
  trackingNumber?: string;
  // Shipping
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  postalCode?: string;
  // Financials
  subtotal?: number;
  shippingCost?: number;
  total: number;
  // Items (optional — full detail print only)
  items?: PrintOrderItem[];
}

export function printOrders(orders: PrintOrderData[], storeName = 'Shinara Mall') {
  const fmt = (n: number) => `Rs. ${n.toLocaleString()}`;

  const slips = orders.map(order => `
    <div class="slip">
      <div class="header">
        <div>
          <div class="store-name">${storeName}</div>
          <div class="store-sub">Shipping Slip</div>
        </div>
        <div style="text-align:right">
          <div class="order-number">#${order.orderNumber}</div>
          <div class="meta">${new Date(order.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Ship To</div>
        <div class="ship-name">${order.customerName}</div>
        <div class="ship-detail">${order.address}</div>
        <div class="ship-detail">${order.city}${order.postalCode ? ', ' + order.postalCode : ''}</div>
        <div class="ship-detail">📞 ${order.phone}</div>
        ${order.email ? `<div class="ship-detail">✉ ${order.email}</div>` : ''}
      </div>

      <div class="section badges">
        <span class="badge">${order.status.toUpperCase()}</span>
        <span class="badge">${(order.paymentMethod || '').toUpperCase().replace('_', ' ')}</span>
        ${order.trackingNumber ? `<span class="tracking">Tracking: ${order.trackingNumber}</span>` : ''}
      </div>

      ${order.items && order.items.length > 0 ? `
      <div class="section">
        <div class="section-title">Items</div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th class="center">Qty</th>
              <th class="right">Price</th>
              <th class="right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.name}${item.sku ? `<div class="sku">SKU: ${item.sku}</div>` : ''}</td>
                <td class="center">${item.quantity}</td>
                <td class="right">${fmt(item.price)}</td>
                <td class="right">${fmt(item.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="totals">
          ${order.subtotal !== undefined ? `<div class="totals-row"><span>Subtotal</span><span>${fmt(order.subtotal)}</span></div>` : ''}
          ${order.shippingCost !== undefined && order.shippingCost > 0 ? `<div class="totals-row"><span>Shipping</span><span>${fmt(order.shippingCost)}</span></div>` : ''}
          <div class="totals-row grand"><span>Total</span><span>${fmt(order.total)}</span></div>
        </div>
      </div>
      ` : `
      <div class="section">
        <div class="totals">
          <div class="totals-row grand"><span>Order Total</span><span>${fmt(order.total)}</span></div>
        </div>
      </div>
      `}

      <div class="footer">Thank you for shopping with ${storeName}</div>
    </div>
  `).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Order Slips — ${storeName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #000; background: #fff; }
    .slip {
      width: 148mm;
      margin: 8mm auto;
      padding: 10mm;
      border: 1px solid #bbb;
      page-break-after: always;
    }
    .slip:last-child { page-break-after: avoid; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #000;
      padding-bottom: 7px;
      margin-bottom: 10px;
    }
    .store-name { font-size: 16px; font-weight: bold; }
    .store-sub { font-size: 10px; color: #666; }
    .order-number { font-size: 15px; font-weight: bold; }
    .meta { font-size: 10px; color: #666; }
    .section { margin: 8px 0; }
    .section-title {
      font-size: 9px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #888;
      margin-bottom: 4px;
    }
    .ship-name { font-size: 13px; font-weight: bold; margin-bottom: 2px; }
    .ship-detail { font-size: 11px; color: #333; line-height: 1.6; }
    .badges { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
    .badge {
      display: inline-block;
      padding: 2px 7px;
      border: 1px solid #333;
      border-radius: 3px;
      font-size: 9px;
      font-weight: bold;
    }
    .tracking { font-size: 11px; }
    table { width: 100%; border-collapse: collapse; margin-top: 4px; }
    th {
      font-size: 9px;
      text-transform: uppercase;
      color: #888;
      border-bottom: 1px solid #ccc;
      padding: 4px 3px;
      text-align: left;
    }
    td { font-size: 11px; padding: 4px 3px; border-bottom: 1px solid #eee; vertical-align: top; }
    .sku { font-size: 9px; color: #999; margin-top: 1px; }
    .center { text-align: center; }
    .right { text-align: right; }
    .totals { margin-top: 6px; }
    .totals-row {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      padding: 2px 0;
    }
    .totals-row.grand {
      font-weight: bold;
      font-size: 13px;
      border-top: 1px solid #000;
      padding-top: 4px;
      margin-top: 4px;
    }
    .footer {
      margin-top: 10px;
      font-size: 9px;
      color: #aaa;
      text-align: center;
      border-top: 1px dashed #ddd;
      padding-top: 6px;
    }
    @media print {
      body { background: #fff; }
      .slip { border: none; margin: 0; padding: 8mm; }
    }
  </style>
</head>
<body>${slips}</body>
</html>`;

  const w = window.open('', '_blank', 'width=850,height=700');
  if (!w) {
    alert('Pop-up blocked. Please allow pop-ups for this site and try again.');
    return;
  }
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}
