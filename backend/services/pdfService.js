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

// ────────────────────────────────────────────────
// TEMPLATE 1 — MODERN (green accent, clean)
// ────────────────────────────────────────────────
function templateModern(doc, biz) {
  const cur = doc.currency||'INR';
  const client = doc.clientInfo||{};
  const due = dueStr(doc.dueDate);
  const items = (doc.lineItems||[]).map(item=>`
    <tr>
      <td style="padding:11px 14px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#111827;font-weight:500">${item.description}</td>
      <td style="padding:11px 14px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#6b7280;text-align:center">${item.quantity}</td>
      <td style="padding:11px 14px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#6b7280;text-align:right">${fmt(item.rate,cur)}</td>
      <td style="padding:11px 14px;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:700;color:#16a34a;text-align:right">${fmt(item.amount,cur)}</td>
    </tr>`).join('');
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{max-width:794px;margin:0 auto;padding:48px}@media print{.no-print{display:none}.page{padding:36px}}</style>
</head><body><div class="page">
<div style="height:4px;background:linear-gradient(90deg,#16a34a,#22c55e);border-radius:2px;margin-bottom:36px"></div>
<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px">
  <div>
    <div style="font-size:24px;font-weight:800;color:#111827;letter-spacing:-0.5px">${biz.companyName||'My Business'}</div>
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
    ${due?`<div style="background:#fef9c3;border:1px solid #fde68a;border-radius:10px;padding:12px 16px"><div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#92400e">Due Date</div><div style="font-size:13px;font-weight:600;color:#92400e;margin-top:2px">${due}</div></div>`:''}
  </div>
</div>
<table style="width:100%;border-collapse:collapse;margin-bottom:24px">
  <thead><tr style="background:#111827">
    <th style="padding:11px 14px;text-align:left;font-size:10px;font-weight:600;color:#fff;letter-spacing:0.5px;border-radius:8px 0 0 8px">DESCRIPTION</th>
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
    <div style="background:#16a34a;border-radius:10px;padding:13px 16px;margin-top:10px;display:flex;justify-content:space-between;align-items:center">
      <span style="color:rgba(255,255,255,0.85);font-size:11px;font-weight:700;text-transform:uppercase">Total Due</span>
      <span style="color:#fff;font-size:20px;font-weight:800">${fmt(doc.total,cur)}</span>
    </div>
  </div>
</div>
${(doc.notes||doc.terms)?`<div style="display:flex;gap:20px;margin-bottom:28px">${doc.notes?`<div style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 18px"><div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#9ca3af;margin-bottom:6px">Notes</div><div style="font-size:12px;color:#6b7280;line-height:1.7">${doc.notes}</div></div>`:''}${doc.terms?`<div style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 18px"><div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#9ca3af;margin-bottom:6px">Terms</div><div style="font-size:12px;color:#6b7280;line-height:1.7">${doc.terms}</div></div>`:''}</div>`:''}
<div style="text-align:center;padding-top:20px;border-top:1px solid #f1f5f9;font-size:11px;color:#d1d5db">
  Generated by <strong style="color:#16a34a">InvoiceAI</strong> · ${biz.companyName||''} · ${today()}
</div>
</div>
<div class="no-print" style="text-align:center;padding:20px;background:#f6f8fa;border-top:1px solid #e1e8f0">
  <button onclick="window.print()" style="background:#16a34a;color:#fff;border:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit">↓ Print / Save as PDF</button>
  <p style="font-size:12px;color:#9ca3af;margin-top:8px">Select "Save as PDF" in print dialog</p>
</div>
</body></html>`;
}

// ────────────────────────────────────────────────
// TEMPLATE 2 — CLASSIC (navy blue, traditional)
// ────────────────────────────────────────────────
function templateClassic(doc, biz) {
  const cur = doc.currency||'INR';
  const client = doc.clientInfo||{};
  const due = dueStr(doc.dueDate);
  const items = (doc.lineItems||[]).map((item,i)=>`
    <tr style="background:${i%2===0?'#fff':'#f8fafc'}">
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#1e293b">${item.description}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:13px;text-align:center;color:#475569">${item.quantity}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:13px;text-align:right;color:#475569">${fmt(item.rate,cur)}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:700;text-align:right;color:#1e3a5f">${fmt(item.amount,cur)}</td>
    </tr>`).join('');
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Georgia,'Times New Roman',serif;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{max-width:794px;margin:0 auto;padding:0}@media print{.no-print{display:none}}</style>
</head><body>
<div style="background:#1e3a5f;padding:32px 48px;display:flex;justify-content:space-between;align-items:center">
  <div>
    <div style="font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.3px">${biz.companyName||'My Business'}</div>
    <div style="font-size:11px;color:rgba(255,255,255,0.65);margin-top:4px;line-height:1.7">${biz.address||''}</div>
    <div style="font-size:11px;color:rgba(255,255,255,0.65)">${[biz.phone,biz.email].filter(Boolean).join(' · ')}</div>
    ${biz.taxId?`<div style="font-size:11px;color:rgba(255,255,255,0.65)">GST: ${biz.taxId}</div>`:''}
  </div>
  <div style="text-align:right">
    <div style="font-size:28px;font-weight:700;color:#fff;letter-spacing:-1px">${(doc.type||'INVOICE').replace('_',' ').toUpperCase()}</div>
    <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:4px">${doc.documentNumber}</div>
    <div style="margin-top:8px;display:inline-block;padding:3px 14px;background:${statusColor(doc.status)};color:#fff;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">${doc.status||'draft'}</div>
  </div>
</div>
<div style="background:#f0f4f8;padding:6px 48px;display:flex;gap:32px">
  <div style="font-size:11px;color:#475569;padding:8px 0"><strong style="color:#1e3a5f">Date:</strong> ${today()}</div>
  ${due?`<div style="font-size:11px;color:#475569;padding:8px 0"><strong style="color:#92400e">Due:</strong> ${due}</div>`:''}
</div>
<div style="padding:28px 48px;display:flex;gap:32px;border-bottom:2px solid #e2e8f0">
  <div style="flex:1">
    <div style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#1e3a5f;border-bottom:2px solid #1e3a5f;padding-bottom:4px;margin-bottom:10px">Bill To</div>
    <div style="font-size:15px;font-weight:700;color:#1e293b">${client.name||''}</div>
    ${client.company?`<div style="font-size:12px;color:#475569;margin-top:2px;font-style:italic">${client.company}</div>`:''}
    <div style="font-size:12px;color:#64748b;margin-top:6px;line-height:1.8">${[client.address,client.phone,client.email].filter(Boolean).join('<br>')}</div>
  </div>
</div>
<div style="padding:0 48px">
  <table style="width:100%;border-collapse:collapse;margin:24px 0">
    <thead><tr style="background:#1e3a5f">
      <th style="padding:11px 14px;text-align:left;font-size:10px;font-weight:600;color:#fff;letter-spacing:1px;font-family:Arial,sans-serif">DESCRIPTION</th>
      <th style="padding:11px 14px;text-align:center;font-size:10px;color:#fff;font-family:Arial,sans-serif;width:70px">QTY</th>
      <th style="padding:11px 14px;text-align:right;font-size:10px;color:#fff;font-family:Arial,sans-serif;width:110px">RATE</th>
      <th style="padding:11px 14px;text-align:right;font-size:10px;color:#fff;font-family:Arial,sans-serif;width:110px">AMOUNT</th>
    </tr></thead>
    <tbody>${items}</tbody>
  </table>
  <div style="display:flex;justify-content:flex-end;margin-bottom:28px">
    <div style="width:260px;border:1px solid #e2e8f0;border-radius:4px;overflow:hidden">
      <div style="display:flex;justify-content:space-between;padding:9px 14px;border-bottom:1px solid #e2e8f0;font-size:13px"><span style="color:#64748b">Subtotal</span><span style="color:#1e293b">${fmt(doc.subtotal,cur)}</span></div>
      ${doc.discount?`<div style="display:flex;justify-content:space-between;padding:9px 14px;border-bottom:1px solid #e2e8f0;font-size:13px"><span style="color:#64748b">Discount</span><span style="color:#16a34a">-${fmt(doc.discount,cur)}</span></div>`:''}
      <div style="display:flex;justify-content:space-between;padding:9px 14px;border-bottom:1px solid #e2e8f0;font-size:13px"><span style="color:#64748b">GST (${doc.taxRate||18}%)</span><span style="color:#1e293b">${fmt(doc.taxAmount,cur)}</span></div>
      <div style="display:flex;justify-content:space-between;padding:12px 14px;background:#1e3a5f;font-size:15px;font-weight:700"><span style="color:rgba(255,255,255,0.8)">TOTAL DUE</span><span style="color:#fff">${fmt(doc.total,cur)}</span></div>
    </div>
  </div>
  ${(doc.notes||doc.terms)?`<div style="display:flex;gap:24px;margin-bottom:28px;padding-top:16px;border-top:1px solid #e2e8f0">${doc.notes?`<div style="flex:1"><div style="font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#1e3a5f;margin-bottom:6px">Notes</div><div style="font-size:12px;color:#64748b;line-height:1.8">${doc.notes}</div></div>`:''}${doc.terms?`<div style="flex:1"><div style="font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#1e3a5f;margin-bottom:6px">Terms</div><div style="font-size:12px;color:#64748b;line-height:1.8">${doc.terms}</div></div>`:''}</div>`:''}
</div>
<div style="background:#1e3a5f;padding:14px 48px;text-align:center">
  <div style="font-size:11px;color:rgba(255,255,255,0.6)">Thank you for your business · ${biz.companyName||''} · ${today()}</div>
</div>
<div class="no-print" style="text-align:center;padding:20px;background:#f6f8fa;border-top:1px solid #e1e8f0">
  <button onclick="window.print()" style="background:#1e3a5f;color:#fff;border:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit">↓ Print / Save as PDF</button>
  <p style="font-size:12px;color:#9ca3af;margin-top:8px">Select "Save as PDF" in print dialog</p>
</div>
</body></html>`;
}

