function getCurrencySymbol(currency) {
    return { INR:'₹', USD:'$', EUR:'€', GBP:'£' }[currency] || currency;
}
function fmt(amount, currency) {
    return `${getCurrencySymbol(currency)}${(amount||0).toLocaleString('en-IN',{minimumFractionDigits:2})}`;
}
function statusColor(status) {
    return {paid:'#16a34a',sent:'#2563eb',draft:'#d97706',cancelled:'#dc2626'}[status]||'#6b7280';
}
function today() {
    return new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
}
function dueStr(dueDate) {
    return dueDate ? new Date(dueDate).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}) : null;
}

const PRINT_BTN = (bg='#16a34a') => `
<div class="no-print" style="text-align:center;padding:20px;background:#f6f8fa;border-top:1px solid #e1e8f0">
  <button onclick="window.print()" style="background:${bg};color:#fff;border:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit">↓ Print / Save as PDF</button>
  <p style="font-size:12px;color:#9ca3af;margin-top:8px">Select "Save as PDF" in print dialog</p>
</div>`

// ── INVOICE TEMPLATE (Professional table - like CFI Excel style) ──
function templateInvoice(doc, biz) {
    const cur = doc.currency||'INR'
    const client = doc.clientInfo||{}
    const due = dueStr(doc.dueDate)
    const items = (doc.lineItems||[]).map((item,i)=>`
    <tr style="background:${i%2===0?'#fff':'#f8fafc'}">
      <td style="padding:11px 14px;border:1px solid #e2e8f0;font-size:13px;color:#111827">${item.description}</td>
      <td style="padding:11px 14px;border:1px solid #e2e8f0;font-size:13px;text-align:center;color:#374151">${item.quantity}</td>
      <td style="padding:11px 14px;border:1px solid #e2e8f0;font-size:13px;text-align:right;color:#374151">${fmt(item.rate,cur)}</td>
      <td style="padding:11px 14px;border:1px solid #e2e8f0;font-size:13px;font-weight:700;text-align:right;color:#1e3a5f">${fmt(item.amount,cur)}</td>
    </tr>`).join('')
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{max-width:794px;margin:0 auto;padding:0}@media print{.no-print{display:none}}</style>
</head><body>
<div class="page">
  <!-- Header -->
  <div style="background:#1e3a5f;padding:0">
    <div style="display:flex;justify-content:space-between;align-items:stretch">
      <div style="padding:32px 40px;flex:1">
        <div style="font-size:26px;font-weight:800;color:#fff;letter-spacing:-0.5px">${biz.companyName||'My Business'}</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.65);margin-top:6px;line-height:1.8">${biz.address||''}</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.65)">${[biz.phone,biz.email].filter(Boolean).join(' · ')}</div>
        ${biz.taxId?`<div style="font-size:12px;color:rgba(255,255,255,0.65)">GSTIN: ${biz.taxId}</div>`:''}
      </div>
      <div style="background:#16a34a;padding:32px 40px;text-align:right;min-width:200px;display:flex;flex-direction:column;justify-content:center">
        <div style="font-size:32px;font-weight:900;color:#fff;letter-spacing:2px">INVOICE</div>
        <div style="font-size:14px;color:rgba(255,255,255,0.85);margin-top:4px">${doc.documentNumber}</div>
        <div style="margin-top:8px;display:inline-block;padding:3px 12px;background:rgba(255,255,255,0.2);color:#fff;border-radius:20px;font-size:10px;font-weight:700;text-transform:uppercase">${doc.status||'draft'}</div>
      </div>
    </div>
  </div>

  <!-- Bill To + Dates -->
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;border-bottom:3px solid #1e3a5f">
    <div style="padding:20px 24px;border-right:1px solid #e2e8f0">
      <div style="font-size:10px;font-weight:700;color:#1e3a5f;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px">Bill To</div>
      <div style="font-size:15px;font-weight:700;color:#111827">${client.name||''}</div>
      ${client.company?`<div style="font-size:12px;color:#6b7280;margin-top:2px">${client.company}</div>`:''}
      <div style="font-size:12px;color:#9ca3af;margin-top:5px;line-height:1.7">${[client.address,client.phone,client.email].filter(Boolean).join('<br>')}</div>
    </div>
    <div style="padding:20px 24px;border-right:1px solid #e2e8f0">
      <div style="font-size:10px;font-weight:700;color:#1e3a5f;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px">Invoice Date</div>
      <div style="font-size:13px;font-weight:600;color:#111827">${today()}</div>
      ${due?`<div style="margin-top:12px"><div style="font-size:10px;font-weight:700;color:#d97706;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px">Due Date</div><div style="font-size:13px;font-weight:600;color:#d97706">${due}</div></div>`:''}
    </div>
    <div style="padding:20px 24px;background:#f8fafc">
      <div style="font-size:10px;font-weight:700;color:#1e3a5f;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px">Amount Due</div>
      <div style="font-size:26px;font-weight:900;color:#16a34a">${fmt(doc.total,cur)}</div>
      ${client.gstin?`<div style="font-size:11px;color:#9ca3af;margin-top:6px">Client GSTIN: ${client.gstin}</div>`:''}
    </div>
  </div>

  <!-- Table -->
  <div style="padding:24px 24px 0">
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr style="background:#1e3a5f">
          <th style="padding:11px 14px;text-align:left;font-size:10px;font-weight:700;color:#fff;letter-spacing:1px">DESCRIPTION</th>
          <th style="padding:11px 14px;text-align:center;font-size:10px;font-weight:700;color:#fff;width:70px">QTY</th>
          <th style="padding:11px 14px;text-align:right;font-size:10px;font-weight:700;color:#fff;width:120px">RATE</th>
          <th style="padding:11px 14px;text-align:right;font-size:10px;font-weight:700;color:#fff;width:130px">AMOUNT</th>
        </tr>
      </thead>
      <tbody>${items}</tbody>
    </table>
  </div>

  <!-- Totals -->
  <div style="display:flex;justify-content:space-between;padding:20px 24px 24px;gap:24px">
    <div style="flex:1">
      ${doc.notes?`<div style="margin-bottom:12px"><div style="font-size:10px;font-weight:700;color:#1e3a5f;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px">Notes</div><div style="font-size:12px;color:#6b7280;line-height:1.8;background:#f8fafc;padding:10px 14px;border-radius:6px;border-left:3px solid #16a34a">${doc.notes}</div></div>`:''}
      ${doc.terms?`<div><div style="font-size:10px;font-weight:700;color:#1e3a5f;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px">Terms & Conditions</div><div style="font-size:12px;color:#6b7280;line-height:1.8">${doc.terms}</div></div>`:''}
    </div>
    <div style="width:260px;flex-shrink:0">
      <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
        <tr><td style="padding:9px 14px;font-size:13px;color:#6b7280;border-bottom:1px solid #e2e8f0">Subtotal</td><td style="padding:9px 14px;font-size:13px;text-align:right;border-bottom:1px solid #e2e8f0">${fmt(doc.subtotal,cur)}</td></tr>
        ${doc.discount?`<tr><td style="padding:9px 14px;font-size:13px;color:#6b7280;border-bottom:1px solid #e2e8f0">Discount</td><td style="padding:9px 14px;font-size:13px;text-align:right;color:#16a34a;border-bottom:1px solid #e2e8f0">-${fmt(doc.discount,cur)}</td></tr>`:''}
        <tr><td style="padding:9px 14px;font-size:13px;color:#6b7280;border-bottom:1px solid #e2e8f0">GST (${doc.taxRate||18}%)</td><td style="padding:9px 14px;font-size:13px;text-align:right;border-bottom:1px solid #e2e8f0">${fmt(doc.taxAmount,cur)}</td></tr>
        <tr style="background:#1e3a5f"><td style="padding:12px 14px;font-size:14px;font-weight:700;color:#fff">TOTAL DUE</td><td style="padding:12px 14px;font-size:16px;font-weight:900;color:#16a34a;text-align:right">${fmt(doc.total,cur)}</td></tr>
      </table>
      <div style="margin-top:16px;text-align:center;font-size:12px;color:#9ca3af;font-style:italic">Thank you for your business!</div>
    </div>
  </div>

  <div style="background:#1e3a5f;padding:12px 24px;text-align:center">
    <div style="font-size:11px;color:rgba(255,255,255,0.5)">Generated by <strong style="color:#16a34a">InvoiceAI</strong> by CodeWithK · ${biz.companyName||''} · ${today()}</div>
  </div>
