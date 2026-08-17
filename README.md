# InvoiceAI — Invoice & Document Management Platform

A full-stack web application for creating, managing, editing, and exporting professional business documents such as invoices, quotations, receipts, purchase orders, and custom forms.

The platform combines a React frontend, Node.js backend, MongoDB database, and a separate Python PDF service. An AI-assisted generation feature allows users to create document drafts from simple text instructions and improve existing documents.

---

## 🚀 Overview

**InvoiceAI** is designed to simplify everyday business document creation.

Users can create documents manually using structured forms or use the AI generation feature to create an initial draft from a natural-language description. Documents can then be reviewed, edited, saved, and exported as professionally formatted PDFs.

The application also includes authentication, business profile management, document history, dashboard statistics, search, filtering, and automatic calculation of taxes and totals.

### Supported Documents

* 🧾 Invoices
* 📋 Quotations
* ✅ Receipts
* 📦 Purchase Orders
* 📝 Custom Forms

---

## ✨ Features

### 📄 Document Management

* Create invoices and other business documents
* Edit and update existing documents
* Delete documents
* View individual documents
* Search documents
* Filter documents by type and status
* Maintain document history through the dashboard

### 🧮 Invoice Calculations

* Add and edit line items
* Automatically calculate subtotal
* GST/tax calculation
* Calculate final totals
* Support multiple items within a document

### 🤖 Assisted Document Generation

Users can describe what they need in plain language and generate a document draft.

For example:

```text
Create an invoice for ABC Technologies for
₹25,000 for website development services.
Add 18% GST.
```

The generated draft can then be reviewed and modified before saving or exporting.

An improvement feature is also available for refining an existing document using additional instructions.

### 🔐 Authentication

* User registration
* User login
* JWT-based authentication
* Protected routes
* Password hashing using bcrypt
* Authenticated document access

### 🏢 Business Profile

Users can maintain their business information, which can be reused across generated documents and PDFs.

### 📊 Dashboard

The dashboard provides an overview of stored documents and business activity.

Includes:

* Total documents
* Revenue-related statistics
* Document type breakdown
* Document status filtering
* Recent documents

### 📑 PDF Export

Documents can be converted into professionally formatted PDF files using a dedicated Python service built with **FastAPI and WeasyPrint**.

---

## 🏗️ Architecture

```text
                         ┌─────────────────────┐
                         │        User         │
                         │      Browser        │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   React Frontend    │
                         │       + Vite        │
                         └──────────┬──────────┘
                                    │
                              REST API
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Node.js + Express │
                         │      Backend        │
                         └──────┬─────────┬────┘
                                │         │
                    MongoDB     │         │ AI-assisted
                    Operations  │         │ Generation
                                │         │
                                ▼         ▼
                     ┌──────────────┐  ┌──────────────┐
                     │ MongoDB Atlas│  │ Claude API   │
                     └──────────────┘  └──────────────┘
                               
                                │
                                │ PDF Request
                                ▼
                     ┌─────────────────────┐
                     │ Python PDF Service  │
                     │ FastAPI + WeasyPrint│
                     └─────────────────────┘
```

### Application Flow

```text
User
 ↓
React Application
 ↓
Express REST API
 ├── Authentication
 ├── Document Management
 ├── Dashboard Statistics
 └── Document Generation
       │
       ├── Claude API
       │
       └── PDF Service
              ↓
         WeasyPrint
              ↓
          PDF Output
```

---

## 📁 Project Structure

```text
invoiceai/
│
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Document.js
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── documents.js
│   │   └── generate.js
│   │
│   ├── services/
│   │   └── aiService.js
│   │
│   ├── middleware/
│   │   └── auth.js
│   │
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
├── pdf-service/
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard/
│   │   │   ├── Generate/
│   │   │   ├── Documents/
│   │   │   ├── DocumentView/
│   │   │   └── Settings/
│   │   │
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   │
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint                  | Description             |
| ------ | ------------------------- | ----------------------- |
| `POST` | `/api/auth/register`      | Register a new user     |
| `POST` | `/api/auth/login`         | Authenticate user       |
| `GET`  | `/api/auth/me`            | Get current user        |
| `PUT`  | `/api/auth/business-info` | Update business profile |

### Documents

| Method   | Endpoint                        | Description              |
| -------- | ------------------------------- | ------------------------ |
| `GET`    | `/api/documents`                | Get user's documents     |
| `GET`    | `/api/documents/:id`            | Get a specific document  |
| `PUT`    | `/api/documents/:id`            | Update a document        |
| `DELETE` | `/api/documents/:id`            | Delete a document        |
| `GET`    | `/api/documents/stats/overview` | Get dashboard statistics |

### Document Generation

| Method | Endpoint                    | Description                  |
| ------ | --------------------------- | ---------------------------- |
| `POST` | `/api/generate/ai`          | Generate a document draft    |
| `POST` | `/api/generate/improve/:id` | Improve an existing document |
| `POST` | `/api/generate/pdf/:id`     | Generate a PDF               |

### PDF Service

| Method | Endpoint        | Description              |
| ------ | --------------- | ------------------------ |
| `GET`  | `/health`       | Check PDF service status |
| `POST` | `/generate-pdf` | Generate a PDF document  |

---

## 🛠️ Technology Stack

| Area                | Technology           |
| ------------------- | -------------------- |
| Frontend            | React 18             |
| Build Tool          | Vite                 |
| Routing             | React Router         |
| Styling             | CSS / CSS Variables  |
| Backend             | Node.js              |
| API                 | Express.js           |
| Database            | MongoDB Atlas        |
| ODM                 | Mongoose             |
| Authentication      | JWT + bcryptjs       |
| Document Assistance | Anthropic Claude API |
| PDF Service         | Python + FastAPI     |
| PDF Rendering       | WeasyPrint           |
| HTTP Client         | Axios                |
| Deployment          | Render / Vercel      |

---

## ⚙️ Local Setup

### Prerequisites

Make sure the following are installed:

* Node.js 18+
* Python 3.10+
* MongoDB Atlas account
* Anthropic API key

---

### 1. Clone the Repository

```bash
git clone https://github.com/karthikeyanetha1/invoiceai.git
cd invoiceai
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
ANTHROPIC_API_KEY=your_api_key
PDF_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

