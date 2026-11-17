import Link from "next/link";
import {
  Briefcase,
  Users,
  CheckSquare,
  FileCheck,
  CreditCard,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-16 sm:space-y-24 py-4 sm:py-8">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#426B50]/20 bg-[#426B50]/5 text-[#426B50] text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ReserveX — Freelance Business Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#20231F] leading-[1.12]">
          Every project. Every client.{" "}
          <span className="text-[#426B50]">Everything in sync.</span>
        </h1>

        <p className="text-base sm:text-lg text-[#747970] max-w-2xl mx-auto leading-relaxed">
          The purpose-built workspace for independent developers, designers, and
          creative studios to manage client deliverables, milestones, payments,
          and performance.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#426B50] text-white font-medium text-sm hover:bg-[#34573F] transition-all shadow-xs"
          >
            <span>Open Studio Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-[#E5E7E2] bg-white text-[#20231F] font-medium text-sm hover:bg-[#F1F2EE] transition-all"
          >
            <span>Browse Projects</span>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-[#747970] border-t border-[#E5E7E2]/60 max-w-xl mx-auto">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#426B50]" />
            <span>Structured Contracts & Milestones</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#426B50]" />
            <span>Overdue Task Sentinel</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-[#426B50]" />
            <span>INR (₹) Cashflow Tracking</span>
          </div>
        </div>
      </section>

      {/* Product Workflow Bento Grid */}
      <section className="space-y-6">
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-semibold text-[#20231F]">
            One system for your entire client delivery lifecycle
          </h2>
          <p className="text-xs sm:text-sm text-[#747970]">
            From kickoff to final invoice reconciliation — without switching between five different apps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Projects */}
          <div className="p-6 rounded-lg bg-white border border-[#E5E7E2] shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-md bg-[#F1F2EE] flex items-center justify-center text-[#426B50]">
              <Briefcase className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[#20231F]">
              Projects & Milestones
            </h3>
            <p className="text-xs text-[#747970] leading-relaxed">
              Track multi-phase scopes with completion percentages, timeline
              deadlines, stakeholder assignments, and budget reconciliation.
            </p>
            <div className="pt-2">
              <Link
                href="/projects"
                className="text-xs font-medium text-[#426B50] hover:underline inline-flex items-center gap-1"
              >
                <span>View projects workspace</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 2: Clients */}
          <div className="p-6 rounded-lg bg-white border border-[#E5E7E2] shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-md bg-[#F1F2EE] flex items-center justify-center text-[#426B50]">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[#20231F]">
              Client Directory & Ledger
            </h3>
            <p className="text-xs text-[#747970] leading-relaxed">
              Keep company contacts, contracts, communication notes, total billed
              revenue, and pending accounts receivable in one ledger.
            </p>
            <div className="pt-2">
              <Link
                href="/clients"
                className="text-xs font-medium text-[#426B50] hover:underline inline-flex items-center gap-1"
              >
                <span>Open client directory</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 3: Payments */}
          <div className="p-6 rounded-lg bg-white border border-[#E5E7E2] shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-md bg-[#F1F2EE] flex items-center justify-center text-[#426B50]">
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[#20231F]">
              Payments & Financials
            </h3>
            <p className="text-xs text-[#747970] leading-relaxed">
              Track UPI, Bank Transfers, and Card receipts in Indian Rupees (₹).
              Only confirmed payouts count toward verified earned revenue.
            </p>
            <div className="pt-2">
              <Link
                href="/payments"
                className="text-xs font-medium text-[#426B50] hover:underline inline-flex items-center gap-1"
              >
                <span>Track client payments</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 4: Tasks & Kanban */}
          <div className="p-6 rounded-lg bg-white border border-[#E5E7E2] shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-md bg-[#F1F2EE] flex items-center justify-center text-[#426B50]">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[#20231F]">
              Task Execution & Kanban
            </h3>
            <p className="text-xs text-[#747970] leading-relaxed">
              Structured Kanban board with To Do, In Progress, and Completed
              stages. Immediate visual warnings for overdue deliverables.
            </p>
            <div className="pt-2">
              <Link
                href="/tasks"
                className="text-xs font-medium text-[#426B50] hover:underline inline-flex items-center gap-1"
              >
                <span>Manage task queue</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 5: Deliverables */}
          <div className="p-6 rounded-lg bg-white border border-[#E5E7E2] shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-md bg-[#F1F2EE] flex items-center justify-center text-[#426B50]">
              <FileCheck className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[#20231F]">
              Deliverables & Sign-offs
            </h3>
            <p className="text-xs text-[#747970] leading-relaxed">
              Audit trail of client submissions: Pending, Submitted, Approved,
              or Revision Required with direct links to assets and prototypes.
            </p>
            <div className="pt-2">
              <Link
                href="/deliverables"
                className="text-xs font-medium text-[#426B50] hover:underline inline-flex items-center gap-1"
              >
                <span>View deliverables</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 6: Reports */}
          <div className="p-6 rounded-lg bg-white border border-[#E5E7E2] shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-md bg-[#F1F2EE] flex items-center justify-center text-[#426B50]">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[#20231F]">
              Business Performance Reports
            </h3>
            <p className="text-xs text-[#747970] leading-relaxed">
              Real-time analytics on monthly revenue velocity, client value
              concentration, on-time completion rates, and outstanding balances.
            </p>
            <div className="pt-2">
              <Link
                href="/reports"
                className="text-xs font-medium text-[#426B50] hover:underline inline-flex items-center gap-1"
              >
                <span>View studio analytics</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="p-8 sm:p-12 rounded-lg bg-[#F1F2EE] border border-[#E5E7E2] text-center space-y-4 max-w-3xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-semibold text-[#20231F]">
          Ready to streamline your freelance practice?
        </h2>
        <p className="text-xs sm:text-sm text-[#747970] max-w-lg mx-auto">
          All your projects, client communication history, invoices, and delivery milestones organized in one place.
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-[#426B50] text-white font-medium text-sm hover:bg-[#34573F] transition-all shadow-xs"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

