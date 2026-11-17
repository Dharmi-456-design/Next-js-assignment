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
  clientId?: any;
  client?: any;
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
  projectId?: any;
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
  projectId?: any;
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
  projectId?: any;
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
  projectId?: any;
  clientId?: any;
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