</div>
${PRINT_BTN('#1e3a5f')}
</body></html>`
}

// ── QUOTATION TEMPLATE (Green corporate style - like Canva reference) ──
function templateQuotation(doc, biz) {
    const cur = doc.currency||'INR'
    const client = doc.clientInfo||{}
    const due = dueStr(doc.dueDate)
    const items = (doc.lineItems||[]).map((item,i)=>`
    <tr style="background:${i%2===0?'#fff':'#f0fdf4'}">
      <td style="padding:11px 16px;border:1px solid #d1fae5;font-size:13px;color:#111827">${item.description}</td>
      <td style="padding:11px 16px;border:1px solid #d1fae5;font-size:13px;text-align:center;color:#374151">${item.quantity}</td>
      <td style="padding:11px 16px;border:1px solid #d1fae5;font-size:13px;text-align:right;color:#374151">${fmt(item.rate,cur)}</td>
      <td style="padding:11px 16px;border:1px solid #d1fae5;font-size:13px;font-weight:700;text-align:right;color:#16a34a">${fmt(item.amount,cur)}</td>
    </tr>`).join('')
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{max-width:794px;margin:0 auto}@media print{.no-print{display:none}}</style>
</head><body>
<div class="page">
  <!-- Header -->
  <div style="background:#16a34a;padding:36px 40px;display:flex;justify-content:space-between;align-items:center">
    <div>
      <div style="font-size:22px;font-weight:800;color:#fff">${biz.companyName||'My Business'}</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.75);margin-top:4px;line-height:1.7">${biz.address||''}</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.75)">${[biz.phone,biz.email].filter(Boolean).join(' · ')}</div>
      ${biz.taxId?`<div style="font-size:11px;color:rgba(255,255,255,0.75)">GSTIN: ${biz.taxId}</div>`:''}
    </div>
    <div style="text-align:center">
      <div style="font-size:36px;font-weight:900;color:#fff;letter-spacing:3px">QUOTATION</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.8);margin-top:4px">${doc.documentNumber}</div>
    </div>
  </div>

  <!-- Details row -->
  <div style="display:grid;grid-template-columns:1fr 1fr;background:#f0fdf4;border-bottom:2px solid #16a34a">
    <div style="padding:16px 24px;border-right:1px solid #d1fae5">
      <div style="font-size:10px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px">Quotation For</div>
      <div style="font-size:15px;font-weight:700;color:#111827">${client.name||''}</div>
      ${client.company?`<div style="font-size:12px;color:#6b7280;margin-top:2px">${client.company}</div>`:''}
      <div style="font-size:12px;color:#9ca3af;margin-top:4px;line-height:1.7">${[client.address,client.phone,client.email].filter(Boolean).join('<br>')}</div>
    </div>
    <div style="padding:16px 24px;display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div><div style="font-size:10px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Quote Date</div><div style="font-size:13px;font-weight:600;color:#111827">${today()}</div></div>
      ${due?`<div><div style="font-size:10px;font-weight:700;color:#d97706;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Valid Until</div><div style="font-size:13px;font-weight:600;color:#d97706">${due}</div></div>`:''}
      <div><div style="font-size:10px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Quote No.</div><div style="font-size:13px;font-weight:600;color:#111827">${doc.documentNumber}</div></div>
      <div><div style="font-size:10px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Status</div><div style="font-size:11px;font-weight:700;padding:2px 10px;border-radius:20px;background:${statusColor(doc.status)};color:#fff;display:inline-block;text-transform:uppercase">${doc.status||'draft'}</div></div>
    </div>
  </div>

  ${doc.notes?`<div style="margin:16px 24px 0;background:#f0fdf4;border-left:4px solid #16a34a;padding:12px 16px;font-size:12px;color:#374151;border-radius:0 6px 6px 0;line-height:1.6"><strong>Project Description:</strong> ${doc.notes}</div>`:''}

  <!-- Table -->
  <div style="padding:20px 24px 0">
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr style="background:#16a34a">
          <th style="padding:12px 16px;text-align:left;font-size:10px;font-weight:700;color:#fff;letter-spacing:1px">DESCRIPTION</th>
          <th style="padding:12px 16px;text-align:center;font-size:10px;font-weight:700;color:#fff;width:80px">QTY</th>
          <th style="padding:12px 16px;text-align:right;font-size:10px;font-weight:700;color:#fff;width:120px">PRICE</th>
          <th style="padding:12px 16px;text-align:right;font-size:10px;font-weight:700;color:#fff;width:130px">TOTAL</th>
        </tr>
      </thead>
      <tbody>${items}</tbody>
    </table>
  </div>

  <!-- Totals + Terms -->
  <div style="display:flex;justify-content:flex-end;padding:16px 24px">
    <div style="width:260px">
      <div style="display:flex;justify-content:space-between;padding:8px 12px;font-size:13px;color:#6b7280;border-bottom:1px solid #d1fae5"><span>Subtotal</span><span>${fmt(doc.subtotal,cur)}</span></div>
      ${doc.discount?`<div style="display:flex;justify-content:space-between;padding:8px 12px;font-size:13px;color:#6b7280;border-bottom:1px solid #d1fae5"><span>Discount</span><span style="color:#16a34a">-${fmt(doc.discount,cur)}</span></div>`:''}
      <div style="display:flex;justify-content:space-between;padding:8px 12px;font-size:13px;color:#6b7280;border-bottom:1px solid #d1fae5"><span>GST (${doc.taxRate||18}%)</span><span>${fmt(doc.taxAmount,cur)}</span></div>
      <div style="display:flex;justify-content:space-between;padding:12px;background:#16a34a;font-size:16px;font-weight:900;border-radius:0 0 8px 8px"><span style="color:#fff">TOTAL</span><span style="color:#fff">${fmt(doc.total,cur)}</span></div>
    </div>
  </div>

  <!-- Terms & Signature -->
  <div style="margin:0 24px 24px;padding:20px;background:#f0fdf4;border:1px solid #d1fae5;border-radius:8px">
    <div style="font-size:10px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px">Terms & Conditions</div>
    <div style="font-size:12px;color:#374151;line-height:1.8;margin-bottom:16px">${doc.terms||'Above information is not an invoice and only an estimate of goods/services. Payment will be due prior to provision or delivery of goods/services.'}</div>
    <div style="font-size:11px;font-weight:700;color:#16a34a;text-align:center;margin-bottom:16px;text-transform:uppercase;letter-spacing:1px">Please Confirm Your Acceptance of This Quote</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px">
      <div><div style="border-bottom:2px solid #374151;margin-top:36px"></div><div style="font-size:10px;color:#9ca3af;margin-top:5px;text-align:center">Signature over printed name</div></div>
      <div><div style="border-bottom:2px solid #374151;margin-top:36px"></div><div style="font-size:10px;color:#9ca3af;margin-top:5px;text-align:center">Date signed</div></div>
    </div>
  </div>

  <div style="background:#16a34a;padding:12px 24px;text-align:center">
    <div style="font-size:11px;color:rgba(255,255,255,0.7)">Generated by <strong style="color:#fff">InvoiceAI</strong> by CodeWithK · ${biz.companyName||''} · ${today()}</div>
  </div>
