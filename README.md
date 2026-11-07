<div align="center">

# 📋 ReserveX

**A full-stack freelancer project management platform built with Next.js 15 and MongoDB**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb)](https://mongoosejs.com/)

</div>

---

## 📌 Project Overview

**ReserveX** is a freelancer-focused project management SaaS application that centralises the entire client-to-payment lifecycle in one dashboard. It enables freelancers and small agencies to manage clients, track active projects, monitor tasks and milestones, record deliverables, and generate financial reports — all without juggling spreadsheets or multiple disconnected tools.

---

## 🧩 Problem Statement

Freelancers frequently struggle with:

- **Scattered client data** across emails, spreadsheets, and notes
- **No single source of truth** for project status, tasks, and deadlines
- **Manual payment tracking** that leads to missed invoices and cash-flow blind spots
- **Poor deliverable management**, causing scope-creep and disputes
- **Lack of consolidated reporting** to understand project profitability

ReserveX solves these problems by providing a structured, full-stack platform that covers every stage of a freelance project — from client onboarding to final payment.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 👥 **Client Management** | Create, view, and manage client profiles with contact details |
| 📁 **Project Tracking** | Full project lifecycle with status, deadlines, and linked clients |
| ✅ **Task Management** | Per-project tasks with priority levels and status tracking |
| 🏁 **Milestones** | Define and track project milestones tied to deliverables |
| 📦 **Deliverables** | Log and track what has been delivered for each project |
| 💳 **Payment Records** | Track payment amounts, dates, and status per project |
| 📊 **Dashboard** | Aggregated overview of active projects, upcoming tasks, and revenue |
| 📈 **Reports** | Financial and project-level reporting with Recharts visualisations |
| 💬 **Comments** | Per-task commenting for internal notes and collaboration |
| 🌱 **Database Seeding** | Seed script to bootstrap development with realistic sample data |

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org/) | 15.5.29 | Full-stack React framework (App Router + Turbopack) |
| [React](https://reactjs.org/) | 19.1.0 | UI rendering |
| [TypeScript](https://www.typescriptlang.org/) | ^5 | Static typing |
| [Tailwind CSS](https://tailwindcss.com/) | ^4 | Utility-first CSS framework |
| [Lucide React](https://lucide.dev/) | ^1.69.0 | Icon library |
| [Recharts](https://recharts.org/) | ^3.10.1 | Data visualisation / charts |
| [React Hook Form](https://react-hook-form.com/) | ^7.91.0 | Performant form management |
| [Zod](https://zod.dev/) | ^4.6.7 | Schema validation |

### Backend / Database
| Technology | Version | Purpose |
|---|---|---|
| [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) | 15 | Serverless API handlers |
| [Mongoose](https://mongoosejs.com/) | ^9.12.0 | MongoDB ODM |
| [MongoDB](https://www.mongodb.com/) | — | NoSQL document database |

### Dev Tools
| Technology | Purpose |
|---|---|
| ESLint + `eslint-config-next` | Code quality and linting |
| PostCSS | CSS processing |
| Turbopack | Fast bundler (dev & build) |

---

## 📂 Project Structure

```
temp-reservex/
├── public/                   # Static assets
├── scripts/                  # Utility / seed scripts
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # REST API route handlers
│   │   │   ├── clients/
│   │   │   ├── comments/
│   │   │   ├── dashboard/
│   │   │   ├── deliverables/
│   │   │   ├── milestones/
│   │   │   ├── payments/
│   │   │   ├── projects/
│   │   │   ├── reports/
│   │   │   ├── seed/
│   │   │   └── tasks/
│   │   ├── clients/          # Clients page + dynamic [id] route
│   │   ├── dashboard/        # Dashboard overview page
│   │   ├── deliverables/     # Deliverables page
│   │   ├── payments/         # Payments page
│   │   ├── projects/         # Projects page + dynamic [id] route
│   │   ├── reports/          # Reports page
│   │   ├── tasks/            # Tasks page
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home / redirect page
│   ├── components/           # Reusable React components
│   │   ├── clients/
│   │   ├── dashboard/
│   │   ├── deliverables/
│   │   ├── layout/           # Navbar
│   │   ├── payments/
│   │   ├── projects/
│   │   ├── reports/
│   │   ├── shared/           # Button, Dialog, Input, Select, StatusBadge, etc.
│   │   ├── tasks/
│   │   └── status-colors.ts
│   ├── context/              # React Context providers
│   ├── lib/                  # Utility helpers
│   │   ├── db.ts             # MongoDB connection helper
│   │   ├── seed.ts           # Database seed logic
│   │   └── utils.ts          # Shared utility functions
│   ├── models/               # Mongoose schemas / models
│   │   ├── Activity.ts
│   │   ├── Client.ts
│   │   ├── Comment.ts
│   │   ├── Deliverable.ts
│   │   ├── Milestone.ts
│   │   ├── Payment.ts
│   │   ├── Project.ts
│   │   ├── Task.ts
│   │   └── index.ts
│   ├── types/
│   │   └── index.ts          # Shared TypeScript type definitions
│   └── globals.css           # Global styles (Tailwind base)
├── .env.example              # Environment variable template
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── seed.js                   # Top-level seed entry point
└── tsconfig.json
```

---

## ⚙️ Installation

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x (or pnpm / yarn)
- A running **MongoDB** instance (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### 1. Clone the Repository

```bash
git clone https://github.com/Dharmi-456-design/Next-js-assignment.git
cd Next-js-assignment
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ **Never commit** `.env.local` or any file containing real credentials.

### 4. (Optional) Seed the Database

```bash
node seed.js
```

This populates MongoDB with sample clients, projects, tasks, milestones, deliverables, payments, and activities.

---

## 🚀 Development Commands

```bash
# Start development server (Turbopack)
npm run dev

# Build for production (Turbopack)
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

The development server starts at [http://localhost:3000](http://localhost:3000).

---

## 🧭 Usage

| Route | Description |
|---|---|
| `/dashboard` | Overview of active projects, tasks, and revenue |
| `/clients` | List, create, and view client profiles |
| `/clients/[id]` | Individual client detail page |
| `/projects` | All projects with status and deadline |
| `/projects/[id]` | Project detail: tasks, milestones, deliverables, payments |
| `/tasks` | Global task list across all projects |
| `/deliverables` | Track what has been delivered |
| `/payments` | Payment history and outstanding balances |
| `/reports` | Financial and project reports with charts |

API endpoints mirror these routes under `/api/` and follow RESTful conventions.

---

## 🔭 Future Improvements

- [ ] User authentication (NextAuth.js / Auth.js)
- [ ] Multi-user / team support with roles and permissions
- [ ] Email notifications for deadline reminders and payment confirmations
- [ ] Invoice PDF generation
- [ ] Client-facing portal for deliverable approval
- [ ] Real-time collaboration with WebSockets
- [ ] Mobile-responsive PWA support
- [ ] Dark mode theme

---

## 👤 Author

**Dharmi Patel**

| | |
|---|---|
| 🐙 GitHub | [@Dharmi-456-design](https://github.com/Dharmi-456-design) |
| 📧 Email | [dharmi.patel.cg@gmail.com](mailto:dharmi.patel.cg@gmail.com) |

---

<div align="center">

Made with ❤️ using Next.js, TypeScript, Tailwind CSS, and MongoDB

</div>