---

### 3. PDF Service Setup

Open another terminal:

```bash
cd pdf-service
```

Install dependencies:

```bash
pip install -r requirements.txt
```

For Ubuntu/Debian, install the required system packages for WeasyPrint if necessary.

Start the PDF service:

```bash
python main.py
```

PDF service:

```text
http://localhost:8000
```

---

### 4. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🔄 Running the Complete Application

Three services run locally:

```text
Terminal 1
──────────
Backend
cd backend
npm run dev


Terminal 2
──────────
PDF Service
cd pdf-service
python main.py


Terminal 3
──────────
Frontend
cd frontend
npm run dev
```

Then open:

```text
http://localhost:5173
```

---

## ☁️ Deployment

The application can be deployed as separate services.

### Backend

Deploy the Node.js backend as a Render Web Service.

```text
Root Directory: backend
Build Command: npm install
Start Command: node server.js
```

Configure the required environment variables in the Render dashboard.

### PDF Service

Deploy the Python service separately.

```text
Root Directory: pdf-service
Build Command: pip install -r requirements.txt
Start Command: python main.py
```

After deployment, update:

```env
PDF_SERVICE_URL=your_deployed_pdf_service_url
```

### Frontend

The React frontend can be deployed using Vercel, Netlify, or another static hosting provider.

```bash
npm run build
```

The production build is generated in:

```text
dist/
```

Configure the frontend API URL according to the deployed backend.

---

## 🔒 Security Considerations

The application uses several standard security practices:

* JWT authentication for protected routes
* Password hashing with bcrypt
* Environment variables for secrets
* Protected backend APIs
* User-specific document access
* API keys kept outside source code

### Never commit secrets

Do not commit:

```text
.env
API keys
JWT secrets
MongoDB credentials
```

Use `.env.example` to document required configuration without exposing real credentials.

---

## 🎯 What I Built and Learned

This project gave me practical experience building a multi-service full-stack application.

### Backend

* Designed REST APIs using Express
* Created MongoDB schemas with Mongoose
* Implemented authentication and protected routes
* Built CRUD operations
* Integrated external services

### Frontend

* Built reusable React components
* Created dashboard and document management screens
* Implemented forms and validation
* Connected frontend components with REST APIs
* Managed authenticated application state

### PDF Service

* Built a separate Python service using FastAPI
* Created HTML/CSS-based document layouts
* Converted documents into downloadable PDFs using WeasyPrint

### Application Integration

* Connected three separate application layers
* Managed environment-based configuration
* Handled communication between Node.js and Python services
* Worked with external API integration
* Prepared the application for cloud deployment

---

## 🔮 Future Improvements

Planned improvements include:

* Email invoices directly to customers
* Online payments using Razorpay or Stripe
* Shareable invoice links
* Client portal
* Multi-currency support
* Business logo uploads
* Multiple invoice templates
* Recurring invoices
* CSV export
* Improved reporting and analytics

---

## 👨‍💻 Author

**Gurram Karthikeya (Karthik)**

B.Tech — Computer Science Engineering (AI & ML)
St. Mary's Engineering College, Hyderabad

📧 **Email:** [karthikeyanetha7@gmail.com](mailto:karthikeyanetha7@gmail.com)

🔗 **GitHub:** https://github.com/karthikeyanetha1

🔗 **LinkedIn:** https://www.linkedin.com/in/karthikeya-gurram-59209726/

---

## ⭐ Project

**InvoiceAI** is a practical full-stack project focused on solving a common business problem: creating and managing professional documents without relying on manual templates and repetitive data entry.

The project demonstrates my experience with **React, Node.js, Express, MongoDB, Python, REST APIs, authentication, third-party API integration, PDF generation, and cloud deployment.**

---