</div>
${PRINT_BTN('#16a34a')}
</body></html>`
}

// ── RECEIPT TEMPLATE (Clean minimal receipt style) ──
function templateReceipt(doc, biz) {
    const cur = doc.currency||'INR'
    const client = doc.clientInfo||{}
    const items = (doc.lineItems||[]).map(item=>`
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed #e2e8f0">
      <span style="font-size:13px;color:#374151;font-weight:500;font-family:'Courier New',monospace;text-transform:uppercase">${item.description}</span>
      <span style="font-size:13px;font-weight:700;color:#111827;font-family:'Courier New',monospace">${fmt(item.amount,cur)}</span>
    </div>`).join('')
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Courier New',Courier,monospace;background:#f5f5f0;-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{max-width:420px;margin:0 auto;padding:20px}@media print{.no-print{display:none}body{background:#fff}}</style>
</head><body>
<div class="page">
  <div style="background:#fff;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.12);padding:32px 28px;position:relative;overflow:hidden">
    <!-- Decorative top -->
    <div style="height:6px;background:repeating-linear-gradient(90deg,#16a34a 0px,#16a34a 12px,transparent 12px,transparent 18px);margin:-32px -28px 24px"></div>

    <!-- Logo/Header -->
    <div style="text-align:center;margin-bottom:20px">
      <div style="font-size:22px;font-weight:900;color:#111827;letter-spacing:2px;text-transform:uppercase">${biz.companyName||'My Business'}</div>
      ${biz.address?`<div style="font-size:11px;color:#9ca3af;margin-top:3px">${biz.address}</div>`:''}
      ${biz.phone?`<div style="font-size:11px;color:#9ca3af">${biz.phone}</div>`:''}
      ${biz.email?`<div style="font-size:11px;color:#9ca3af">${biz.email}</div>`:''}
    </div>

    <div style="border-top:2px dashed #e2e8f0;border-bottom:2px dashed #e2e8f0;padding:10px 0;margin-bottom:16px;text-align:center">
      <div style="font-size:18px;font-weight:900;color:#111827;letter-spacing:4px">RECEIPT</div>
    </div>

    <!-- Receipt details -->
    <div style="display:flex;justify-content:space-between;margin-bottom:6px">
      <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px">Receipt No:</span>
      <span style="font-size:11px;font-weight:700;color:#111827">${doc.documentNumber}</span>
    </div>
    <div style="display:flex;justify-content:space-between;margin-bottom:6px">
      <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px">Date:</span>
      <span style="font-size:11px;font-weight:700;color:#111827">${today()}</span>
    </div>
    ${client.name?`<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px">Customer:</span><span style="font-size:11px;font-weight:700;color:#111827">${client.name}</span></div>`:''}
    ${biz.taxId?`<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px">GSTIN:</span><span style="font-size:11px;font-weight:700;color:#111827">${biz.taxId}</span></div>`:''}

    <div style="border-top:2px dashed #e2e8f0;margin:14px 0"></div>

    <!-- Items -->
    ${items}

    <div style="border-top:2px dashed #e2e8f0;margin:14px 0"></div>

    <!-- Totals -->
    <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;color:#6b7280">
      <span>SUBTOTAL</span><span>${fmt(doc.subtotal,cur)}</span>
    </div>
    ${doc.discount?`<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;color:#16a34a"><span>DISCOUNT</span><span>-${fmt(doc.discount,cur)}</span></div>`:''}
    <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;color:#6b7280">
      <span>GST (${doc.taxRate||18}%)</span><span>${fmt(doc.taxAmount,cur)}</span>
    </div>

    <div style="border-top:3px solid #111827;margin:10px 0;padding-top:10px;display:flex;justify-content:space-between;align-items:baseline">
      <span style="font-size:16px;font-weight:900;letter-spacing:2px;text-transform:uppercase">TOTAL</span>
      <span style="font-size:24px;font-weight:900;color:#16a34a">${fmt(doc.total,cur)}</span>
    </div>

    <!-- Payment status -->
    <div style="text-align:center;margin:16px 0;padding:8px;border:2px solid ${statusColor(doc.status)};border-radius:4px">
      <span style="font-size:14px;font-weight:900;color:${statusColor(doc.status)};letter-spacing:3px;text-transform:uppercase">${doc.status==='paid'?'✓ PAID':doc.status==='draft'?'DRAFT':doc.status?.toUpperCase()}</span>
    </div>

    ${doc.notes?`<div style="font-size:11px;color:#9ca3af;text-align:center;margin-top:8px;line-height:1.6">${doc.notes}</div>`:''}

    <!-- Footer decoration -->
    <div style="border-top:2px dashed #e2e8f0;margin:16px -28px 0;padding:12px 28px 0;text-align:center">
      <div style="font-size:11px;color:#9ca3af">Thank you for your business!</div>
      <div style="font-size:10px;color:#d1d5db;margin-top:3px">InvoiceAI by CodeWithK</div>
    </div>

    <!-- Bottom decoration -->
    <div style="height:6px;background:repeating-linear-gradient(90deg,#16a34a 0px,#16a34a 12px,transparent 12px,transparent 18px);margin:12px -28px -32px"></div>
  </div>
