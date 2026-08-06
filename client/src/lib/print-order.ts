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
  trackingNumber?: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  postalCode?: string;
  subtotal?: number;
  shippingCost?: number;
  total: number;
  items?: PrintOrderItem[];
}

const STATUS_COLOR: Record<string, string> = {
  pending:    '#b45309',
  processing: '#1d4ed8',
  shipped:    '#7c3aed',
  delivered:  '#15803d',
  cancelled:  '#b91c1c',
};

const METHOD_LABEL: Record<string, string> = {
  cod:           'Cash on Delivery',
  easypaisa:     'EasyPaisa',
  jazzcash:      'JazzCash',
  hbl:           'HBL Bank',
  bank_transfer: 'Bank Transfer',
  wallet:        'Wallet',
};

function slip(order: PrintOrderData, storeName: string, logoUrl?: string): string {
  const fmt = (n: number) => `Rs.\u00a0${Number(n).toLocaleString()}`;
  const date = new Date(order.createdAt).toLocaleDateString('en-PK', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const statusColor = STATUS_COLOR[order.status] ?? '#374151';
  const methodLabel = METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod?.toUpperCase().replace('_', ' ') ?? '';

  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" alt="${storeName}" style="height:22px;max-width:70px;object-fit:contain;vertical-align:middle;" />`
    : `<span style="font-size:16px;font-weight:800;color:#1e293b;letter-spacing:-0.5px;">${storeName}</span>`;

  const itemsHtml = order.items && order.items.length > 0 ? `
    <div class="label" style="margin-top:5px;">Items Ordered</div>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th class="c">Qty</th>
          <th class="r">Price</th>
          <th class="r">Total</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map(it => `
          <tr>
            <td>${it.name}${it.sku ? `<span class="sku">  ${it.sku}</span>` : ''}</td>
            <td class="c">${it.quantity}</td>
            <td class="r">${fmt(it.price)}</td>
            <td class="r">${fmt(it.total)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="totals">
      ${order.subtotal != null && order.shippingCost != null ? `
        <div class="trow"><span>Subtotal</span><span>${fmt(order.subtotal)}</span></div>
        ${Number(order.shippingCost) > 0 ? `<div class="trow"><span>Shipping</span><span>${fmt(order.shippingCost)}</span></div>` : ''}
      ` : ''}
      <div class="trow grand"><span>Total</span><span>${fmt(order.total)}</span></div>
    </div>
  ` : `
    <div class="totals" style="margin-top:6px;">
      <div class="trow grand"><span>Order Total</span><span>${fmt(order.total)}</span></div>
    </div>
  `;

  return `
    <div class="slip">
      <!-- accent bar -->
      <div style="background:linear-gradient(90deg,#2563eb,#7c3aed);height:3px;margin:-4mm -5mm 4mm;border-radius:1mm 1mm 0 0;"></div>

      <!-- header -->
      <div class="hdr">
        <div>${logoHtml}<div style="font-size:7.5px;color:#64748b;margin-top:1px;">Shipping Slip</div></div>
        <div style="text-align:right;">
          <div style="font-size:13px;font-weight:800;color:#1e293b;letter-spacing:0.2px;">#${order.orderNumber}</div>
          <div style="font-size:8px;color:#64748b;">${date}</div>
        </div>
      </div>

      <!-- ship-to -->
      <div class="card">
        <div class="label">Ship To</div>
        <div style="font-size:11px;font-weight:700;color:#0f172a;margin-bottom:2px;">${order.customerName}</div>
        <div style="font-size:9.5px;color:#374151;line-height:1.55;">
          ${order.address}<br>
          ${order.city}${order.postalCode ? ', ' + order.postalCode : ''}<br>
          ☎ ${order.phone}${order.email ? '<br>✉ ' + order.email : ''}
        </div>
      </div>

      <!-- meta row -->
      <div style="display:flex;gap:6px;margin:4px 0;flex-wrap:wrap;align-items:center;">
        <span style="background:${statusColor}18;color:${statusColor};border:1px solid ${statusColor}40;
          border-radius:3px;padding:1px 6px;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;">
          ${order.status}
        </span>
        <span style="font-size:8.5px;color:#475569;">${methodLabel}</span>
        ${order.trackingNumber ? `<span style="font-size:8.5px;color:#475569;">Tracking: <b>${order.trackingNumber}</b></span>` : ''}
      </div>

      <!-- items / total -->
      ${itemsHtml}

      <!-- footer -->
      <div style="margin-top:auto;padding-top:4px;border-top:1px dashed #cbd5e1;font-size:7.5px;color:#94a3b8;text-align:center;">
        Thank you for shopping with ${storeName}
      </div>
    </div>
  `;
}

export function printOrders(
  orders: PrintOrderData[],
  storeName = 'Shinara Mall',
  logoUrl?: string,
) {
  /* Group into pages of 4 (2 × 2 on A4 landscape) */
  const pages: PrintOrderData[][] = [];
  for (let i = 0; i < orders.length; i += 4) {
    pages.push(orders.slice(i, i + 4));
  }

  const pagesHtml = pages.map(page => `
    <div class="page">
      ${page.map(o => slip(o, storeName, logoUrl)).join('')}
    </div>
  `).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Order Slips — ${storeName}</title>
  <style>
    @page { size: A4 landscape; margin: 6mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #1e293b; }

    .page {
      width: 285mm;
      height: 198mm;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 3mm;
      page-break-after: always;
      break-after: page;
    }
    .page:last-child { page-break-after: avoid; break-after: auto; }

    .slip {
      border: 1px solid #e2e8f0;
      border-radius: 2mm;
      padding: 4mm 5mm;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #fff;
    }

    .hdr {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 4px;
      padding-bottom: 4px;
      border-bottom: 1px solid #e2e8f0;
    }

    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 1.5mm;
      padding: 3mm 4mm;
      margin: 3px 0;
    }

    .label {
      font-size: 7.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .6px;
      color: #94a3b8;
      margin-bottom: 2px;
    }

    table { width: 100%; border-collapse: collapse; margin-top: 2px; font-size: 8.5px; }
    th { font-size: 7px; text-transform: uppercase; color: #94a3b8; border-bottom: 1px solid #e2e8f0; padding: 2px 2px; text-align: left; font-weight: 600; letter-spacing:.3px; }
    td { padding: 2.5px 2px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: top; }
    .c { text-align: center; }
    .r { text-align: right; }
    .sku { font-size: 7px; color: #94a3b8; }

    .totals { margin-top: 3px; }
    .trow { display: flex; justify-content: space-between; font-size: 8.5px; color: #475569; padding: 1.5px 0; }
    .trow.grand { font-weight: 800; font-size: 10px; color: #0f172a; border-top: 1px solid #1e293b; padding-top: 3px; margin-top: 2px; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { box-shadow: none; }
      .slip { border-color: #d1d5db; }
    }
  </style>
</head>
<body>${pagesHtml}</body>
</html>`;

  const w = window.open('', '_blank', 'width=1100,height=800');
  if (!w) {
    alert('Pop-up blocked. Please allow pop-ups for this site and try again.');
    return;
  }
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 500);
}
