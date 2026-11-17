export interface IClientRef {
  _id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
}

export interface IProjectRef {
  _id: string;
  title: string;
  budget?: number;
}

export interface IClientData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  notes?: string;
  projectCount?: number;
  totalProjectValue?: number;
  amountReceived?: number;
  outstandingBalance?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IProjectData {
  _id: string;
  title: string;
  description?: string;
  clientId?: string | IClientRef | any;
  client?: IClientRef | any;
  budget: number;
  startDate?: string | Date;
  deadline?: string | Date;
  status: string;
  priority: string;
  progress: number;
  taskStats?: {
    total: number;
    completed: number;
    percentage: number;
  };
  receivedAmount?: number;
  outstandingBalance?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ITaskData {
  _id: string;
  title: string;
  description?: string;
  projectId?: string | IProjectRef | any;
  dueDate?: string | Date;
  priority: string;
  status: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IMilestoneData {
  _id: string;
  title: string;
  description?: string;
  projectId?: string | IProjectRef | any;
  dueDate?: string | Date;
  status: string;
  completedAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IDeliverableData {
  _id: string;
  title: string;
  description?: string;
  projectId?: string | IProjectRef | any;
  submissionDate?: string | Date;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  status: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IPaymentData {
  _id: string;
  projectId?: string | IProjectRef | any;
  clientId?: string | IClientRef | any;
  amount: number;
  paymentDate: string | Date;
  method: string;
  status: string;
  reference?: string;
  notes?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IActivityData {
  _id: string;
  title: string;
  description?: string;
  projectId?: string;
  clientId?: string;
  type: string;
  createdAt?: string | Date;
}

export interface ICommentData {
  _id: string;
  projectId: string;
  content: string;
  author?: string;
  createdAt?: string | Date;
}

export interface IDashboardMetrics {
  revenueReceived: number;
  outstandingPayments: number;
  activeProjectsCount: number;
  completedProjectsCount: number;
  totalProjectsCount: number;
}

export interface IDashboardData {
  metrics: IDashboardMetrics;
  activeProjects: IProjectData[];
  recentPayments: IPaymentData[];
  upcomingDeadlines: ITaskData[];
  overdueTasks: ITaskData[];
  recentActivities: IActivityData[];
  statusDistribution: { status: string; count: number }[];
  revenueTrend: { month: string; amount: number }[];
}
