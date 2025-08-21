# 🚀 Doulitsa - Stack Migration Branch

> **Branch:** `stack-migration`  
> **Status:** 🚧 Active Development  
> **Migration:** Complete platform modernization from Strapi/Bootstrap to Next.js/shadcn

**Doulitsa** is a Greek freelancer marketplace undergoing complete platform modernization. This branch represents a full-stack migration from legacy Strapi backend + Bootstrap frontend to a modern Next.js application with shadcn/ui components and Tailwind CSS.

## 📋 Migration Overview

### Current → New Stack

| Component | Legacy | Modern | Benefits |
|-----------|--------|--------|----------|
| **Frontend** | Bootstrap 5 + Custom | Next.js 14 + shadcn/ui + Tailwind | 🎨 Modern design system, better DX |
| **Backend** | Strapi (Digital Ocean) | Server Actions + Better Auth | ⚡ Serverless-first, better TypeScript |
| **Database** | PostgreSQL (DO) | Neon PostgreSQL + Prisma | 💰 Serverless scaling, better ORM |
| **Auth** | Strapi Auth | Better Auth | 🎯 Custom flows, flexible user journeys |
| **Styling** | Bootstrap + Custom CSS | Tailwind CSS | 🎯 Utility-first, consistent design |
| **Components** | Custom Bootstrap | shadcn/ui | 🧩 Accessible, customizable, modern |
| **Storage** | Server uploads | Cloudinary | 📸 Client-side uploads, CDN optimization |
| **Deployment** | Digital Ocean | Vercel | 🌍 Edge deployment, auto-scaling |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js 14 Application                      │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   shadcn/ui     │ │  Tailwind CSS   │ │ Custom Features │   │
│  │   Components    │ │   Utilities     │ │   (Home/Admin)  │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │      Server Actions       │
                    │    (Better Auth + API)    │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │    Neon PostgreSQL       │
                    │     (Prisma ORM)         │
                    └───────────────────────────┘
```

## 🛠️ Tech Stack

### Core Framework
- **Next.js 14** with App Router and experimental features enabled
- **TypeScript** for type safety (strict mode disabled for migration compatibility)
- **React 19** with React Compiler enabled

### Styling & UI
- **Tailwind CSS** for utility-first styling with custom animations
- **shadcn/ui** component library with accessible, customizable components
- **Lucide React** for modern iconography
- **Custom CSS** for legacy component transitions

### Backend & Database  
- **Better Auth** for authentication with custom user flows and email verification
- **Prisma ORM** with modular schema files for maintainable database structure
- **Neon PostgreSQL** as serverless database with branching support
- **Server Actions** for type-safe server-side operations

### Key Libraries
- **React Hook Form + Zod** for form handling and robust validation
- **Cloudinary** for client-side media management and optimization
- **Date-fns** for date manipulation and formatting
- **Zustand** for lightweight client-side state management

## 🎯 User System

### User Types & Roles
- **Simple Users** (`role: 'user'`) - Browse and review services
- **Freelancers** (`role: 'freelancer'`) - Offer professional services  
- **Companies** (`role: 'company'`) - Business accounts with team features
- **Admins** (`role: 'admin'`) - Platform administration and management

### User Journey Flow
```
Registration → Email Verification → Onboarding (if professional) → Dashboard

Simple Users:    Registration → Email Verification → Dashboard
Freelancers:     Registration → Email Verification → Onboarding → Dashboard  
Companies:       Registration → Email Verification → Onboarding → Dashboard
```

### Authentication Steps
- `EMAIL_VERIFICATION` - Initial email confirmation via Better Auth
- `ONBOARDING` - Professional profile setup (freelancers/companies only)
- `DASHBOARD` - Active platform usage with full feature access

## 🔧 Development Setup

### Prerequisites
```bash
node >= 18.0.0
yarn >= 4.1.0
```

### Installation & Setup
```bash
# Clone and navigate to project
git clone <repository-url>
cd nextjs

# Install dependencies
yarn install

# Setup environment variables (see .env.example)
cp .env.example .env.development

# Generate Prisma client and push schema
yarn db:generate
yarn db:push

# Start development server
yarn dev
```

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Authentication
BETTER_AUTH_SECRET="your-secret"
BETTER_AUTH_URL="http://localhost:3000"

# Media Storage
CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"
```

## 📁 Project Structure

### App Router Structure
```
src/app/
├── (admin)/           # Admin-only routes with specialized layout
├── (auth)/            # Authentication pages (login, register, onboarding)
├── (dashboard)/       # User dashboard with nested layouts
├── (home)/            # Public marketing pages and home sections
├── api/               # API routes (Better Auth, webhooks, utilities)
└── [...not_found]/    # 404 fallback with custom error handling
```

### Key Directories
- `src/actions/` - Server Actions grouped by domain (auth, profiles, services, etc.)
- `src/components/` - React components with shadcn/ui integration and feature modules
- `src/lib/` - Utilities, configurations, and shared business logic
- `src/lib/prisma/schema/` - Modular Prisma schema files by domain
- `src/lib/auth/` - Better Auth configuration and integration
- `src/lib/validations/` - Zod schemas for comprehensive data validation

### Database Schema (Modular)
```
src/lib/prisma/schema/
├── auth.prisma        # Better Auth models and session management
├── user.prisma        # User profiles and role management  
├── service.prisma     # Service listings and categories
├── review.prisma      # Reviews, ratings, and feedback
├── chat.prisma        # Real-time messaging system
└── media.prisma       # File uploads and Cloudinary integration
```

