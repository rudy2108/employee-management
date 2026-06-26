import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { RootState } from '../../Store';
import { leaveAPI, employeeAPI } from '../../services/Api';
import Header from '../../components/layout/Header';
import { StatCard } from '../../components/ui/StatCard';
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableToolbar,
} from '../../components/ui/DataTable';

export default function EmployeeLeave() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const admin = useSelector((s: RootState) => s.auth.admin);

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeAPI.fetchAll,
  });

  const user = employees.find(
    (e) => e.email.toLowerCase() === admin?.email?.toLowerCase()
  );

  const { data: leaveRequests = [], isLoading } = useQuery({
    queryKey: ['leaves'],
    queryFn: leaveAPI.fetchAll,
  });

  const userLeaves = user 
    ? leaveRequests.filter((l) => String(l.employeeId) === String(user.id))
    : [];

  const pendingLeaves = userLeaves.filter(l => l.status === 'pending' || l.status === 'hr_approved').length;
  // This is a rough estimation of days since we don't store exact days in DB (only duration string)
  // Let's use user.totalLeaves from DB for Annual Leave Balance
  const totalLeaves = user?.totalLeaves ?? 12;
  const usedLeaves = userLeaves.filter(l => l.status === 'approved' || l.status === 'hr_approved').length;
  const annualBalance = Math.max(0, totalLeaves - usedLeaves);
  const sickLeaveUsed = userLeaves.filter(l => l.type === 'Sick Leave' && (l.status === 'approved' || l.status === 'hr_approved')).length;


  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        <div className="p-8 md:p-12 space-y-8 max-w-[1400px] mx-auto w-full">
          {/* Summary Bento Grid */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard className="h-40 flex flex-col justify-between" variant="leave">
              <div className="flex justify-between items-start mb-3">
                <div className="bg-primary-container/20 p-2 rounded-lg text-primary">
                  <span className="material-symbols-outlined text-[24px]">event_available</span>
                </div>
                <span className="text-label-sm text-primary bg-primary/10 px-2 py-0.5 rounded-full">+2 this mo</span>
              </div>
              <div className="mt-auto">
                <p className="text-label-md text-on-surface-variant">Annual Leave Balance</p>
                <h3 className="text-headline-lg font-bold text-on-surface">{annualBalance} <span className="text-body-sm font-normal text-on-surface-variant">Days</span></h3>
              </div>
            </StatCard>

            <StatCard className="h-40 flex flex-col justify-between" variant="leave">
              <div className="flex justify-between items-start mb-3">
                <div className="bg-secondary-container/30 p-2 rounded-lg text-secondary">
                  <span className="material-symbols-outlined text-[24px]">medical_services</span>
                </div>
                <span className="text-label-sm text-on-surface-variant">Policy Limit: 10</span>
              </div>
              <div className="mt-auto">
                <p className="text-label-md text-on-surface-variant">Sick Leave Used</p>
                <h3 className="text-headline-lg font-bold text-on-surface">{sickLeaveUsed} <span className="text-body-sm font-normal text-on-surface-variant">Days</span></h3>
              </div>
            </StatCard>

            <StatCard className="h-40 flex flex-col justify-between" variant="leave">
              <div className="flex justify-between items-start mb-3">
                <div className="bg-tertiary-container/30 p-2 rounded-lg text-tertiary">
                  <span className="material-symbols-outlined text-[24px]">pending_actions</span>
                </div>
              </div>
              <div className="mt-auto">
                <p className="text-label-md text-on-surface-variant">Pending Requests</p>
                <h3 className="text-headline-lg font-bold text-on-surface">{pendingLeaves} <span className="text-body-sm font-normal text-on-surface-variant">Active</span></h3>
              </div>
            </StatCard>

            {/* Action Card */}
            <div 
              className="border border-primary rounded-xl p-4 flex flex-col justify-between h-40 shadow-lg shadow-primary/20 group cursor-pointer hover:scale-[1.02] transition-transform bg-surface-container-lowest hover:bg-primary hover:text-white transition-colors duration-300"
              onClick={() => setIsModalOpen(true)}
            >
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-white/20 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">add_circle</span>
                </div>
                <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity text-primary group-hover:text-white">arrow_forward</span>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant group-hover:text-white/80">Plan Time Off</p>
                <h3 className="text-headline-md font-bold text-on-surface group-hover:text-white">Request Leave</h3>
              </div>
            </div>
          </section>

          {/* Main Layout Grid: History vs Calendar */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* History Table (2/3 width) */}
            <div className="lg:col-span-2">
              <TableContainer className="h-full">
                <TableToolbar title="Leave History" />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Applied On</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">Loading leaves...</TableCell>
                      </TableRow>
                    ) : userLeaves.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-on-surface-variant">No leave history found.</TableCell>
                      </TableRow>
                    ) : (
                      userLeaves.map((leave) => {
                        let statusColor = 'bg-gray-100 text-gray-800';
                        if (leave.status === 'approved') statusColor = 'bg-green-100 text-green-800';
                        else if (leave.status === 'rejected' || leave.status === 'hr_rejected') statusColor = 'bg-red-100 text-red-800';
                        else if (leave.status === 'pending') statusColor = 'bg-orange-100 text-orange-800';

                        let dotColor = 'bg-primary';
                        if (leave.type === 'Sick Leave') dotColor = 'bg-error';
                        if (leave.type === 'Personal Leave') dotColor = 'bg-tertiary';

                        return (
                          <TableRow key={leave.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
                                <span className="font-label-md">{leave.type}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-label-md">{leave.duration}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-on-surface-variant">{leave.appliedDate}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-semibold ${statusColor}`}>{leave.status}</span>
                            </TableCell>
                            <TableCell className="text-right">
                              <button className="text-on-surface-variant hover:text-primary"><span className="material-symbols-outlined">more_vert</span></button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>

            {/* Personal Calendar View (1/3 width) */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden h-fit">
              <div className="p-6 border-b border-outline-variant bg-surface-container-low/50">
                <div className="flex justify-between items-center">
                  <h4 className="font-headline-md text-headline-md">My Schedule</h4>
                  <div className="flex gap-1">
                    <button className="p-1 hover:bg-surface-container-high rounded"><span className="material-symbols-outlined text-[20px]">chevron_left</span></button>
                    <button className="p-1 hover:bg-surface-container-high rounded"><span className="material-symbols-outlined text-[20px]">chevron_right</span></button>
                  </div>
                </div>
                <p className="text-label-md font-bold mt-2">November 2023</p>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  <div className="text-label-sm text-on-surface-variant">S</div>
                  <div className="text-label-sm text-on-surface-variant">M</div>
                  <div className="text-label-sm text-on-surface-variant">T</div>
                  <div className="text-label-sm text-on-surface-variant">W</div>
                  <div className="text-label-sm text-on-surface-variant">T</div>
                  <div className="text-label-sm text-on-surface-variant">F</div>
                  <div className="text-label-sm text-on-surface-variant">S</div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {/* Just representative days */}
                  <div className="h-10 flex items-center justify-center text-label-md text-on-surface-variant opacity-40">30</div>
                  <div className="h-10 flex items-center justify-center text-label-md text-on-surface-variant opacity-40">31</div>
                  {[...Array(20)].map((_, i) => (
                    <div key={i+1} className="h-10 flex items-center justify-center text-label-md hover:bg-surface-container rounded-lg cursor-pointer transition-colors">
                      {i + 1}
                    </div>
                  ))}
                  <div className="h-10 flex items-center justify-center text-label-md bg-tertiary/20 text-tertiary font-bold rounded-lg cursor-pointer ring-1 ring-tertiary relative transition-colors">
                    22
                    <span className="absolute bottom-1 w-1 h-1 bg-tertiary rounded-full"></span>
                  </div>
                  {[...Array(4)].map((_, i) => (
                    <div key={i+23} className="h-10 flex items-center justify-center text-label-md hover:bg-surface-container rounded-lg cursor-pointer transition-colors">
                      {i + 23}
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 border-t border-outline-variant space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-1.5 h-12 rounded-full bg-tertiary"></div>
                  <div>
                    <p className="text-label-md font-bold">Personal Leave (WFH)</p>
                    <p className="text-label-sm text-on-surface-variant">Nov 22, 2023 · Pending Approval</p>
                  </div>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-label-sm font-bold uppercase tracking-widest text-on-surface-variant">Quick Tip</span>
                    <span className="material-symbols-outlined text-primary text-[18px]">lightbulb</span>
                  </div>
                  <p className="text-body-sm leading-relaxed">Book your Christmas leave by Dec 1st to ensure your team has enough coverage!</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Request Leave Modal Overlay */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-surface rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                <h3 className="font-headline-md text-headline-md">New Leave Request</h3>
                <button 
                  className="p-2 hover:bg-surface-container-high rounded-full transition-colors" 
                  onClick={() => setIsModalOpen(false)}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="p-6">
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-label-md text-on-surface-variant">Leave Type</label>
                      <select className="w-full h-12 bg-surface-container-low border border-outline-variant rounded-xl px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all">
                        <option>Annual Leave</option>
                        <option>Sick Leave</option>
                        <option>Personal / WFH</option>
                        <option>Unpaid Leave</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-label-md text-on-surface-variant">Half Day?</label>
                      <div className="flex gap-2 h-12 items-center">
                        <button className="flex-1 h-full border border-outline-variant rounded-xl text-label-md hover:bg-surface-container-high transition-colors" type="button">Morning</button>
                        <button className="flex-1 h-full border border-outline-variant rounded-xl text-label-md hover:bg-surface-container-high transition-colors" type="button">Afternoon</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-label-md text-on-surface-variant">Start Date</label>
                      <input className="w-full h-12 bg-surface-container-low border border-outline-variant rounded-xl px-4 focus:ring-2 focus:ring-primary" type="date" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-label-md text-on-surface-variant">End Date</label>
                      <input className="w-full h-12 bg-surface-container-low border border-outline-variant rounded-xl px-4 focus:ring-2 focus:ring-primary" type="date" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-label-md text-on-surface-variant">Reason for Leave</label>
                    <textarea className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-4 focus:ring-2 focus:ring-primary" placeholder="Briefly explain the reason for your absence..." rows={3}></textarea>
                  </div>
                  
                  <div className="bg-primary-container/10 border border-primary-container/30 p-4 rounded-xl flex gap-4">
                    <span className="material-symbols-outlined text-primary">info</span>
                    <p className="text-body-sm text-on-primary-container">This request will be sent to your manager (Sarah Jenkins) for approval. Estimated response time: 24-48 hours.</p>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button 
                      className="flex-1 h-12 border border-outline-variant rounded-xl font-label-md hover:bg-surface-container-high transition-colors" 
                      onClick={() => setIsModalOpen(false)} 
                      type="button"
                    >
                      Cancel
                    </button>
                    <button 
                      className="flex-1 h-12 bg-primary text-white rounded-xl font-label-md shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity" 
                      type="submit"
                    >
                      Submit Request
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}