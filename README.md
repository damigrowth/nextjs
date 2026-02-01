# 🚀 Doulitsa - Modern Greek Freelancer Marketplace

> **Branch:** `main`
> **Status:** 🚧 Active Development
> **Migration:** Complete platform modernization from Strapi/Bootstrap to Next.js/shadcn/ui

**Doulitsa** is a comprehensive Greek freelancer marketplace platform connecting professionals, companies, and service consumers. The project represents a complete full-stack migration from legacy Strapi backend + Bootstrap frontend to a modern Next.js 15 application with React 19, shadcn/ui components, and Tailwind CSS.

## 📋 Migration Overview

### Stack Transformation

| Component      | Legacy                 | Modern                            | Benefits                                 |
| -------------- | ---------------------- | --------------------------------- | ---------------------------------------- |
| **Frontend**   | Bootstrap 5 + Custom   | Next.js 15 + shadcn/ui + Tailwind | 🎨 Modern design system, better DX       |
| **Backend**    | Strapi (Digital Ocean) | Server Actions + Better Auth      | ⚡ Serverless-first, better TypeScript   |
| **Database**   | PostgreSQL (DO)        | Supabase PostgreSQL + Prisma      | 💰 Serverless scaling, better ORM        |
| **Auth**       | Strapi Auth            | Better Auth v1.3                  | 🎯 Custom flows, flexible user journeys  |
| **Styling**    | Bootstrap + Custom CSS | Tailwind CSS v3                   | 🎯 Utility-first, consistent design      |
| **Components** | Custom Bootstrap       | shadcn/ui (Radix UI)              | 🧩 Accessible, customizable, modern      |
| **Storage**    | Server uploads         | Cloudinary                        | 📸 Client-side uploads, CDN optimization |
| **Deployment** | Digital Ocean          | Vercel Edge                       | 🌍 Edge deployment, auto-scaling         |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   Next.js 15 Application                        │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   shadcn/ui     │ │  Tailwind CSS   │ │ Custom Features │   │
│  │  (Radix UI)     │ │   Utilities     │ │   (Home/Admin)  │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │      Server Actions       │
                    │   (Better Auth + API)     │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │   Supabase PostgreSQL     │
                    │      (Prisma ORM)         │
                    └───────────────────────────┘
```

## 🛠️ Tech Stack

### Core Framework

- **Next.js 15** with App Router and experimental features
  - React Compiler enabled for automatic optimizations
  - Server Actions with 20MB body limit
  - Bundle analysis tools integrated
- **React 19** with automatic memoization via React Compiler
- **TypeScript 5.9.3** (strict mode disabled for migration compatibility)

### Styling & UI

- **Tailwind CSS 3** with custom theme extensions
  - 20+ custom colors with semantic naming
  - Custom animations: `bounce-x`, `bounce-y`, `slide-in`, `fade-in`, `fade-cycle`
  - Extended spacing and border radius utilities
  - Dark mode support via `next-themes`
  - Container queries support
- **shadcn/ui** component library built on Radix UI
  - 19+ Radix UI primitives integrated
  - Fully accessible and customizable
  - Dark mode compatible
- **Lucide React** for modern iconography (546+ icons)

### Backend & Database

- **Better Auth v1.3.26** for authentication
  - Email/password with bcrypt (12 rounds)
  - OAuth providers (Google, extensible)
  - Email verification flows
  - JWT support with JWKS
  - API Key authentication
  - Admin and role-based plugins
  - Session management with 2-minute cookie cache
- **Prisma ORM v6.15** with PostgreSQL
  - Modular schema organization (11 domain files)
  - JSON types generator integration
  - Comprehensive indexing for performance
  - Connection pooling with direct URL
- **Supabase PostgreSQL** for production database
  - Serverless scaling
  - Real-time subscriptions ready
  - Auto-backups and point-in-time recovery

### Key Libraries

- **React Hook Form + Zod** - Form handling with validation (100+ schemas)
- **Cloudinary + next-cloudinary** - Media management and optimization
- **Date-fns** - Date manipulation and formatting
- **Zustand** - Lightweight client-side state management
- **SWR** - Data fetching with caching
- **TanStack React Table** - Complex data tables (admin)
- **Recharts** - Data visualization (admin dashboards)
- **Embla Carousel** - Carousel functionality
- **Brevo (Sendinblue)** - Transactional email service
- **DnD Kit** - Drag-and-drop functionality
- **Sonner** - Toast notifications

## 🎯 User System

### User Types & Roles

- **Simple Users** (`role: 'user', type: 'user'`) - Browse and review services
- **Freelancers** (`role: 'freelancer', type: 'pro'`) - Offer professional services
- **Companies** (`role: 'company', type: 'pro'`) - Business accounts with team features
- **Admins** (`role: 'admin'`) - Platform administration and management

### User Journey Flow

```
EMAIL REGISTRATION:
Register → Email Verification → Dashboard (user) | Onboarding (pro) → Dashboard

