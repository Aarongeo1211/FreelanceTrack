// Database model types based on Prisma schema
export interface User {
  id: string
  email: string
  name: string
  password: string
  role: 'FREELANCER' | 'ADMIN'
  createdAt: Date
  updatedAt: Date
}

export interface Client {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  company?: string | null
  address?: string | null
  notes?: string | null
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  createdAt: Date
  updatedAt: Date
  userId: string
}

export interface Project {
  id: string
  name: string
  description?: string | null
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED'
  startDate?: Date | null
  endDate?: Date | null
  budget?: number | null
  hourlyRate?: number | null
  totalCost: number
  paidAmount: number
  createdAt: Date
  updatedAt: Date
  userId: string
  clientId: string
}

export interface Task {
  id: string
  title: string
  description?: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  estimatedHours?: number | null
  actualHours: number
  hourlyRate?: number | null
  cost: number
  dueDate?: Date | null
  completedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  userId: string
  projectId: string
  assignedToId?: string | null
}

export interface Worker {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  skills?: string | null
  hourlyRate?: number | null
  totalEarned: number
  totalPaid: number
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  joinedAt: Date
  createdAt: Date
  updatedAt: Date
  userId: string
}

export interface Payment {
  id: string
  amount: number
  type: 'INCOMING' | 'OUTGOING'
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  description?: string | null
  dueDate?: Date | null
  paidDate?: Date | null
  createdAt: Date
  updatedAt: Date
  userId: string
  clientId?: string | null
  projectId?: string | null
  workerId?: string | null
}

// Extended types with relations
export type UserWithRelations = User & {
  clients: Client[]
  projects: ProjectWithRelations[]
  tasks: TaskWithRelations[]
  workers: Worker[]
  payments: Payment[]
}

export type ClientWithRelations = Client & {
  projects: ProjectWithRelations[]
  payments: Payment[]
  user: User
}

export type ProjectWithRelations = Project & {
  client: Client
  user: User
  tasks: TaskWithRelations[]
  payments: Payment[]
}

export type TaskWithRelations = Task & {
  project: ProjectWithRelations
  user: User
  assignedTo?: Worker
}

export type WorkerWithRelations = Worker & {
  user: User
  tasks: TaskWithRelations[]
  payments: Payment[]
}

export type PaymentWithRelations = Payment & {
  user: User
  client?: Client
  project?: Project
  worker?: Worker
}

// Dashboard stats
export interface DashboardStats {
  totalClients: number
  activeProjects: number
  pendingTasks: number
  totalRevenue: number
  pendingPayments: number
  totalWorkers: number
  monthlyRevenue: number
  completedTasksThisMonth: number
}

// Chart data
export interface ChartData {
  month: string
  revenue: number
  expenses: number
  profit: number
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface ClientForm {
  name: string
  email?: string
  phone?: string
  company?: string
  address?: string
  notes?: string
}

export interface ProjectForm {
  name: string
  description?: string
  clientId: string
  budget?: number
  hourlyRate?: number
  startDate?: Date
  endDate?: Date
}

export interface TaskForm {
  title: string
  description?: string
  projectId: string
  assignedToId?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  estimatedHours?: number
  hourlyRate?: number
  dueDate?: Date
}

export interface WorkerForm {
  name: string
  email?: string
  phone?: string
  skills?: string
  hourlyRate?: number
}

export interface PaymentForm {
  amount: number
  type: 'INCOMING' | 'OUTGOING'
  description?: string
  clientId?: string
  projectId?: string
  workerId?: string
  dueDate?: Date
}