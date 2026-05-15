# InvoiceAI — AI Invoice & Form Generator SaaS

> Built with React + Node.js + FastAPI + Claude API + WeasyPrint  
> By **CodeWithK** (Karthik Gurram)

---

## 🚀 What It Does

InvoiceAI lets users **describe a document in plain English** and generates a professional, ready-to-download PDF in seconds using Claude AI.

**Supported document types:**
- 🧾 Invoices
- 📋 Quotations
- ✅ Receipts
- 📦 Purchase Orders
- 📝 Custom Forms

**Key Features:**
- ✦ AI generation from natural language prompt
- ✦ AI improvement — refine existing documents with feedback
- ✦ PDF export via WeasyPrint (premium design)
- ✦ Full CRUD — create, edit, update, delete documents
- ✦ Line item editor with auto-calculations (GST, totals)
- ✦ JWT authentication (register/login)
- ✦ Business profile (appears on all PDFs)
- ✦ Dashboard with revenue stats
- ✦ Filter by type/status, search documents

---

## 📁 Project Structure

```
invoiceai/
├── backend/          # Node.js + Express API
│   ├── models/       # Mongoose schemas (User, Document)
│   ├── routes/       # auth, documents, generate
│   ├── services/     # aiService.js (Claude API)
│   ├── middleware/   # JWT auth
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
├── pdf-service/      # Python FastAPI + WeasyPrint
│   ├── main.py       # PDF generation endpoint
│   └── requirements.txt
│
└── frontend/         # React + Vite
    ├── src/
    │   ├── pages/    # Dashboard, Generate, Documents, DocumentView, Settings
    │   ├── components/ # Layout (sidebar)
    │   ├── hooks/    # useAuth (AuthContext)
    │   └── utils/    # api.js (axios)
    ├── index.html
    └── package.json
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB Atlas account (free tier)
- Anthropic API key

---

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev   # runs on http://localhost:5000
```

**Required `.env` values:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/invoiceai
JWT_SECRET=any_long_random_string
ANTHROPIC_API_KEY=sk-ant-xxxxx
PDF_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

---

### 2. PDF Service Setup (Python)

```bash
cd pdf-service

# Install system dependency (Ubuntu/Debian)
sudo apt-get install -y python3-weasyprint

# Or with pip
pip install -r requirements.txt --break-system-packages

# Run
python main.py   # runs on http://localhost:8000
```

> **Note for Windows:** WeasyPrint requires GTK. Use WSL or Docker.  
> **Note for Codespaces:** Should work out of the box with pip install.

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev   # runs on http://localhost:5173
```

---

### 4. All Three Together

Open 3 terminals:
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - PDF Service
cd pdf-service && python main.py

# Terminal 3 - Frontend
cd frontend && npm run dev
```

Visit: **http://localhost:5173**

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/business-info` | Update business profile |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/documents` | List all (filter: type, status) |
| GET | `/api/documents/:id` | Get single document |
| PUT | `/api/documents/:id` | Update document |
| DELETE | `/api/documents/:id` | Delete document |
| GET | `/api/documents/stats/overview` | Dashboard stats |

### Generate (AI)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate/ai` | Generate from prompt |
| POST | `/api/generate/improve/:id` | AI improve existing doc |
| POST | `/api/generate/pdf/:id` | Download PDF |

### PDF Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `http://localhost:8000/health` | Health check |
| POST | `http://localhost:8000/generate-pdf` | Generate PDF |

---

## 🚢 Deployment

### Backend → Render
1. Push to GitHub
2. New Web Service on Render → connect repo → set root: `backend`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add environment variables in Render dashboard

### PDF Service → Render (separate service)
1. New Web Service → root: `pdf-service`
2. Build: `pip install -r requirements.txt`
3. Start: `python main.py`
4. Update `PDF_SERVICE_URL` in backend env to point to this URL

### Frontend → Vercel / Netlify
1. Push to GitHub
2. New project in Vercel → root: `frontend`
3. Build: `npm run build` | Output: `dist`
4. Set `VITE_API_URL` if needed

---

## 🎯 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + React Router |
| Styling | Pure CSS with CSS variables |
| Backend | Node.js + Express 4 |
| AI | Anthropic Claude API (claude-sonnet-4) |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| PDF | Python FastAPI + WeasyPrint |
| Fonts | DM Sans + Syne (Google Fonts) |

---

## 📈 Future Enhancements (Roadmap)

- [ ] Email invoice directly to client (Nodemailer / SendGrid)
- [ ] Razorpay / Stripe payment link on invoice
- [ ] Client portal (shareable invoice link)
- [ ] Multi-currency auto-conversion
- [ ] Logo upload on business profile
- [ ] Invoice templates (Modern, Classic, Minimal)
- [ ] Recurring invoices (cron job)
- [ ] CSV export of all documents

---

## 👨‍💻 Author

**Gurram Karthikeya (Karthik)**  
B.Tech CSE AI & ML — St. Mary's Engineering College, Hyderabad  
GitHub: [@karthikeynetha1](https://github.com/karthikeynetha1)  
Email: karthikeyanetha7@gmail.com  
Brand: **CodeWithK**
