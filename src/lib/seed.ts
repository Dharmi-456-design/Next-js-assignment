import connectToDatabase from "./db";
import {
  Client,
  Project,
  Task,
  Milestone,
  Deliverable,
  Payment,
  Activity,
  Comment,
} from "../models";

export async function seedDatabase(force = false) {
  await connectToDatabase();

  const existingClients = await Client.countDocuments();
  if (existingClients > 0 && !force) {
    return { success: true, message: "Database already seeded." };
  }

  if (force) {
    await Promise.all([
      Client.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      Milestone.deleteMany({}),
      Deliverable.deleteMany({}),
      Payment.deleteMany({}),
      Activity.deleteMany({}),
      Comment.deleteMany({}),
    ]);
  }

  const now = new Date();
  const daysFromNow = (days: number) =>
    new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const daysAgo = (days: number) =>
    new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  // 1. Clients
  const clients = await Client.insertMany([
    {
      name: "Alice Johnson",
      email: "alice@designco.com",
      phone: "+91 98765 43210",
      company: "Design Co.",
      address: "123 Design Street, Bengaluru",
      notes: "High-value long-term client.",
    },
    {
      name: "Bob Wilson",
      email: "bob@webstudio.io",
      phone: "+91 98123 45678",
      company: "Web Studio Ltd.",
      address: "456 Tech Park, Bengaluru",
      notes: "Regular client, good communication.",
    },
    {
      name: "Carol Martinez",
      email: "carol@marketing.io",
      phone: "+91 97654 32109",
      company: "Marketing International",
      address: "789 Campaign Blvd, Mumbai",
      notes: "Performance marketing firm.",
    },
  ]);

  // 2. Projects
  const projects = await Project.insertMany([
    {
      title: "Website Redesign",
      description: "Full redesign and Next.js rebuild for SaaS landing.",
      clientId: clients[0]._id,
      budget: 150000,
      startDate: daysAgo(30),
      deadline: daysFromNow(25),
      status: "In Progress",
      priority: "High",
      progress: 65,
    },
    {
      title: "Brand Identity System",
      description: "Visual identity and brand asset toolkit.",
      clientId: clients[1]._id,
      budget: 65000,
      startDate: daysAgo(18),
      deadline: daysFromNow(12),
      status: "In Progress",
      priority: "Medium",
      progress: 45,
    },
    {
      title: "E-Commerce Store",
      description: "Full e-commerce store with payment integration.",
      clientId: clients[2]._id,
      budget: 200000,
      startDate: daysAgo(5),
      deadline: daysFromNow(60),
      status: "Planning",
      priority: "High",
      progress: 10,
    },
  ]);

  // 3. Tasks
  await Task.insertMany([
    {
      title: "Design hero section",
      projectId: projects[0]._id,
      priority: "High",
      status: "Completed",
      dueDate: daysAgo(10),
    },
    {
      title: "Build responsive navbar",
      projectId: projects[0]._id,
      priority: "Medium",
      status: "In Progress",
      dueDate: daysFromNow(5),
    },
    {
      title: "Logo design",
      projectId: projects[1]._id,
      priority: "High",
      status: "Completed",
      dueDate: daysAgo(5),
    },
    {
      title: "Colour palette",
      projectId: projects[1]._id,
      priority: "Medium",
      status: "To Do",
      dueDate: daysFromNow(7),
    },
    {
      title: "Requirements gathering",
      projectId: projects[2]._id,
      priority: "High",
      status: "In Progress",
      dueDate: daysFromNow(3),
    },
  ]);

  // 4. Milestones
  await Milestone.insertMany([
    {
      title: "Design Approval",
      projectId: projects[0]._id,
      dueDate: daysAgo(10),
      status: "Completed",
      completedAt: daysAgo(10),
    },
    {
      title: "Frontend Launch",
      projectId: projects[0]._id,
      dueDate: daysFromNow(20),
      status: "In Progress",
    },
    {
      title: "Brand Guidelines Delivered",
      projectId: projects[1]._id,
      dueDate: daysFromNow(10),
      status: "To Do",
    },
  ]);

  // 5. Deliverables
  await Deliverable.insertMany([
    {
      title: "Wireframes PDF",
      projectId: projects[0]._id,
      status: "Approved",
      submissionDate: daysAgo(15),
    },
    {
      title: "Homepage Mockup",
      projectId: projects[0]._id,
      status: "Submitted",
      submissionDate: daysAgo(3),
    },
    {
      title: "Logo Files",
      projectId: projects[1]._id,
      status: "Approved",
      submissionDate: daysAgo(5),
    },
  ]);

  // 6. Payments
  await Payment.insertMany([
    {
      projectId: projects[0]._id,
      clientId: clients[0]._id,
      amount: 50000,
      paymentDate: daysAgo(25),
      method: "Bank Transfer",
      status: "Successful",
    },
    {
      projectId: projects[0]._id,
      clientId: clients[0]._id,
      amount: 50000,
      paymentDate: daysAgo(10),
      method: "UPI",
      status: "Successful",
    },
    {
      projectId: projects[1]._id,
      clientId: clients[1]._id,
      amount: 30000,
      paymentDate: daysAgo(15),
      method: "Bank Transfer",
      status: "Successful",
    },
    {
      projectId: projects[2]._id,
      clientId: clients[2]._id,
      amount: 80000,
      paymentDate: daysFromNow(5),
      method: "Bank Transfer",
      status: "Pending",
    },
  ]);

  // 7. Activities
  await Activity.insertMany([
    {
      title: "Project Created",
      description: "Website Redesign project created.",
      projectId: projects[0]._id,
      clientId: clients[0]._id,
      type: "Create",
    },
    {
      title: "Payment Received",
      description: "Received ₹50,000 from Alice Johnson.",
      projectId: projects[0]._id,
      clientId: clients[0]._id,
      type: "Payment Received",
    },
    {
      title: "Milestone Completed",
      description: "Design Approval milestone completed.",
      projectId: projects[0]._id,
      type: "Milestone Completed",
    },
  ]);

  // 8. Comments
  await Comment.insertMany([
    {
      projectId: projects[0]._id,
      content: "Client requested a richer green accent for the hero section.",
      author: "You",
    },
  ]);

  return { success: true, message: "Database seeded successfully." };
}