</div>
${PRINT_BTN('#16a34a')}
</body></html>`
}

// ── PURCHASE ORDER TEMPLATE (Professional order form) ──
function templatePurchaseOrder(doc, biz) {
    const cur = doc.currency||'INR'
    const client = doc.clientInfo||{}
    const due = dueStr(doc.dueDate)
    const items = (doc.lineItems||[]).map((item,i)=>`
    <tr style="background:${i%2===0?'#fff':'#f8f9fa'}">
      <td style="padding:10px 14px;border:1px solid #dee2e6;font-size:13px;color:#212529">${item.description}</td>
      <td style="padding:10px 14px;border:1px solid #dee2e6;font-size:13px;text-align:center;color:#495057">${item.quantity}</td>
      <td style="padding:10px 14px;border:1px solid #dee2e6;font-size:13px;text-align:right;color:#495057">${fmt(item.rate,cur)}</td>
      <td style="padding:10px 14px;border:1px solid #dee2e6;font-size:13px;font-weight:700;text-align:right;color:#212529">${fmt(item.amount,cur)}</td>
    </tr>`).join('')
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,'Helvetica Neue',sans-serif;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{max-width:794px;margin:0 auto;padding:0}@media print{.no-print{display:none}}</style>
</head><body>
<div class="page">
  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:32px 40px 20px;border-bottom:3px solid #212529">
    <div>
      <div style="font-size:24px;font-weight:800;color:#212529;letter-spacing:-0.5px">${biz.companyName||'My Business'}</div>
      <div style="font-size:12px;color:#6c757d;margin-top:5px;line-height:1.8">${biz.address||''}</div>
      <div style="font-size:12px;color:#6c757d">${[biz.phone,biz.email].filter(Boolean).join(' · ')}</div>
      ${biz.taxId?`<div style="font-size:12px;color:#6c757d">GSTIN: ${biz.taxId}</div>`:''}
    </div>
    <div style="text-align:right">
      <div style="font-size:28px;font-weight:900;color:#212529;letter-spacing:2px;text-transform:uppercase">ORDER FORM</div>
      <div style="font-size:13px;color:#6c757d;margin-top:4px">No: ${doc.documentNumber}</div>
      <div style="font-size:13px;color:#6c757d;margin-top:2px">Date: ${today()}</div>
      ${due?`<div style="font-size:13px;color:#6c757d;margin-top:2px">Delivery By: ${due}</div>`:''}
    </div>
  </div>

  <!-- Vendor + Bill To -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;border-bottom:1px solid #dee2e6">
    <div style="padding:20px 40px;border-right:1px solid #dee2e6">
      <div style="font-size:10px;font-weight:700;color:#212529;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #212529;padding-bottom:4px;margin-bottom:10px">Vendor / Supplier</div>
      <div style="font-size:14px;font-weight:700;color:#212529">${client.name||''}</div>
      ${client.company?`<div style="font-size:12px;color:#6c757d;margin-top:2px;font-style:italic">${client.company}</div>`:''}
      <div style="font-size:12px;color:#6c757d;margin-top:5px;line-height:1.8">${[client.address,client.phone,client.email].filter(Boolean).join('<br>')}</div>
    </div>
    <div style="padding:20px 40px">
      <div style="font-size:10px;font-weight:700;color:#212529;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #212529;padding-bottom:4px;margin-bottom:10px">Ship To / Bill To</div>
      <div style="font-size:14px;font-weight:700;color:#212529">${biz.companyName||''}</div>
      <div style="font-size:12px;color:#6c757d;margin-top:5px;line-height:1.8">${biz.address||''}</div>
      <div style="font-size:12px;color:#6c757d">${[biz.phone,biz.email].filter(Boolean).join(' · ')}</div>
    </div>
  </div>

  <!-- Table -->
  <div style="padding:20px 40px 0">
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr style="background:#212529">
          <th style="padding:10px 14px;text-align:left;font-size:10px;font-weight:700;color:#fff;letter-spacing:1px">ITEM / DESCRIPTION</th>
          <th style="padding:10px 14px;text-align:center;font-size:10px;font-weight:700;color:#fff;width:70px">QTY</th>
          <th style="padding:10px 14px;text-align:right;font-size:10px;font-weight:700;color:#fff;width:120px">UNIT PRICE</th>
          <th style="padding:10px 14px;text-align:right;font-size:10px;font-weight:700;color:#fff;width:130px">TOTAL</th>
        </tr>
      </thead>
      <tbody>${items}</tbody>
    </table>
  </div>

  <!-- Totals + Notes -->
  <div style="display:flex;justify-content:space-between;padding:20px 40px;gap:24px">
    <div style="flex:1">
      ${doc.notes?`<div style="margin-bottom:14px"><div style="font-size:10px;font-weight:700;color:#212529;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #dee2e6;padding-bottom:4px;margin-bottom:8px">Notes / Comments</div><div style="font-size:12px;color:#6c757d;line-height:1.8">${doc.notes}</div></div>`:''}
      ${doc.terms?`<div><div style="font-size:10px;font-weight:700;color:#212529;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #dee2e6;padding-bottom:4px;margin-bottom:8px">Terms & Conditions</div><div style="font-size:12px;color:#6c757d;line-height:1.8">${doc.terms}</div></div>`:''}

      <!-- Signatures -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-top:24px">
        <div><div style="border-bottom:1.5px solid #212529;margin-top:36px"></div><div style="font-size:9px;color:#9ca3af;margin-top:5px;text-transform:uppercase;letter-spacing:0.5px;text-align:center">Authorized Signature / Date</div></div>
        <div><div style="border-bottom:1.5px solid #212529;margin-top:36px"></div><div style="font-size:9px;color:#9ca3af;margin-top:5px;text-transform:uppercase;letter-spacing:0.5px;text-align:center">Received By / Date</div></div>
      </div>
    </div>
    <div style="width:240px;flex-shrink:0">
      <table style="width:100%;border-collapse:collapse;border:1px solid #dee2e6">
        <tr><td style="padding:8px 12px;font-size:12px;color:#6c757d;border-bottom:1px solid #dee2e6">SUBTOTAL</td><td style="padding:8px 12px;font-size:12px;text-align:right;border-bottom:1px solid #dee2e6">${fmt(doc.subtotal,cur)}</td></tr>
        ${doc.discount?`<tr><td style="padding:8px 12px;font-size:12px;color:#6c757d;border-bottom:1px solid #dee2e6">DISCOUNTS</td><td style="padding:8px 12px;font-size:12px;text-align:right;border-bottom:1px solid #dee2e6">-${fmt(doc.discount,cur)}</td></tr>`:''}
        <tr><td style="padding:8px 12px;font-size:12px;color:#6c757d;border-bottom:1px solid #dee2e6">TAX RATE</td><td style="padding:8px 12px;font-size:12px;text-align:right;border-bottom:1px solid #dee2e6">${doc.taxRate||18}%</td></tr>
        <tr><td style="padding:8px 12px;font-size:12px;color:#6c757d;border-bottom:1px solid #dee2e6">TAX AMOUNT</td><td style="padding:8px 12px;font-size:12px;text-align:right;border-bottom:1px solid #dee2e6">${fmt(doc.taxAmount,cur)}</td></tr>
        <tr style="background:#212529"><td style="padding:10px 12px;font-size:14px;font-weight:700;color:#fff">GRAND TOTAL</td><td style="padding:10px 12px;font-size:14px;font-weight:900;color:#fff;text-align:right">${fmt(doc.total,cur)}</td></tr>
      </table>
    </div>
  </div>

  <div style="background:#212529;padding:12px 40px;text-align:center;margin-top:8px">
    <div style="font-size:11px;color:rgba(255,255,255,0.5)">Generated by <strong style="color:#fff">InvoiceAI</strong> by CodeWithK · ${biz.companyName||''} · ${today()}</div>
  </div>
</div>
${PRINT_BTN('#212529')}
</body></html>`
}