## 🧩 Development Commands

### Database Operations
```bash
yarn db:generate      # Generate Prisma client with latest schema
yarn db:push          # Push schema changes to database (dev)
yarn db:migrate       # Run production migrations
yarn db:studio        # Open Prisma Studio for data management
yarn db:reset         # Reset database (development only)
```

### Build & Development
```bash
yarn dev              # Development server with hot reload
yarn build            # Production build (includes Prisma generate)
yarn start            # Production server
yarn lint             # ESLint with Next.js configuration
```

### Bundle Analysis
```bash
yarn analyze          # Full bundle analysis
yarn analyze:server   # Server bundle analysis
yarn analyze:browser  # Client bundle analysis
```

## 🏠 Recent Implementation: Modern Home Page

### New Home Components
The branch includes a complete modern home page implementation with 7 main sections:

- **Hero** - Landing section with integrated search functionality
- **Categories** - Featured service categories with responsive grid
- **Features** - Platform feature highlights with animations  
- **Services** - Showcase of top services with media display
- **Freelancers** - Featured freelancer profiles
- **Testimonials** - Customer reviews and social proof
- **Taxonomies** - Complete service taxonomy navigation

### New UI Components
- `CarouselPagination` - Interactive dots for carousel navigation
- `HomeSearch` - Specialized search with Greek localization
- `MediaDisplay` - Flexible component for images/videos with carousel support

### Design System Enhancements
- Added `third` color utility for brand consistency
- Custom `bounce-x` and `bounce-y` animations with 6s timing
- Semantic HTML improvements (header, main, footer elements)
- Fixed header height (h-20) with proper spacing

## 🎨 Key Development Patterns

### Server Actions
Located in `src/actions/` with domain-based organization. Consistent error handling and Zod validation:

```typescript
// src/actions/auth/login.ts
import { z } from 'zod';
import { loginSchema } from '@/lib/validations/auth';

export async function loginAction(data: z.infer<typeof loginSchema>) {
  // Server action implementation
}
```

### Form Handling
All forms use React Hook Form with Zod validation for type safety:

```typescript
// Consistent form pattern
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {...}
});
```

### Database Access
Always use Prisma client with proper error handling:

```typescript
import { prisma } from '@/lib/prisma/client';

const user = await prisma.user.findUnique({
  where: { id },
  include: { profile: true }
});
```

### Media Uploads
Client-side uploads using Cloudinary components:

```typescript
import { MediaUpload } from '@/components/upload';

<MediaUpload
  onUpload={(result) => setImageUrl(result.secure_url)}
  options={{ folder: 'profiles' }}
/>
```

## 🚀 Performance Optimizations

### Next.js Configuration
- **React Compiler** enabled for automatic optimizations
- **Bundle analysis** tools for monitoring size
- **Image optimization** with Cloudinary remote patterns
- **Server Actions** with 20MB body size limit for file uploads

### Bundle Management
- Package import optimization for common libraries
- CSS inlining and optimization for critical styles
- Automatic code splitting by route and component

## 📝 Migration Status

### ✅ Completed
- **Core Infrastructure** - Next.js 14, TypeScript, Tailwind setup
- **Authentication System** - Better Auth with email verification flows
- **Database Migration** - Neon PostgreSQL with Prisma ORM
- **Component System** - shadcn/ui integration with custom components
- **Home Page** - Complete modern landing experience
- **User Management** - Registration, onboarding, and dashboard layouts
- **Admin Panel** - Management interface with specialized components

### 🚧 In Progress
- Service creation and management workflows
- Real-time chat system integration
- Advanced search and filtering
- Payment system integration

### 📋 Planned
- Legacy component migration completion
- Performance optimization phase
- SEO and analytics integration
- Production deployment pipeline

## 🔍 Key Files & Configurations

### Configuration Files
- `next.config.js` - Next.js configuration with optimizations
- `tailwind.config.js` - Extended theme with custom colors and animations
- `components.json` - shadcn/ui configuration
- `CLAUDE.md` - AI development assistant instructions

### Path Aliases
```typescript
// Configured in tsconfig.json
"@/*": ["./src/*"]
"@/components/*": ["./src/components/*"]
"@/lib/*": ["./src/lib/*"]
"@/actions/*": ["./src/actions/*"]
// ... and more
```

## 📊 Development Guidelines

### Code Style
- **TypeScript strict mode** disabled for migration compatibility
- **ESLint** with Next.js recommended configuration
- **Prettier** for consistent formatting (configured in project)

### Component Patterns  
- Prefer **Server Components** by default
- Use **'use client'** directive only when necessary
- Follow **shadcn/ui patterns** for consistency
- Implement **proper error boundaries** and loading states

### Database Best Practices
- Always run `yarn db:generate` after schema changes
- Use **Prisma transactions** for complex operations
- Implement **proper indexes** for query performance
- Follow **modular schema structure** by domain

## 🤝 Contributing

This is an active migration branch. When contributing:

1. **Follow existing patterns** in the new components over legacy code
2. **Use TypeScript** with proper typing for new features  
3. **Implement shadcn/ui** components over custom Bootstrap components
4. **Test thoroughly** as TypeScript strict mode is disabled
5. **Document changes** in commit messages clearly

## 📄 License

All rights reserved - Doulitsa Platform © 2025