OAUTH REGISTRATION:
OAuth → Onboarding Selection → Dashboard | Onboarding → Dashboard
```

### Authentication Steps

- **EMAIL_VERIFICATION** - Initial email confirmation via Better Auth
- **OAUTH_SETUP** - OAuth device persistence and profile selection
- **ONBOARDING** - Professional profile setup (freelancers/companies only)
- **DASHBOARD** - Active platform usage with full feature access

### User Features

- Multi-provider authentication (email, Google OAuth)
- Email verification workflow with Brevo
- User blocking and privacy controls
- Profile customization with media galleries
- Service creation and management
- Real-time chat messaging
- Review and rating system
- Saved services and profiles bookmarking

## 🔧 Development Setup

### Prerequisites

```bash
Node >= 18.0.0
Yarn >= 4.1.0 (strict package manager enforced)
```

### Installation & Setup

```bash
# Clone and navigate to project
git clone <repository-url>
cd nextjs

# Install dependencies
yarn install

# Setup environment variables
cp .env.example .env.local

# Generate Prisma client and push schema
yarn db:generate
yarn db:push

# Start development server
yarn dev
```

### Environment Variables

**Required:**

```bash
# Database (Supabase/Neon)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Authentication
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# Media Storage
CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"
```

**Optional:**

```bash
# OAuth Providers
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# GitHub Integration (Taxonomy Management)
GITHUB_TOKEN="ghp_..."
GITHUB_OWNER="damigrowth"
GITHUB_REPO="nextjs"
GITHUB_DEFAULT_BRANCH="datasets"
GITHUB_COMPARISON_BRANCH="main"

# Email Service
BREVO_API_KEY="your-brevo-key"

# Analytics
GA_ID="G-XXXXXXXXXX"