// ── CUSTOM FORM TEMPLATE (Elegant order form - like Liceria & Co reference) ──
function templateCustomForm(doc, biz) {
    const sections = (doc.lineItems||[])
    const fld = (label, type='line') => {
        if(type==='box') return `<div style="margin-bottom:16px"><div style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px">${label}</div><div style="border:1px solid #d1d5db;border-radius:4px;min-height:64px;padding:8px"></div></div>`
        if(type==='check') return `<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px"><div style="width:14px;height:14px;border:1.5px solid #374151;border-radius:2px;flex-shrink:0;margin-top:1px"></div><div style="font-size:12px;color:#374151">${label}</div></div>`
        if(type==='upload') return `<div style="margin-bottom:16px"><div style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px">${label}</div><div style="border:2px dashed #9ca3af;border-radius:6px;padding:16px;text-align:center;color:#9ca3af;font-size:12px">📎 Attach Document Here</div></div>`
        return `<div style="margin-bottom:16px"><div style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px">${label}</div><div style="border-bottom:1.5px solid #d1d5db;min-height:28px;padding:4px 0"></div></div>`
    }

    const secHTML = sections.map(s => {
        const d = s.description.toLowerCase()
        const title = s.description.split('–')[0].split(':')[0].trim()
        let fields = ''
        if(d.includes('personal')||d.includes('detail')||d.includes('contact')||d.includes('customer')) {
            fields += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">${fld('Full Name')}${fld('Date')}</div>${fld('Phone Number')}${fld('Email Address')}${fld('Address','box')}`
        }
        if(d.includes('service')||d.includes('project')||d.includes('requirement')||d.includes('item')) {
            fields += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">${fld('Item / Service')}${fld('Quantity')}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">${fld('Price (₹)')}${fld('Total (₹)')}</div>${fld('Additional Notes','box')}`
        }
        if(d.includes('upload')||d.includes('document')) {
            fields += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">${fld('Primary Document','upload')}${fld('Supporting Document','upload')}</div>`
        }
        if(d.includes('signature')||d.includes('declaration')||d.includes('agreement')) {
            fields += fld('I agree to the Terms and Conditions','check')+fld('All information provided is accurate and complete','check')+`<div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:20px"><div><div style="border-bottom:1.5px solid #111827;margin-top:40px"></div><div style="font-size:9px;color:#9ca3af;margin-top:5px;text-align:center;text-transform:uppercase;letter-spacing:0.5px">Signature</div></div><div><div style="border-bottom:1.5px solid #111827;margin-top:40px"></div><div style="font-size:9px;color:#9ca3af;margin-top:5px;text-align:center;text-transform:uppercase;letter-spacing:0.5px">Date</div></div></div>`
        }
        if(!fields) fields = fld('Details','box')
        return `<div style="margin-bottom:24px;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden"><div style="background:#111827;padding:10px 18px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#fff">${title}</div><div style="padding:18px">${fields}</div></div>`
    }).join('')

    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{max-width:680px;margin:0 auto;padding:48px 40px}@media print{.no-print{display:none}}</style>
</head><body>
<div class="page">
  <!-- Elegant header like Liceria & Co -->
  <div style="text-align:center;margin-bottom:32px">
    <div style="font-size:11px;font-weight:700;color:#9ca3af;letter-spacing:4px;text-transform:uppercase;margin-bottom:8px">${biz.companyName||'My Business'}</div>
    <div style="font-size:28px;font-weight:800;color:#111827;letter-spacing:4px;text-transform:uppercase;margin-bottom:6px">${doc.title||'FORM'}</div>
    <div style="width:80px;height:2px;background:#111827;margin:0 auto 10px"></div>
    <div style="font-size:11px;color:#9ca3af">No: ${doc.documentNumber} · ${today()}</div>
  </div>

  <!-- Business + Customer row -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px;padding:16px;border:1px solid #e5e7eb;border-radius:6px">
    <div>
      <div style="font-size:9px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px">From</div>
      <div style="font-size:13px;font-weight:700;color:#111827">${biz.companyName||''}</div>
      <div style="font-size:11px;color:#6b7280;margin-top:3px;line-height:1.7">${biz.address||''}</div>
      <div style="font-size:11px;color:#6b7280">${[biz.phone,biz.email].filter(Boolean).join(' · ')}</div>
    </div>
    <div>
      <div style="font-size:9px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px">Customer</div>
      <div style="font-size:13px;font-weight:700;color:#111827">${doc.clientInfo?.name||'_______________'}</div>
      <div style="font-size:11px;color:#6b7280;margin-top:3px">Phone: ${doc.clientInfo?.phone||'_______________'}</div>
      <div style="font-size:11px;color:#6b7280">Email: ${doc.clientInfo?.email||'_______________'}</div>
    </div>
  </div>

  ${doc.notes?`<div style="background:#f9fafb;border-left:3px solid #111827;padding:12px 16px;margin-bottom:24px;font-size:12px;color:#374151;border-radius:0 6px 6px 0;line-height:1.7"><strong>Instructions:</strong> ${doc.notes}</div>`:''}

  ${secHTML}

  <!-- Footer totals if applicable -->
  ${doc.total>0?`<div style="border-top:2px solid #111827;padding-top:16px;display:flex;justify-content:space-between;margin-top:8px"><div style="font-size:11px;color:#6b7280"><div>SUBTOTAL: ${fmt(doc.subtotal,cur)}</div><div>TAX (${doc.taxRate||18}%): ${fmt(doc.taxAmount,cur)}</div></div><div style="text-align:right"><div style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px">Grand Total</div><div style="font-size:22px;font-weight:900;color:#111827">${fmt(doc.total,cur)}</div></div></div>`:''}

  <div style="border-top:1px solid #e5e7eb;margin-top:24px;padding-top:12px;text-align:center">
    <div style="font-size:10px;color:#9ca3af">${biz.address||''}</div>
    <div style="font-size:10px;color:#d1d5db;margin-top:3px">${[biz.phone,biz.email,biz.taxId?'GSTIN: '+biz.taxId:''].filter(Boolean).join(' · ')}</div>
    <div style="font-size:10px;color:#e5e7eb;margin-top:3px">Generated by InvoiceAI by CodeWithK</div>
  </div>
</div>
${PRINT_BTN('#111827')}
</body></html>`
}

// ── MODERN (default fallback) ──
function templateModern(doc, biz) {
    const cur = doc.currency||'INR'
    const client = doc.clientInfo||{}
    const due = dueStr(doc.dueDate)
    const items = (doc.lineItems||[]).map(item=>`
    <tr>
      <td style="padding:11px 14px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#111827;font-weight:500">${item.description}</td>
      <td style="padding:11px 14px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#6b7280;text-align:center">${item.quantity}</td>
      <td style="padding:11px 14px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#6b7280;text-align:right">${fmt(item.rate,cur)}</td>
      <td style="padding:11px 14px;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:700;color:#16a34a;text-align:right">${fmt(item.amount,cur)}</td>
    </tr>`).join('')
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{max-width:794px;margin:0 auto;padding:48px}@media print{.no-print{display:none}.page{padding:36px}}</style>
</head><body><div class="page">
<div style="height:4px;background:linear-gradient(90deg,#16a34a,#22c55e);border-radius:2px;margin-bottom:36px"></div>
<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px">
  <div>
    <div style="font-size:24px;font-weight:800;color:#111827">${biz.companyName||'My Business'}</div>
    <div style="font-size:12px;color:#9ca3af;margin-top:4px;line-height:1.7">${biz.address||''}</div>
    <div style="font-size:12px;color:#9ca3af">${[biz.phone,biz.email].filter(Boolean).join(' · ')}</div>
    ${biz.taxId?`<div style="font-size:12px;color:#9ca3af">GST: ${biz.taxId}</div>`:''}
  </div>
  <div style="text-align:right">
    <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;margin-bottom:4px">${(doc.type||'invoice').replace('_',' ').toUpperCase()}</div>
    <div style="font-size:22px;font-weight:800;color:#111827">${doc.documentNumber}</div>
    <div style="margin-top:6px;display:inline-block;padding:3px 12px;background:${statusColor(doc.status)};color:#fff;border-radius:20px;font-size:10px;font-weight:700;text-transform:uppercase">${doc.status||'draft'}</div>
  </div>
</div>
<div style="display:flex;gap:32px;margin-bottom:32px">
  <div style="flex:1;background:#f8fafc;border-radius:12px;padding:18px 20px;border:1px solid #e2e8f0">
    <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9ca3af;margin-bottom:8px">Bill To</div>
    <div style="font-size:15px;font-weight:700;color:#111827">${client.name||''}</div>
    ${client.company?`<div style="font-size:12px;color:#6b7280;margin-top:2px">${client.company}</div>`:''}
    <div style="font-size:12px;color:#9ca3af;margin-top:5px;line-height:1.7">${[client.address,client.phone,client.email].filter(Boolean).join('<br>')}</div>
  </div>
  <div style="display:flex;flex-direction:column;gap:8px;min-width:180px">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 16px">
      <div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#9ca3af">Issue Date</div>
      <div style="font-size:13px;font-weight:600;color:#111827;margin-top:2px">${today()}</div>
    </div>
    ${due?`<div style="background:#fef9c3;border:1px solid #fde68a;border-radius:10px;padding:12px 16px"><div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#92400e">Due Date</div><div style="font-size:13px;font-weight:600;color:#92400e;margin-top:2px">${due}</div></div>`:''}
  </div>
</div>
<table style="width:100%;border-collapse:collapse;margin-bottom:24px">
  <thead><tr style="background:#111827">
    <th style="padding:11px 14px;text-align:left;font-size:10px;color:#fff;border-radius:8px 0 0 8px">DESCRIPTION</th>
    <th style="padding:11px 14px;text-align:center;font-size:10px;color:#fff;width:70px">QTY</th>
    <th style="padding:11px 14px;text-align:right;font-size:10px;color:#fff;width:110px">RATE</th>
    <th style="padding:11px 14px;text-align:right;font-size:10px;color:#fff;width:110px;border-radius:0 8px 8px 0">AMOUNT</th>
  </tr></thead>
  <tbody>${items}</tbody>
</table>
<div style="display:flex;justify-content:flex-end;margin-bottom:28px">
  <div style="width:240px">
    <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #f1f5f9;font-size:13px"><span style="color:#6b7280">Subtotal</span><span>${fmt(doc.subtotal,cur)}</span></div>
    ${doc.discount?`<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #f1f5f9;font-size:13px"><span style="color:#6b7280">Discount</span><span style="color:#16a34a">-${fmt(doc.discount,cur)}</span></div>`:''}
    <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #f1f5f9;font-size:13px"><span style="color:#6b7280">GST (${doc.taxRate||18}%)</span><span>${fmt(doc.taxAmount,cur)}</span></div>
    <div style="background:#16a34a;border-radius:10px;padding:13px 16px;margin-top:10px;display:flex;justify-content:space-between">
      <span style="color:rgba(255,255,255,0.85);font-size:11px;font-weight:700;text-transform:uppercase">Total Due</span>
      <span style="color:#fff;font-size:20px;font-weight:800">${fmt(doc.total,cur)}</span>
    </div>
  </div>
</div>
${(doc.notes||doc.terms)?`<div style="display:flex;gap:20px;margin-bottom:28px">${doc.notes?`<div style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 18px"><div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:6px">Notes</div><div style="font-size:12px;color:#6b7280;line-height:1.7">${doc.notes}</div></div>`:''}${doc.terms?`<div style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 18px"><div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:6px">Terms</div><div style="font-size:12px;color:#6b7280;line-height:1.7">${doc.terms}</div></div>`:''}</div>`:''}
<div style="text-align:center;padding-top:20px;border-top:1px solid #f1f5f9;font-size:11px;color:#d1d5db">
  Generated by <strong style="color:#16a34a">InvoiceAI</strong> · ${biz.companyName||''} · ${today()}
</div>
</div>
${PRINT_BTN()}
</body></html>`
}

// ── MAIN FUNCTION — auto-select template by document type ──
function generateInvoiceHTML(document, businessInfo, template='auto') {
    const biz = businessInfo || {}
    const docType = document.type || 'invoice'

    // Auto-select template based on document type
    if(template === 'auto' || template === 'modern') {
        switch(docType) {
            case 'invoice':        return templateInvoice(document, biz)
            case 'quotation':      return templateQuotation(document, biz)
            case 'receipt':        return templateReceipt(document, biz)
            case 'purchase_order': return templatePurchaseOrder(document, biz)
            case 'custom_form':    return templateCustomForm(document, biz)
            default:               return templateModern(document, biz)
        }
    }

    // Manual template selection
    switch(template) {
        case 'invoice':        return templateInvoice(document, biz)
        case 'quotation':      return templateQuotation(document, biz)
        case 'receipt':        return templateReceipt(document, biz)
        case 'purchase_order': return templatePurchaseOrder(document, biz)
        case 'custom_form':    return templateCustomForm(document, biz)
        case 'classic':        return templateModern(document, biz)
        case 'minimal':        return templateModern(document, biz)
        case 'bold':           return templateModern(document, biz)
        default:               return templateModern(document, biz)
    }
}

module.exports = { generateInvoiceHTML }