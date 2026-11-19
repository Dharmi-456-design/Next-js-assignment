import { z } from "zod";

// Client validation schema
export const clientSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Invalid email address").trim(),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

// Project validation schema
export const projectSchema = z.object({
  title: z.string().min(1, "Project title is required").trim(),
  clientId: z.string().min(1, "Client is required"),
  budget: z.coerce.number().min(0, "Budget must be a positive number"),
  status: z.enum(["Planning", "In Progress", "On Hold", "Completed", "Cancelled"]).default("Planning"),
  priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
  deadline: z.string().optional(),
  description: z.string().optional(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

// Task validation schema
export const taskSchema = z.object({
  title: z.string().min(1, "Task title is required").trim(),
  projectId: z.string().min(1, "Project is required"),
  priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
  status: z.enum(["To Do", "In Progress", "Completed"]).default("To Do"),
  dueDate: z.string().optional(),
  description: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

// Payment validation schema
export const paymentSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  clientId: z.string().min(1, "Client is required"),
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  method: z.string().min(1, "Payment method is required"),
  status: z.enum(["Successful", "Pending", "Failed"]).default("Successful"),
  paymentDate: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