# reCAPTCHA
RECAPTCHA_SITE_KEY="your-site-key"
RECAPTCHA_SECRET_KEY="your-secret-key"
```

See `.env.example` for complete configuration template.

## 📁 Project Structure

### App Router Structure (Route Groups)

```
src/app/
├── (admin)/           # Admin-only routes with specialized layout
│   └── admin/         # Taxonomy management, moderation, analytics
├── (archives)/        # Public listing pages
│   ├── (pro)/        # Professional directory (/dir, /companies, /pros)
│   └── (services)/   # Service listings (/ipiresies, /categories)
├── (auth)/            # Authentication flows
│   ├── login/        # Email login
│   ├── register/     # Registration with type selection
│   ├── onboarding/   # Professional profile setup
│   └── oauth-setup/  # OAuth configuration
├── (dashboard)/       # User dashboard (protected)
│   └── dashboard/    # Main dashboard with nested routes
├── (home)/            # Marketing/public pages
│   └── page.tsx      # Modern home page with 7 sections
├── (pages)/           # Static pages (about, contact, faq, etc.)
├── (profile)/         # Professional/freelancer profiles
├── (service)/         # Individual service detail pages
├── (sitemap)/         # XML sitemaps for SEO
├── api/               # API routes
│   ├── auth/         # Better Auth endpoints
│   └── webhooks/     # External service webhooks
└── [...not_found]/   # 404 fallback with custom error handling
```

### Key Directories

| Directory                      | Purpose                                              |
| ------------------------------ | ---------------------------------------------------- |
| `src/actions/`                 | Server Actions by domain (auth, profiles, services) |
| `src/components/`              | React components with shadcn/ui integration          |
| `src/lib/`                     | Core utilities and shared business logic             |
| `src/lib/prisma/schema/`       | Modular Prisma schema files (11 domain files)        |
| `src/lib/auth/`                | Better Auth configuration and permissions            |
| `src/lib/validations/`         | Zod validation schemas (100+ schemas)                |
| `src/lib/types/`               | TypeScript type definitions                          |
| `src/constants/datasets/`      | Taxonomy data and pre-built maps                     |
| `scripts/`                     | Migration scripts from Strapi                        |

### Database Schema (Modular Design)

11 Prisma schema files organized by domain:

```
src/lib/prisma/schema/
├── schema.prisma       # Generators & datasource configuration
├── auth.prisma         # Better Auth models (Session, Account, Verification, Jwks, ApiKey)
├── user.prisma         # User profiles and role management
├── service.prisma      # Service listings with taxonomies
├── review.prisma       # Reviews, ratings, and feedback system
├── chat.prisma         # Real-time messaging (Chat, Message, ChatMember)
├── media.prisma        # File uploads and Cloudinary integration
├── email.prisma        # Email tracking (EmailBatch, EmailTemplate)
├── admin.prisma        # Admin-specific models and functionality
└── saved.prisma        # User bookmarks (SavedService, SavedProfile)
```

#### Key Database Models

**User Model:**

- Multi-role system: `user`, `freelancer`, `company`, `admin`
- User types: `user` (simple), `pro` (professional)
- Journey steps for onboarding tracking
- Email verification and account confirmation
- User banning system with expiration
- 8+ performance indexes

**Service Model:**

- Complete CRUD with draft/published states
- Service taxonomies (category/subcategory/subdivision/tags)
- Pricing models (fixed, hourly, subscription, per-case)
- JSON fields for addons, FAQ, media
- Rating & review aggregation
- Normalized fields for accent-insensitive search (Greek)
- 10+ composite indexes for query optimization

**Chat System:**

- Real-time messaging infrastructure
- Chat members with online status tracking
- Message threading with reply support
- Soft deletes with audit trail
- Message reactions (JSON stored)
- Muting and blocking capabilities

## 🧩 Development Commands

### Database Operations

```bash
yarn db:generate      # Generate Prisma client from schema
yarn db:push          # Push schema changes to database (dev)
yarn db:migrate       # Run production migrations
yarn db:studio        # Open Prisma Studio for data management
yarn db:reset         # Reset database (development only)
```

### Build & Development

```bash
yarn dev              # Development server with hot reload (Turbo)
yarn build            # Production build (includes Prisma generate + taxonomy compilation)
yarn start            # Production server
yarn lint             # ESLint with Next.js configuration
```

### Bundle Analysis

```bash
yarn analyze          # Full bundle analysis
yarn analyze:server   # Server bundle analysis
yarn analyze:browser  # Client bundle analysis
```

### Migration Scripts (from Strapi)

```bash
yarn migrate:users              # Migrate users from Strapi
yarn migrate:profiles           # Migrate profile data
yarn migrate:services           # Migrate service listings
yarn migrate:taxonomy-images    # Migrate taxonomy images
yarn migrate:check:roles        # Verify role assignments
```

## ✨ Key Features Implemented

### 1. User Management

- Multi-type registration (simple users, freelancers, companies)
- Email verification with Brevo transactional emails
- OAuth integration (Google, extensible to others)
- User blocking and privacy controls
- Profile customization with media galleries
- Admin impersonation for support

### 2. Service Marketplace

- Service creation with rich taxonomy system
- Multiple pricing models (fixed, hourly, subscription, per-case)
- Service add-ons and FAQ support
- Media galleries with Cloudinary CDN
- Featured service highlighting
- Service status workflow (draft → pending → published/rejected)
- Service refresh/boost functionality
- Normalized search for Greek characters (accent-insensitive)

### 3. Rating & Reviews System

- Service reviews with star ratings
- Freelancer/profile reviews
- Aggregated ratings with composite indexes
- Review publishing controls
- Rating-based sorting and filtering
- Review moderation (admin)

### 4. Real-time Chat

- One-on-one messaging infrastructure
- Message reactions support
- Message threading (replies)
- Soft delete with audit trail
- Online status tracking
- Unread message notifications
- Chat member management
- Message muting/blocking

### 5. Admin Dashboard

- **Taxonomy Management** (Git-based workflow)
  - Create/edit service taxonomies
  - GitHub integration for version control
  - Draft system with localStorage
  - Batch publishing to Git
- **Content Moderation**
  - Service approval/rejection
  - Review moderation
  - User management and banning
- **Analytics** (with Recharts)
  - Data tables with TanStack React Table
  - Data visualization dashboards
  - Export capabilities

### 6. Search & Discovery

- Full-text search with normalization (Greek)
- Taxonomy-based filtering
- Price range filtering
- Featured services showcase
- Advanced sorting options
- Search history tracking

### 7. User Preferences

- Saved services bookmarking
- Saved profiles bookmarking
- Service search history
- Notification preferences

### 8. Modern Home Page

Complete landing experience with 7 sections:

- **Hero** - Landing with integrated search
- **Categories** - Featured service categories
- **Features** - Platform highlights with animations
- **Services** - Top services showcase
- **Freelancers** - Featured freelancer profiles
- **Testimonials** - Customer reviews and social proof
- **Taxonomies** - Complete service taxonomy navigation

## 🎨 Development Patterns

### Server Actions (Typed & Validated)

Located in `src/actions/` with domain-based organization:

```typescript
// src/actions/[domain]/[action].ts
import { z } from 'zod';
import { actionSchema } from '@/lib/validations/[domain]';

