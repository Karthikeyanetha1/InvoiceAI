from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import weasyprint
import os

app = FastAPI(title="InvoiceAI PDF Service", version="1.0.0")

CURRENCY_SYMBOLS = {
    'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£'
}

class LineItem(BaseModel):
    description: str
    quantity: float
    rate: float
    amount: float

class ClientInfo(BaseModel):
    name: Optional[str] = ''
    email: Optional[str] = ''
    phone: Optional[str] = ''
    address: Optional[str] = ''
    company: Optional[str] = ''

class BusinessInfo(BaseModel):
    companyName: Optional[str] = 'My Company'
    address: Optional[str] = ''
    phone: Optional[str] = ''
    email: Optional[str] = ''
    taxId: Optional[str] = ''
    currency: Optional[str] = 'INR'

class DocumentData(BaseModel):
    title: Optional[str] = 'Invoice'
    type: Optional[str] = 'invoice'
    documentNumber: Optional[str] = 'DOC-001'
    clientInfo: Optional[ClientInfo] = None
    lineItems: Optional[List[LineItem]] = []
    subtotal: Optional[float] = 0
    taxRate: Optional[float] = 18
    taxAmount: Optional[float] = 0
    discount: Optional[float] = 0
    total: Optional[float] = 0
    currency: Optional[str] = 'INR'
    notes: Optional[str] = ''
    terms: Optional[str] = ''
    dueDate: Optional[str] = None
    status: Optional[str] = 'draft'

class PDFRequest(BaseModel):
    document: DocumentData
    businessInfo: Optional[BusinessInfo] = None

def format_currency(amount: float, currency: str) -> str:
    symbol = CURRENCY_SYMBOLS.get(currency, currency)
    return f"{symbol}{amount:,.2f}"

def get_status_color(status: str) -> str:
    colors = {
        'paid': '#22c55e',
        'sent': '#3b82f6',
        'draft': '#f59e0b',
        'cancelled': '#ef4444'
    }
    return colors.get(status, '#6b7280')

