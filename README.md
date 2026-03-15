# Expense Approval System

---

## Website URL

Website Link: [https://expense-approval-system-client-kzmvuqrps.vercel.app/](https://expense-approval-system-client-kzmvuqrps.vercel.app/)

---

📌 Overview

## Overview

A web-based platform for company expense management and approval workflows. It helps organizations manage employee expenses, multi-step approvals, and audit trails with role-based access and company-level data isolation.

Built with the PERN stack (PostgreSQL, Express, React, Node.js) and focused on clear approval chains and visibility for both employees and approvers.

---

## Problem

In many organizations, expense management is still handled through:

- Email chains and ad-hoc requests
- Spreadsheets with no single source of truth
- Unclear approval chains and delayed decisions
- No structured audit trail

This leads to:

- Lack of transparency
- Delayed or lost approvals
- Poor tracking and reporting
- Difficulty scaling across teams

---

## Solution

This system provides a structured, role-based platform where:

- **Employees** submit expenses (amount, currency, category), keep drafts, and submit for approval.
- **Managers** and **Admins** review and approve or reject in a defined order (Manager → Admin).
- All actions are tracked with a full approval history and audit trail.
- The expense lifecycle is explicit: Draft → In Review → Approved or Rejected.
- Data is isolated by company so multi-tenant use is safe.

---

## User Roles

**Employee**

- Create and manage expense requests
- Use **Draft** to edit or delete before submitting
- Submit expenses for approval
- View personal expense list and status (Draft, In Review, Approved, Rejected)
- View expense detail and approval timeline

**Manager**

- Everything an Employee can do for their own expenses
- View **Pending approvals** where they are the first approver
- Approve or reject with an optional comment
- View approval history for expenses they act on

**Admin**

- View all expenses in the company (read-only list)
- Act as the second approver (after Manager) on the approval chain
- Approve or reject with optional comment
- Full visibility into company expenses for auditing

---

## Expense Lifecycle

**Draft → Submitted (In Review) → Approved / Rejected**

| State      | Description |
|-----------|-------------|
| **Draft** | Editable and deletable; visible only to the creator. |
| **In Review** | Submitted; locked from editing; moves through Manager then Admin. |
| **Approved / Rejected** | Final state; stored for audit and reporting. |

Approval order: **Manager** (step 1) → **Admin** (step 2). Both must approve for an expense to be fully approved; any rejection ends the flow.

---

## Security & Access Control

- Role-based access (Employee, Manager, Admin) enforced on the backend
- Company-level data isolation (users only see data for their company)
- Draft expenses visible only to the creator
- Backend-enforced authorization on every API request
- No self-approval: approval steps are defined by role, not by user identity

---

## Technology Stack

**Backend**

- Node.js & Express.js
- PostgreSQL (e.g. Neon) & Prisma ORM
- TypeScript
- Zod (validation)

**Frontend**

- React (Vite)
- TypeScript
- React Router, Zustand
- Lucide React (icons)

---

## Key Features

- **My Expenses:** Create drafts, submit for approval, filter by status (All, Draft, In Review, Approved, Rejected).
- **Pending Approvals:** For Managers and Admins, list of expenses waiting for their action.
- **Expense Detail & Timeline:** Full approval history and comments per step.
- **Dashboard:** Summary of your expenses and (for approvers) pending count.
- **Company-scoped data:** All queries filtered by company for multi-tenant safety.
- **Docker support:** Dev and prod Compose setups; Prisma migrations and seed run in container.

---

## Environment & Setup

- **Root:** `cp .env.example .env` — used by Docker Compose (optional for local run).
- **server:** `cp server/.env.example server/.env` — set `DATABASE_URL` to your PostgreSQL connection string (e.g. Neon). Never commit `.env`.
- **client:** `cp client/.env.example client/.env` — set `VITE_API_URL` to your backend API URL when frontend and API are on different origins (e.g. Vercel). Never commit `.env`.

All `.env` files are gitignored. Use Vercel (or your host) Environment Variables for production; do not put real secrets in the repo.

---

## Vercel Build Settings

**Client (frontend)** — Root: `client` | Build: `npm run build` | Output: `dist`

**Server (backend)** — Root: `server` | Build: `npm run build` | Output: `dist`

Set `DATABASE_URL` in the server project’s environment variables. Set `VITE_API_URL` in the client project if the API is on a different domain.

---

## Docker (optional)

- **Dev:** `docker-compose -f docker-compose.dev.yml up -d` — Postgres + hot-reload server and client; migrations applied on start.
- **Prod-like:** `docker-compose -f docker-compose.yml up -d --build` — Built images; React served via nginx; API proxied to Node.

See `docs/docker/README.md` for details.