export async function myAction(data: z.infer<typeof actionSchema>) {
  // Validation happens automatically via Zod resolver
  // Server action implementation with type safety
}
```

### Form Handling (React Hook Form + Zod)

All forms use React Hook Form with Zod validation:

```typescript
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  mode: 'onChange',
  defaultValues: { ... }
});
```

### Database Access (Prisma)

Always use Prisma client with proper error handling:

```typescript
import { prisma } from '@/lib/prisma/client';

const user = await prisma.user.findUnique({
  where: { id },
  include: {
    profile: true,
    services: true,
  },
});
```

### Media Uploads (Cloudinary)

Client-side uploads using next-cloudinary components:

```typescript
import { MediaUpload } from '@/components/media';

<MediaUpload
  onUpload={(result) => setValue('image', result.secure_url)}
  folder="profiles"
  maxFiles={5}
/>
```

### Component Architecture

- **Prefer Server Components** by default
- Use **'use client'** directive only when necessary (hooks, events, state)
- Follow **shadcn/ui patterns** for consistency
- Implement **proper error boundaries** and loading states
- Use **route groups** for layout organization

## 🚀 Performance Optimizations

### Build-time

- **React Compiler** enabled for automatic optimizations
- **Package import optimization** for common libraries (25+ packages)
- **CSS inlining** and optimization for critical styles
- **Code splitting** by route and component
- **20MB Server Action** body limit for file uploads
- **Bundle analysis** tools for monitoring size

### Runtime

- **Image optimization** via Cloudinary (WebP, responsive)
- **Cache TTL:** 31 days for static assets
- **Compression** enabled (Gzip/Brotli)
- **ETags** for smart caching
- **X-DNS-Prefetch** enabled for faster external resource loading

### Database

- **10+ performance indexes** per table
- **Composite indexes** for common queries
- **Query result caching** with SWR
- **Connection pooling** for optimal performance
- **Normalized fields** for accent-insensitive search (Greek)

## 🏗️ Notable Implementation Details

### 1. Taxonomy System (Git-based Workflow)

- Pre-built taxonomy maps generated at build time
- Admin management via GitHub integration
- Draft system with localStorage (7-day TTL)
- Batch publishing workflow
- Version control for all taxonomy changes
- Automated PR creation and management

### 2. Greek Localization

- Normalized search fields for accent-insensitive queries
- Custom normalization function for Greek characters
- Dual-field indexing (original + normalized)
- Full-text search optimization

### 3. Modular Schema Design

- 11 schema files organized by domain
- Easier maintenance and collaboration
- Clear separation of concerns
- Reduced merge conflicts

### 4. Email System (Brevo)

- Transactional email integration
- Workflow email system
- List management for segmentation
- Email templates (verification, welcome, password reset)
- Email tracking (EmailBatch, EmailTemplate models)

### 5. Admin Permission System

- Role-based access control (admin, support, editor)
- Permission management with access levels
- Admin impersonation for support
- API key authentication for automation

### 6. Session Management

- 2-minute cookie cache for fast auth updates
- 24-hour "fresh age" for session operations
- Secure cookies in production
- Cross-subdomain cookie support

## 📊 Development Guidelines

### Code Style

- **TypeScript strict mode** disabled for migration, but strict typing encouraged
- **ESLint** with Next.js + React/Hooks plugins
- **Prettier** for consistent formatting

### Component Patterns

- Prefer **Server Components** by default
- Use **'use client'** only for interactivity
- Follow **shadcn/ui patterns** for UI consistency
- Implement **error boundaries** and loading states
- Use **route groups** for semantic organization

### Database Best Practices

- Always run **`yarn db:generate`** after schema changes
- Use **Prisma transactions** for complex operations
- Implement **proper indexes** for query performance
- Follow **modular schema structure** by domain
- Use **include** for relations, **select** for optimization

### Path Aliases (tsconfig.json)

```typescript
"@/*": ["./src/*"]
"@/components/*": ["./src/components/*"]
"@/lib/*": ["./src/lib/*"]
"@/actions/*": ["./src/actions/*"]
// ... 20+ aliases configured
```

## 📝 Migration Status

### ✅ Completed

- **Core Infrastructure** - Next.js 15, React 19, TypeScript
- **Authentication System** - Better Auth with email + OAuth flows
- **Database Migration** - Supabase PostgreSQL with Prisma ORM
- **Component System** - shadcn/ui integration with custom components
- **Home Page** - Complete modern landing experience (7 sections)
- **User Management** - Registration, onboarding, dashboard layouts
- **Admin Panel** - Management interface with taxonomy workflow
- **Service System** - Creation, management, taxonomies
- **Review System** - Ratings and feedback functionality
- **Chat Infrastructure** - Real-time messaging models
- **Email Integration** - Brevo transactional emails

### 🚧 In Progress

- Service creation/management UI workflows
- Real-time chat WebSocket integration
- Advanced search optimization
- Payment system integration
- Mobile responsive refinements

### 📋 Planned

- Legacy component migration completion
- Performance optimization phase
- SEO and analytics integration
- Production deployment pipeline
- Mobile app (React Native)
- Advanced analytics dashboard

## 🔍 Key Files & Configurations

### Configuration Files

| File                    | Purpose                                          |
| ----------------------- | ------------------------------------------------ |
| `next.config.js`        | Next.js optimization, headers, redirects, images |
| `tailwind.config.js`    | Extended theme, animations, custom utilities     |
| `tsconfig.json`         | TypeScript config with 20+ path aliases          |
| `components.json`       | shadcn/ui configuration                          |
| `package.json`          | Dependencies (180+ packages) and scripts         |
| `CLAUDE.md`             | AI development assistant instructions            |
| `.env.example`          | Environment variable template                    |

### Important Directories

- **`src/actions/`** - Server Actions (11 domains)
- **`src/components/`** - React components (15+ categories)
- **`src/lib/prisma/schema/`** - Database schemas (11 files)
- **`src/lib/validations/`** - Zod schemas (100+ schemas)
- **`src/constants/datasets/`** - Taxonomy data

## 🤝 Contributing

This is an active migration branch. When contributing:

1. **Follow existing patterns** - Use new Next.js/shadcn patterns over legacy code
2. **Use TypeScript** - Proper typing for all new features
3. **Implement shadcn/ui** - Use shadcn components over custom Bootstrap
4. **Test thoroughly** - TypeScript strict mode is disabled, extra care needed
5. **Document changes** - Clear commit messages following conventions
6. **Read CLAUDE.md** - Development guidelines and architecture docs

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: your feature description"

# Push and create PR
git push origin feature/your-feature
```

## 📦 Deployment

**Platform:** Vercel (Edge Runtime, Auto-scaling)

**Build Pipeline:**

1. Taxonomy map generation
2. Prisma client generation
3. Next.js production build
4. Asset optimization and compression

**Environment Strategy:**

- **Production:** `doulitsa.gr`
- **Preview:** Vercel preview domains
- **Development:** `localhost:3000`

## 📄 License

All rights reserved - Doulitsa Platform © 2025

---

## 🆘 Support & Resources

- **Documentation:** See `CLAUDE.md` for detailed development guidelines
- **Architecture:** Comprehensive app architecture documented in CLAUDE.md
- **Database Schema:** Explore with `yarn db:studio`
- **Component Library:** [shadcn/ui documentation](https://ui.shadcn.com)
- **Framework:** [Next.js 15 documentation](https://nextjs.org/docs)

## 📊 Project Stats

- **180+ npm packages** - Modern tech stack
- **100+ Zod schemas** - Comprehensive validation
- **20+ path aliases** - Clean imports
- **11 database domains** - Modular schema
- **15+ component categories** - Organized components
- **7 home sections** - Complete landing experience
- **4 user roles** - Flexible permission system
