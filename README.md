# FreelanceTrack - Freelancer Management System

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.15.0-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.17-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> 🚀 **Live Demo**: [Coming Soon - Deploy with Vercel]

A comprehensive, production-ready web application designed specifically for freelancers to manage their clients, projects, tasks, team members, and finances in one centralized platform. Built with modern technologies and best practices.

## 🚀 Features

### ✅ **Authentication & Security**
- Secure user registration and login
- JWT-based session management
- Protected routes and API endpoints

### ✅ **Client Management**
- Add, edit, and manage client profiles
- Store contact information, company details, and notes
- Track project count and relationship history

### 🔄 **Project Management** (In Development)
- Create and manage projects for clients
- Set budgets, hourly rates, and deadlines
- Track project progress and completion status

### 🔄 **Task Management** (In Development)
- Create tasks within projects
- Assign tasks to team members
- Track time spent and calculate costs
- Set priorities and due dates

### 🔄 **Financial Tracking** (In Development)
- Track incoming payments from clients
- Monitor outgoing payments to team members
- Generate invoices and payment reports
- Dashboard with revenue analytics

### 🔄 **Team Management** (In Development)
- Add and manage team members/subcontractors
- Track worker skills and hourly rates
- Monitor payments owed to team members

### ✅ **Dashboard & Analytics**
- Real-time statistics and metrics
- Recent activity feed
- Quick action shortcuts
- Revenue and project insights

## 📸 **Screenshots**

| Dashboard | Client Management | Invoice Generation |
|-----------|-------------------|--------------------|
| ![Dashboard](docs/dashboard.png) | ![Clients](docs/clients.png) | ![Invoices](docs/invoices.png) |

*Screenshots will be added after deployment*

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **Validation**: Zod schema validation
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd FreelanceTrack
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"

# App Configuration
NODE_ENV="development"
PORT=3000
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Create and sync database
npx prisma db push

# (Optional) View database in Prisma Studio
npx prisma studio
```

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📝 Usage Guide

### Getting Started
1. **Register**: Create your freelancer account at `/auth/signup`
2. **Login**: Access your dashboard at `/auth/signin`
3. **Add Clients**: Start by adding your first client
4. **Create Projects**: Set up projects for your clients
5. **Track Work**: Add tasks and monitor progress

### Navigation
- **Dashboard**: Overview of your business metrics
- **Clients**: Manage client relationships
- **Projects**: Handle project portfolios
- **Tasks**: Track work and deadlines
- **Finances**: Monitor payments and revenue
- **Team**: Manage subcontractors and employees

## 🗃️ Database Schema

The application uses the following main entities:

- **Users**: Freelancer profiles and authentication
- **Clients**: Client contact information and details
- **Projects**: Project information linked to clients
- **Tasks**: Individual work items within projects
- **Workers**: Team members and subcontractors
- **Payments**: Financial transactions (incoming/outgoing)

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected API routes
- User data isolation
- Input validation and sanitization

## 🚀 Production Deployment

### Environment Variables
Update your production `.env`:
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret-key"
NODE_ENV="production"
```

### Build and Deploy
```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Deployment Platforms
- **Vercel**: Optimized for Next.js applications
- **Netlify**: Static site deployment
- **Railway**: Full-stack deployment
- **DigitalOcean**: Custom server setup

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth.js handlers

### Clients
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/[id]` - Get specific client
- `PUT /api/clients/[id]` - Update client
- `DELETE /api/clients/[id]` - Delete client

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/activity` - Recent activity feed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Aaron George Abraham**
- Email: aarongeo1211@gmail.com
- Location: Bengaluru
- Skills: Full-stack Development, AI/ML, Cybersecurity

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Authentication system
- ✅ Client management
- ✅ Basic dashboard
- 🔄 Project management
- 🔄 Task tracking

### Phase 2 (Upcoming)
- 📝 Advanced financial reporting
- 📊 Time tracking integration
- 📧 Email notifications
- 📱 Mobile responsiveness
- 🔄 Team collaboration features

### Phase 3 (Future)
- 📈 Advanced analytics
- 🤖 AI-powered insights
- 📱 Mobile app
- 🔗 Third-party integrations
- 🌍 Multi-language support

## 🐛 Known Issues

- Project management features are still in development
- Financial tracking needs completion
- Team management requires implementation

## 📞 Support

For support, please email aarongeo1211@gmail.com or create an issue in the repository.

---

**FreelanceTrack** - Streamlining your freelance business management. 🚀