// ────────────────────────────────────────────────
// TEMPLATE 3 — MINIMAL (ultra clean, borderless)
// ────────────────────────────────────────────────
function templateMinimal(doc, biz) {
  const cur = doc.currency||'INR';
  const client = doc.clientInfo||{};
  const due = dueStr(doc.dueDate);
  const items = (doc.lineItems||[]).map(item=>`
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;font-size:13.5px;color:#111827">${item.description}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#9ca3af;text-align:center">${item.quantity}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#9ca3af;text-align:right">${fmt(item.rate,cur)}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:700;color:#111827;text-align:right">${fmt(item.amount,cur)}</td>
    </tr>`).join('');
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{max-width:680px;margin:0 auto;padding:56px 40px}@media print{.no-print{display:none}.page{padding:40px}}</style>
</head><body><div class="page">
<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:48px">
  <div>
    <div style="font-size:20px;font-weight:700;color:#111827;letter-spacing:-0.5px">${biz.companyName||'My Business'}</div>
    <div style="font-size:12px;color:#9ca3af;margin-top:6px;line-height:1.8">${biz.address||''}<br>${[biz.phone,biz.email].filter(Boolean).join(' · ')}</div>
    ${biz.taxId?`<div style="font-size:12px;color:#9ca3af">GST: ${biz.taxId}</div>`:''}
  </div>
  <div style="text-align:right">
    <div style="font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#9ca3af;margin-bottom:6px">${(doc.type||'invoice').replace('_',' ')}</div>
    <div style="font-size:28px;font-weight:800;color:#111827;letter-spacing:-1px">${doc.documentNumber}</div>
    <div style="font-size:12px;color:#9ca3af;margin-top:4px">${today()}</div>
  </div>
</div>
<div style="display:flex;justify-content:space-between;padding:20px 0;border-top:1px solid #f1f5f9;border-bottom:1px solid #f1f5f9;margin-bottom:36px">
  <div>
    <div style="font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;margin-bottom:8px">Bill To</div>
    <div style="font-size:15px;font-weight:700;color:#111827">${client.name||''}</div>
    ${client.company?`<div style="font-size:12px;color:#6b7280;margin-top:2px">${client.company}</div>`:''}
    <div style="font-size:12px;color:#9ca3af;margin-top:4px;line-height:1.7">${[client.address,client.phone,client.email].filter(Boolean).join('<br>')}</div>
  </div>
  <div style="text-align:right">
    <div style="font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;margin-bottom:8px">Amount Due</div>
    <div style="font-size:28px;font-weight:800;color:#111827;letter-spacing:-1px">${fmt(doc.total,cur)}</div>
    ${due?`<div style="font-size:12px;color:#d97706;margin-top:4px;font-weight:500">Due ${due}</div>`:''}
    <div style="margin-top:6px;display:inline-block;padding:3px 10px;background:${statusColor(doc.status)}18;color:${statusColor(doc.status)};border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase">${doc.status||'draft'}</div>
  </div>
</div>
<table style="width:100%;border-collapse:collapse;margin-bottom:28px">
  <thead><tr>
    <th style="padding:0 0 10px;text-align:left;font-size:10px;font-weight:600;color:#9ca3af;letter-spacing:2px;text-transform:uppercase;border-bottom:2px solid #f1f5f9">ITEM</th>
    <th style="padding:0 0 10px;text-align:center;font-size:10px;font-weight:600;color:#9ca3af;letter-spacing:2px;border-bottom:2px solid #f1f5f9;width:60px">QTY</th>
    <th style="padding:0 0 10px;text-align:right;font-size:10px;font-weight:600;color:#9ca3af;letter-spacing:2px;border-bottom:2px solid #f1f5f9;width:100px">RATE</th>
    <th style="padding:0 0 10px;text-align:right;font-size:10px;font-weight:600;color:#9ca3af;letter-spacing:2px;border-bottom:2px solid #f1f5f9;width:100px">TOTAL</th>
  </tr></thead>
  <tbody>${items}</tbody>
</table>
<div style="display:flex;justify-content:flex-end;margin-bottom:28px">
  <div style="width:220px">
    <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:12px;color:#9ca3af"><span>Subtotal</span><span>${fmt(doc.subtotal,cur)}</span></div>
    ${doc.discount?`<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:12px;color:#9ca3af"><span>Discount</span><span>-${fmt(doc.discount,cur)}</span></div>`:''}
    <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:12px;color:#9ca3af;border-bottom:1px solid #f1f5f9"><span>GST ${doc.taxRate||18}%</span><span>${fmt(doc.taxAmount,cur)}</span></div>
    <div style="display:flex;justify-content:space-between;padding:10px 0;font-size:16px;font-weight:800;color:#111827"><span>Total</span><span>${fmt(doc.total,cur)}</span></div>
  </div>
</div>
${(doc.notes||doc.terms)?`<div style="padding-top:20px;border-top:1px solid #f1f5f9">${doc.notes?`<div style="margin-bottom:12px"><div style="font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;margin-bottom:5px">Notes</div><div style="font-size:12px;color:#6b7280;line-height:1.8">${doc.notes}</div></div>`:''}${doc.terms?`<div><div style="font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;margin-bottom:5px">Terms</div><div style="font-size:12px;color:#6b7280;line-height:1.8">${doc.terms}</div></div>`:''}</div>`:''}
<div style="margin-top:40px;padding-top:20px;border-top:1px solid #f1f5f9;font-size:11px;color:#d1d5db;text-align:center">
  ${biz.companyName||''} · ${today()} · InvoiceAI by CodeWithK
</div>
</div>
<div class="no-print" style="text-align:center;padding:20px;background:#f6f8fa;border-top:1px solid #e1e8f0">
  <button onclick="window.print()" style="background:#111827;color:#fff;border:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer">↓ Print / Save as PDF</button>
  <p style="font-size:12px;color:#9ca3af;margin-top:8px">Select "Save as PDF" in print dialog</p>
</div>
</body></html>`;
}

// ────────────────────────────────────────────────
// TEMPLATE 4 — BOLD (dark header, high contrast)
// ────────────────────────────────────────────────
function templateBold(doc, biz) {
  const cur = doc.currency||'INR';
  const client = doc.clientInfo||{};
  const due = dueStr(doc.dueDate);
  const items = (doc.lineItems||[]).map(item=>`
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #1e293b;font-size:13px;color:#f1f5f9">${item.description}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #1e293b;font-size:13px;color:#94a3b8;text-align:center">${item.quantity}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #1e293b;font-size:13px;color:#94a3b8;text-align:right">${fmt(item.rate,cur)}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #1e293b;font-size:13px;font-weight:700;color:#22c55e;text-align:right">${fmt(item.amount,cur)}</td>
    </tr>`).join('');
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0f172a;-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{max-width:794px;margin:0 auto;padding:0}@media print{.no-print{display:none}}</style>
</head><body>
<div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:40px 48px">
  <div style="display:flex;justify-content:space-between;align-items:flex-start">
    <div>
      <div style="font-size:24px;font-weight:800;color:#f1f5f9;letter-spacing:-0.5px">${biz.companyName||'My Business'}</div>
      <div style="font-size:12px;color:#64748b;margin-top:5px;line-height:1.7">${biz.address||''}</div>
      <div style="font-size:12px;color:#64748b">${[biz.phone,biz.email].filter(Boolean).join(' · ')}</div>
      ${biz.taxId?`<div style="font-size:12px;color:#64748b">GST: ${biz.taxId}</div>`:''}
    </div>
    <div style="text-align:right">
      <div style="font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#22c55e;margin-bottom:6px">${(doc.type||'invoice').replace('_',' ')}</div>
      <div style="font-size:26px;font-weight:800;color:#f1f5f9">${doc.documentNumber}</div>
      <div style="margin-top:8px;display:inline-block;padding:4px 14px;background:${statusColor(doc.status)};color:#fff;border-radius:6px;font-size:10px;font-weight:700;text-transform:uppercase">${doc.status||'draft'}</div>
    </div>
  </div>
  <div style="margin-top:28px;padding-top:24px;border-top:1px solid #334155;display:flex;gap:40px">
    <div>
      <div style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#22c55e;margin-bottom:8px">Bill To</div>
      <div style="font-size:16px;font-weight:700;color:#f1f5f9">${client.name||''}</div>
      ${client.company?`<div style="font-size:12px;color:#94a3b8;margin-top:2px">${client.company}</div>`:''}
      <div style="font-size:12px;color:#64748b;margin-top:5px;line-height:1.7">${[client.address,client.phone,client.email].filter(Boolean).join('<br>')}</div>
    </div>
    <div style="margin-left:auto;text-align:right">
      <div style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#64748b;margin-bottom:8px">Issue Date</div>
      <div style="font-size:13px;color:#94a3b8">${today()}</div>
      ${due?`<div style="margin-top:10px"><div style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#d97706;margin-bottom:4px">Due Date</div><div style="font-size:13px;color:#fbbf24">${due}</div></div>`:''}
    </div>
  </div>
</div>
<div style="background:#111827;padding:0 48px">
  <table style="width:100%;border-collapse:collapse;margin:0">
    <thead><tr style="background:#0f172a">
      <th style="padding:12px 16px;text-align:left;font-size:10px;font-weight:600;color:#22c55e;letter-spacing:1.5px">DESCRIPTION</th>
      <th style="padding:12px 16px;text-align:center;font-size:10px;color:#22c55e;width:70px">QTY</th>
      <th style="padding:12px 16px;text-align:right;font-size:10px;color:#22c55e;width:110px">RATE</th>
      <th style="padding:12px 16px;text-align:right;font-size:10px;color:#22c55e;width:110px">AMOUNT</th>
    </tr></thead>
    <tbody>${items}</tbody>
  </table>
  <div style="display:flex;justify-content:flex-end;padding:20px 0 28px">
    <div style="width:250px">
      <div style="display:flex;justify-content:space-between;padding:7px 0;font-size:13px;color:#64748b;border-bottom:1px solid #1e293b"><span>Subtotal</span><span>${fmt(doc.subtotal,cur)}</span></div>
      ${doc.discount?`<div style="display:flex;justify-content:space-between;padding:7px 0;font-size:13px;color:#64748b;border-bottom:1px solid #1e293b"><span>Discount</span><span style="color:#22c55e">-${fmt(doc.discount,cur)}</span></div>`:''}
      <div style="display:flex;justify-content:space-between;padding:7px 0;font-size:13px;color:#64748b;border-bottom:1px solid #1e293b"><span>GST (${doc.taxRate||18}%)</span><span>${fmt(doc.taxAmount,cur)}</span></div>
      <div style="display:flex;justify-content:space-between;padding:14px 0;font-size:20px;font-weight:800"><span style="color:#f1f5f9">Total</span><span style="color:#22c55e">${fmt(doc.total,cur)}</span></div>
    </div>
  </div>
  ${(doc.notes||doc.terms)?`<div style="display:flex;gap:24px;padding:20px 0;border-top:1px solid #1e293b;margin-top:-8px">${doc.notes?`<div style="flex:1"><div style="font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#22c55e;margin-bottom:6px">Notes</div><div style="font-size:12px;color:#64748b;line-height:1.7">${doc.notes}</div></div>`:''}${doc.terms?`<div style="flex:1"><div style="font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#22c55e;margin-bottom:6px">Terms</div><div style="font-size:12px;color:#64748b;line-height:1.7">${doc.terms}</div></div>`:''}</div>`:''}
</div>
<div style="background:#0f172a;padding:14px 48px;text-align:center">
  <div style="font-size:11px;color:#334155">Generated by <strong style="color:#22c55e">InvoiceAI</strong> · ${biz.companyName||''} · ${today()}</div>
</div>
<div class="no-print" style="text-align:center;padding:20px;background:#f6f8fa;border-top:1px solid #e1e8f0">
  <button onclick="window.print()" style="background:#0f172a;color:#fff;border:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer">↓ Print / Save as PDF</button>
  <p style="font-size:12px;color:#9ca3af;margin-top:8px">Select "Save as PDF" in print dialog</p>
</div>
</body></html>`;
}

function templateCustomForm(doc, biz) {
  const cur=doc.currency||"INR";
  const sections=(doc.lineItems||[]);
  function fld(label,type="line"){if(type==="box")return `<div style="margin-bottom:14px"><div style="font-size:10px;font-weight:700;color:#1e3a5f;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px">${label}</div><div style="border:1.5px solid #d1d5db;border-radius:6px;min-height:60px;padding:8px"></div></div>`;if(type==="check")return `<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px"><div style="width:15px;height:15px;border:1.5px solid #374151;border-radius:2px;flex-shrink:0;margin-top:1px"></div><div style="font-size:12px;color:#374151">${label}</div></div>`;if(type==="upload")return `<div style="margin-bottom:14px"><div style="font-size:10px;font-weight:700;color:#1e3a5f;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px">${label}</div><div style="border:2px dashed #9ca3af;border-radius:8px;padding:18px;text-align:center;color:#9ca3af;font-size:12px">📎 Attach Document Here</div></div>`;return `<div style="margin-bottom:14px"><div style="font-size:10px;font-weight:700;color:#1e3a5f;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px">${label}</div><div style="border-bottom:1.5px solid #d1d5db;min-height:28px;padding:5px 0"></div></div>`; }
  const secHTML=sections.map(s=>{const d=s.description.toLowerCase();const title=s.description.split("—")[0].split(":").slice(0,1).join("").trim();let fields="";if(d.includes("personal")||d.includes("detail")||d.includes("contact")){fields+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">${fld("Full Name")}${fld("Date of Birth")}</div>${fld("Phone Number")}${fld("Email Address")}${fld("Full Address","box")}`;} if(d.includes("service")||d.includes("project")||d.includes("requirement")){fields+=`<div style="margin-bottom:14px"><div style="font-size:10px;font-weight:700;color:#1e3a5f;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px">Service Type</div><div style="border:1.5px solid #d1d5db;border-radius:6px;padding:8px;font-size:12px;color:#9ca3af">[ ] Web Dev function generateInvoiceHTML(document, businessInfo, template='modern') {nbsp; [ ] Mobile App function generateInvoiceHTML(document, businessInfo, template='modern') {nbsp; [ ] Design function generateInvoiceHTML(document, businessInfo, template='modern') {nbsp; [ ] Marketing function generateInvoiceHTML(document, businessInfo, template='modern') {nbsp; [ ] Other</div></div>${fld("Project Requirements","box")}<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">${fld("Budget (₹)")}${fld("Expected Timeline")}</div>`;} if(d.includes("upload")||d.includes("document")){fields+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">${fld("Government ID (Aadhaar/PAN)","upload")}${fld("Supporting Document","upload")}</div>`;} if(d.includes("declaration")||d.includes("agreement")||d.includes("signature")){fields+=fld("I agree to Terms and Conditions","check")+fld("All information provided is accurate","check")+`<div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-top:20px"><div><div style="border-bottom:1.5px solid #111827;margin-top:32px"></div><div style="font-size:9px;color:#9ca3af;margin-top:5px;text-transform:uppercase;letter-spacing:0.5px">Customer Signature / Date</div></div><div><div style="border-bottom:1.5px solid #111827;margin-top:32px"></div><div style="font-size:9px;color:#9ca3af;margin-top:5px;text-transform:uppercase;letter-spacing:0.5px">Authorized Signature / Date</div></div></div>`;} if(!fields){fields=fld("Details","box");} return `<div style="margin-bottom:22px"><div style="background:#1e3a5f;color:#fff;padding:9px 16px;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;border-radius:6px 6px 0 0">${title}</div><div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 6px 6px;padding:18px">${fields}</div></div>`;}).join("");
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{max-width:794px;margin:0 auto;padding:44px}@media print{.no-print{display:none}.page{padding:32px}}</style></head><body><div class="page"><div style="text-align:center;margin-bottom:28px;padding-bottom:20px;border-bottom:3px solid #1e3a5f"><div style="font-size:9px;font-weight:700;color:#9ca3af;letter-spacing:3px;text-transform:uppercase;margin-bottom:6px">${biz.companyName||"My Business"}</div><div style="font-size:26px;font-weight:800;color:#1e3a5f;letter-spacing:-0.5px">${doc.title||"FORM"}</div><div style="font-size:11px;color:#9ca3af;margin-top:6px">No: ${doc.documentNumber} function generateInvoiceHTML(document, businessInfo, template='modern') {nbsp;·function generateInvoiceHTML(document, businessInfo, template='modern') {nbsp; Date: ${new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</div></div>${doc.notes?`<div style="background:#eff6ff;border-left:4px solid #1e3a5f;padding:11px 16px;margin-bottom:22px;font-size:12px;color:#374151;border-radius:0 6px 6px 0;line-height:1.6"><strong>Instructions:</strong> ${doc.notes}</div>`:""} ${secHTML}<div style="margin-top:24px;padding-top:18px;border-top:1px solid #e5e7eb;font-size:10px;color:#9ca3af;text-align:center">${biz.companyName||""} function generateInvoiceHTML(document, businessInfo, template='modern') {nbsp;·function generateInvoiceHTML(document, businessInfo, template='modern') {nbsp; Generated by InvoiceAI by CodeWithK</div></div><div class="no-print" style="text-align:center;padding:20px;background:#f6f8fa;border-top:1px solid #e1e8f0"><button onclick="window.print()" style="background:#1e3a5f;color:#fff;border:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer">↓ Print / Save as PDF</button><p style="font-size:12px;color:#9ca3af;margin-top:8px">Select Save as PDF in print dialog</p></div></body></html>`;
}

function generateInvoiceHTML(document, businessInfo, template="modern") {
  const biz = businessInfo || {};
  switch(template) {
    case 'custom_form': return templateCustomForm(document, biz);
    case 'classic': return templateClassic(document, biz);
    case 'minimal': return templateMinimal(document, biz);
    case 'bold':    return templateBold(document, biz);
    default:        return templateModern(document, biz);
  }
}

module.exports = { generateInvoiceHTML };
