# Investment Management Platform

A full-stack investment management platform built with Next.js 15, MongoDB, and NextAuth. Manage businesses, investors, and track investments with role-based access control.

## 🚀 Features

### Admin Panel
- **Dashboard** - Overview of all businesses, investors, and investments with analytics
- **All Businesses** - Manage all businesses on the platform
- **My Businesses** - Manage businesses owned by admin
- **Investors** - Manage investor accounts and KYC
- **My Investments** - Track personal investments in other companies
- **Analytics** - Visual reports and performance metrics
- **Settings** - Platform configuration

### Investor Panel
- **Dashboard** - Portfolio overview with P&L tracking
- **My Investments** - View all personal investments (read-only)
- **Settings** - Profile and account management

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router), React, TypeScript
- **Styling:** Tailwind CSS + ShadCN UI
- **Database:** MongoDB with Mongoose
- **Authentication:** NextAuth.js (JWT-based)
- **Charts:** Recharts
- **State Management:** SWR for data fetching

## Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Setup Environment
Create `.env.local` file (already created with defaults):
```
MONGODB_URI=mongodb://localhost:27017/investment-manager
NEXTAUTH_SECRET=your-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

### 3. Start MongoDB
```bash
# Install MongoDB if not installed
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

### 4. Seed Database
```bash
pnpm add -D tsx
pnpm seed
```

This creates test accounts:
- **Admin**: admin@test.com / Admin123!
- **Investor**: investor@test.com / Investor123!

### 5. Run Development Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

### Admin Panel
- Dashboard with analytics
- Business management
- Investor management
- Personal investments tracking
- Reports & analytics
- Settings & configuration

### Investor Panel
- Investment portfolio
- Business details
- Document management
- Reports & analysis

## 💻 Installation

### Prerequisites
- Node.js 18+ and pnpm
- MongoDB (local or Atlas)

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/kakkadpriyansh/investment-manager.git
cd investment-manager
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Configure environment variables**

Create `.env.local` file:
```env
MONGODB_URI=mongodb://localhost:27017/investment-manager
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

4. **Start MongoDB**
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or use MongoDB Atlas cloud database
```

5. **Seed the database**
```bash
pnpm add -D tsx
pnpm seed
```

This creates test accounts:
- **Admin:** admin@test.com / Admin123!
- **Investor:** investor@test.com / Investor123!

6. **Run development server**
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📚 Project Structure

```
/app
  /admin          # Admin panel routes
  /investor       # Investor panel routes
  /api            # API routes
/components       # Reusable UI components
/models           # MongoDB schemas
/lib              # Utilities and helpers
```

## 🔐 User Roles

| Role | Access |
|------|--------|
| **ADMIN** | Full access to all features, manage businesses, investors, and investments |
| **INVESTOR** | Read-only access to personal investments and profile |

## 📦 Database Models

- **User** - Authentication and role management
- **Business** - Company information and ownership
- **Investment** - Investment records with P&L tracking
- **Project** - Business projects and milestones
- **Document** - File attachments and KYC documents

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

```env
MONGODB_URI=your-mongodb-atlas-uri
NEXTAUTH_SECRET=generate-secure-secret
NEXTAUTH_URL=https://your-domain.com
```

## 📝 License

MIT License

## 👤 Author

Priyansh Kakkad
- GitHub: [@kakkadpriyansh](https://github.com/kakkadpriyansh)
