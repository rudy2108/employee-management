import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { employeeAPI, leaveAPI, jobApplicationAPI, pageConfigAPI } from "../services/Api";
import { cap } from "../lib/Utils";
import DashboardStatCards from "../components/dashboard/DashboardStatCards";
import RecentActivityCard from "../components/dashboard/RecentActivityCard";
import OpenProblemsCard from "../components/dashboard/OpenProblemsCard";
import BarChartCard, { type BarChartItem } from "../components/dashboard/BarChartCard";
import StatusPipelineCard, { type StatTile, type MiniBarItem } from "../components/dashboard/StatusPipelineCard";
import UpcomingHolidaysCard from "../components/dashboard/UpcomingHolidaysCard";
import { PageHeader } from "../components/ui/PageHeader";

const DEPT_COLORS: Record<string, { bar: string; text: string }> = {
  engineering: { bar: "bg-primary", text: "text-primary" },
  design: { bar: "bg-[#EC4899]", text: "text-[#EC4899]" },
  marketing: { bar: "bg-[#F59E0B]", text: "text-[#F59E0B]" },
  "human resources": { bar: "bg-primary-container", text: "text-on-primary-container" },
  finance: { bar: "bg-secondary", text: "text-secondary" },
  sales: { bar: "bg-[#8B5CF6]", text: "text-[#8B5CF6]" },
  management: { bar: "bg-[#10B981]", text: "text-[#10B981]" },
};

const STATUS_CFG: Record<string, { label: string; bar: string; text: string }> = {
  "full-time": { label: "Full-Time", bar: "bg-primary", text: "text-primary" },
  "part-time": { label: "Part-Time", bar: "bg-[#F59E0B]", text: "text-[#F59E0B]" },
  contract: { label: "Contract", bar: "bg-[#8B5CF6]", text: "text-[#8B5CF6]" },
  probation: { label: "Probation", bar: "bg-[#EC4899]", text: "text-[#EC4899]" },
};

export default function DashboardPage() {
  const { data: employees = [] } = useQuery({ queryKey: ['employees'], queryFn: employeeAPI.fetchAll });
  const { data: leaveRequests = [] } = useQuery({ queryKey: ['leaves'], queryFn: leaveAPI.fetchAll });
  const { data: applications = [] } = useQuery({ queryKey: ['jobApplications'], queryFn: jobApplicationAPI.fetchAll });
  const { data: pageConfigs = [] } = useQuery({ queryKey: ['pageConfigs', 'dashboard'], queryFn: () => pageConfigAPI.fetchByPage('dashboard') });
  const pageConfig = pageConfigs[0];

  // Headcount by dept
  const headcountItems = useMemo<BarChartItem[]>(() => {
    const deptCounts = employees.reduce<Record<string, number>>((acc, e) => {
      const d = e.department.toLowerCase();
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});
    const deptEntries = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);
    const maxDept = deptEntries[0]?.[1] ?? 1;
    return deptEntries.map(([dept, count]) => ({
      key: dept,
      label: cap(dept),
      count,
      percentage: Math.round((count / maxDept) * 100),
      barColor: DEPT_COLORS[dept]?.bar ?? "bg-secondary",
      textColor: DEPT_COLORS[dept]?.text ?? "text-secondary",
    }));
  }, [employees]);

  // Employee status
  const statusItems = useMemo<BarChartItem[]>(() => {
    const totalEmployees = employees.length;
    const statusCounts = employees.reduce<Record<string, number>>((acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(STATUS_CFG).map(([key, cfg]) => {
      const count = statusCounts[key] ?? 0;
      const pct = totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0;
      return {
        key,
        label: cfg.label,
        count,
        percentage: pct,
        barColor: cfg.bar,
        textColor: cfg.text,
        suffix: `(${pct}%)`,
      };
    });
  }, [employees]);

  // Leave requests
  const { leaveStats, leaveBreakdown } = useMemo(() => {
    let pending = 0, approved = 0, rejected = 0;
    const leaveByType: Record<string, number> = {};
    for (const l of leaveRequests) {
      if (l.status === "pending") pending++;
      else if (l.status === "approved" || l.status === "hr_approved") approved++;
      else if (l.status === "rejected" || l.status === "hr_rejected") rejected++;
      leaveByType[l.type] = (leaveByType[l.type] || 0) + 1;
    }
    const stats: StatTile[] = [
      { label: "Pending", value: pending, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
      { label: "Approved", value: approved, color: "text-primary", bg: "bg-primary/10" },
      { label: "Rejected", value: rejected, color: "text-error", bg: "bg-error/10" },
    ];
    const breakdown: MiniBarItem[] = Object.entries(leaveByType).map(([type, count]) => ({
      key: type,
      label: type,
      count,
      percentage: leaveRequests.length > 0 ? Math.round((count / leaveRequests.length) * 100) : 0,
    }));
    return { leaveStats: stats, leaveBreakdown: breakdown };
  }, [leaveRequests]);

  // Application pipeline
  const { appStats, appBreakdown } = useMemo(() => {
    let pending = 0, approved = 0, rejected = 0;
    const appByDept: Record<string, number> = {};
    for (const a of applications) {
      if (a.status === "pending") pending++;
      else if (a.status === "approved") approved++;
      else if (a.status === "rejected") rejected++;
      appByDept[a.department] = (appByDept[a.department] || 0) + 1;
    }
    const stats: StatTile[] = [
      { label: "Pending", value: pending, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
      { label: "Approved", value: approved, color: "text-primary", bg: "bg-primary/10" },
      { label: "Rejected", value: rejected, color: "text-error", bg: "bg-error/10" },
    ];
    const breakdown: MiniBarItem[] = Object.entries(appByDept).map(([dept, count]) => ({
      key: dept,
      label: cap(dept),
      count,
      percentage: applications.length > 0 ? Math.round((count / applications.length) * 100) : 0,
    }));
    return { appStats: stats, appBreakdown: breakdown };
  }, [applications]);

  return (
    <main className="flex-1 p-4 bg-background space-y-4">
      <PageHeader title={pageConfig?.title ?? ''} subtitle={pageConfig?.subtitle ?? ''} />

      <DashboardStatCards />

      <div className="flex gap-3 items-start">
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <RecentActivityCard />
          <OpenProblemsCard />
        </div>
        <div className="w-[260px] shrink-0 flex flex-col gap-3">
          <BarChartCard title="Headcount by Dept" items={headcountItems} />
          <BarChartCard title="Employee Status" items={statusItems} />
        </div>
      </div>

      <div className="flex gap-3">
        <StatusPipelineCard
          title="Leave Requests"
          stats={leaveStats}
          breakdownLabel="By Type"
          breakdownItems={leaveBreakdown}
          barColor="bg-primary"
        />
        <StatusPipelineCard
          title="Application Pipeline"
          stats={appStats}
          breakdownLabel="By Department"
          breakdownItems={appBreakdown}
          barColor="bg-secondary"
        />
        <UpcomingHolidaysCard />
      </div>
    </main>
  );
}