def build_html(doc: DocumentData, biz: BusinessInfo) -> str:
    currency = doc.currency or 'INR'
    symbol = CURRENCY_SYMBOLS.get(currency, currency)
    status_color = get_status_color(doc.status or 'draft')
    doc_type_label = (doc.type or 'invoice').replace('_', ' ').upper()

    line_items_html = ''
    for item in (doc.lineItems or []):
        line_items_html += f"""
        <tr>
            <td class="item-desc">{item.description}</td>
            <td class="text-center">{item.quantity}</td>
            <td class="text-right">{format_currency(item.rate, currency)}</td>
            <td class="text-right amount">{format_currency(item.amount, currency)}</td>
        </tr>"""

    client = doc.clientInfo or ClientInfo()
    due_date_str = ''
    if doc.dueDate:
        try:
            dt = datetime.fromisoformat(doc.dueDate.replace('Z', ''))
            due_date_str = dt.strftime('%d %b %Y')
        except:
            due_date_str = doc.dueDate

    today = datetime.now().strftime('%d %b %Y')

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700&display=swap');

  * {{ margin: 0; padding: 0; box-sizing: border-box; }}

  body {{
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #1a1a2e;
    background: #fff;
    padding: 0;
  }}

  .page {{
    max-width: 780px;
    margin: 0 auto;
    padding: 48px;
  }}

  /* Header */
  .header {{
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 40px;
    padding-bottom: 32px;
    border-bottom: 2px solid #f0f0f0;
  }}

  .brand-name {{
    font-family: 'Syne', sans-serif;
    font-size: 26px;
    font-weight: 700;
    color: #1a1a2e;
    letter-spacing: -0.5px;
  }}

  .brand-sub {{
    font-size: 11px;
    color: #888;
    margin-top: 2px;
  }}

  .doc-meta {{
    text-align: right;
  }}

  .doc-type {{
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: #6366f1;
    letter-spacing: -0.3px;
  }}

  .doc-number {{
    font-size: 12px;
    color: #666;
    margin-top: 4px;
  }}

  .status-badge {{
    display: inline-block;
    padding: 3px 12px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: white;
    background: {status_color};
    margin-top: 6px;
    text-transform: uppercase;
  }}

  /* Addresses */
  .addresses {{
    display: flex;
    gap: 48px;
    margin-bottom: 36px;
  }}

  .address-block {{ flex: 1; }}

  .address-label {{
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #999;
    margin-bottom: 8px;
  }}

  .address-name {{
    font-size: 15px;
    font-weight: 600;
    color: #1a1a2e;
    margin-bottom: 4px;
  }}

  .address-detail {{
    font-size: 12px;
    color: #555;
    line-height: 1.7;
  }}

  /* Dates */
  .dates-row {{
    display: flex;
    gap: 16px;
    margin-bottom: 32px;
  }}

  .date-card {{
    background: #f8f8ff;
    border: 1px solid #e8e8f5;
    border-radius: 10px;
    padding: 12px 20px;
    flex: 1;
  }}

  .date-label {{
    font-size: 10px;
    font-weight: 600;
    color: #999;
    letter-spacing: 1px;
    text-transform: uppercase;
  }}

  .date-value {{
    font-size: 14px;
    font-weight: 600;
    color: #1a1a2e;
    margin-top: 2px;
  }}

  /* Table */
  .items-table {{
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 24px;
  }}

  .items-table thead th {{
    background: #1a1a2e;
    color: #fff;
    padding: 12px 16px;
    text-align: left;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.5px;
  }}

  .items-table thead th:first-child {{ border-radius: 8px 0 0 8px; }}
  .items-table thead th:last-child {{ border-radius: 0 8px 8px 0; }}

  .items-table tbody tr:nth-child(even) {{ background: #fafafe; }}
  .items-table tbody tr:hover {{ background: #f0f0ff; }}

  .items-table td {{
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
    vertical-align: top;
  }}

  .item-desc {{ font-weight: 500; color: #1a1a2e; max-width: 320px; }}
  .text-center {{ text-align: center; color: #555; }}
  .text-right {{ text-align: right; color: #555; }}
  .amount {{ font-weight: 600; color: #1a1a2e; }}

  /* Totals */
  .totals-section {{
    display: flex;
    justify-content: flex-end;
    margin-bottom: 32px;
  }}

  .totals-box {{
    width: 280px;
    background: #f8f8ff;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e8e8f5;
  }}

  .total-row {{
    display: flex;
    justify-content: space-between;
    padding: 10px 20px;
    border-bottom: 1px solid #e8e8f5;
    font-size: 13px;
  }}

  .total-row:last-child {{ border-bottom: none; }}

  .total-label {{ color: #666; }}
  .total-value {{ font-weight: 500; color: #1a1a2e; }}

  .grand-total {{
    background: #1a1a2e;
    padding: 14px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }}

  .grand-label {{
    color: #aaa;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }}

  .grand-value {{
    color: #fff;
    font-size: 20px;
    font-weight: 600;
    font-family: 'Syne', sans-serif;
  }}

  /* Notes */
  .notes-section {{
    display: flex;
    gap: 24px;
    margin-bottom: 32px;
  }}

  .notes-block {{
    flex: 1;
    background: #fafafa;
    border-radius: 10px;
    border: 1px solid #ebebeb;
    padding: 16px 20px;
  }}

  .notes-title {{
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #999;
    margin-bottom: 8px;
  }}

  .notes-text {{
    font-size: 12px;
    color: #555;
    line-height: 1.7;
  }}

  /* Footer */
  .footer {{
    text-align: center;
    padding-top: 24px;
    border-top: 1px solid #f0f0f0;
    font-size: 11px;
    color: #bbb;
  }}

  .footer strong {{ color: #6366f1; }}

  /* Accent bar */
  .accent-bar {{
    height: 4px;
    background: linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa);
    border-radius: 2px;
    margin-bottom: 40px;
  }}
</style>
</head>
<body>
<div class="page">
  <div class="accent-bar"></div>

  <div class="header">
    <div class="from-info">
      <div class="brand-name">{biz.companyName or 'My Business'}</div>
      <div class="brand-sub">{biz.address or ''}</div>
      <div class="brand-sub">{biz.phone or ''} {'•' if biz.phone and biz.email else ''} {biz.email or ''}</div>
      {f'<div class="brand-sub">GST: {biz.taxId}</div>' if biz.taxId else ''}
    </div>
    <div class="doc-meta">
      <div class="doc-type">{doc_type_label}</div>
      <div class="doc-number"># {doc.documentNumber}</div>
      <div><span class="status-badge">{doc.status or 'draft'}</span></div>
    </div>
  </div>

  <div class="addresses">
    <div class="address-block">
      <div class="address-label">Bill To</div>
      <div class="address-name">{client.name or 'Client Name'}</div>
      <div class="address-detail">
        {client.company + '<br>' if client.company else ''}
        {client.address or ''}<br>
        {client.phone or ''} {' • ' + client.email if client.email else ''}
      </div>
    </div>
  </div>

  <div class="dates-row">
    <div class="date-card">
      <div class="date-label">Issue Date</div>
      <div class="date-value">{today}</div>
    </div>
    {f'<div class="date-card"><div class="date-label">Due Date</div><div class="date-value">{due_date_str}</div></div>' if due_date_str else ''}
    <div class="date-card">
      <div class="date-label">Currency</div>
      <div class="date-value">{currency}</div>
    </div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align:center; width:80px;">Qty</th>
        <th style="text-align:right; width:120px;">Rate</th>
        <th style="text-align:right; width:120px;">Amount</th>
      </tr>
    </thead>
    <tbody>
      {line_items_html}
    </tbody>
  </table>

  <div class="totals-section">
    <div class="totals-box">
      <div class="total-row">
        <span class="total-label">Subtotal</span>
        <span class="total-value">{format_currency(doc.subtotal or 0, currency)}</span>
      </div>
      {f'<div class="total-row"><span class="total-label">Discount</span><span class="total-value">-{format_currency(doc.discount, currency)}</span></div>' if doc.discount else ''}
      <div class="total-row">
        <span class="total-label">Tax ({doc.taxRate or 18}% GST)</span>
        <span class="total-value">{format_currency(doc.taxAmount or 0, currency)}</span>
      </div>
      <div class="grand-total">
        <span class="grand-label">Total Due</span>
        <span class="grand-value">{format_currency(doc.total or 0, currency)}</span>
      </div>
    </div>
  </div>

  {'<div class="notes-section">' +
   (f'<div class="notes-block"><div class="notes-title">Notes</div><div class="notes-text">{doc.notes}</div></div>' if doc.notes else '') +
   (f'<div class="notes-block"><div class="notes-title">Terms & Conditions</div><div class="notes-text">{doc.terms}</div></div>' if doc.terms else '') +
   '</div>' if doc.notes or doc.terms else ''}

  <div class="footer">
    Generated by <strong>InvoiceAI</strong> — Powered by CodeWithK &nbsp;•&nbsp; {today}
  </div>
</div>
</body>
</html>"""

@app.get("/health")
def health():
    return {"status": "ok", "service": "InvoiceAI PDF Service"}

@app.post("/generate-pdf")
async def generate_pdf(request: PDFRequest):
    try:
        biz = request.businessInfo or BusinessInfo()
        html = build_html(request.document, biz)
        pdf_bytes = weasyprint.HTML(string=html).write_pdf()
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={request.document.documentNumber or 'document'}.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
