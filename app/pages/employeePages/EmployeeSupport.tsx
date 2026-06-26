import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { RootState } from '../../Store';
import { problemAPI, employeeAPI } from '../../services/Api';
import Header from '../../components/layout/Header';
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableBadge
} from '../../components/ui/DataTable';

export default function EmployeeSupport() {
  const admin = useSelector((s: RootState) => s.auth.admin);

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeAPI.fetchAll,
  });

  const user = employees.find(
    (e) => e.email.toLowerCase() === admin?.email?.toLowerCase()
  );

  const { data: problems = [], isLoading } = useQuery({
    queryKey: ['problems'],
    queryFn: problemAPI.fetchAll,
  });

  const userProblems = user 
    ? problems.filter((p) => String(p.employeeId) === String(user.id))
    : [];

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        <div className="p-8 md:p-12 space-y-8 max-w-[1400px] mx-auto w-full">
          {/* Hero Section */}
          <section className="relative bg-primary-container/20 rounded-xl p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-4">
            <h3 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
              How can we help you today?
            </h3>
            <p className="text-body-md text-on-surface-variant max-w-2xl">
              Find answers to your questions, explore HR policies, or report a technical problem directly to our support team.
            </p>
            <div className="w-full max-w-xl relative mt-4">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input 
                className="w-full pl-12 pr-6 py-4 rounded-full border-none shadow-sm focus:ring-2 focus:ring-primary" 
                placeholder="Search for 'Leave Policy', 'VPN Access', or 'Payroll'..." 
                type="text" 
              />
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Report an Issue Card */}
            <div className="lg:col-span-1 flex flex-col bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 justify-between">
              <div>
                <div className="w-12 h-12 bg-error-container rounded-lg flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-error">warning</span>
                </div>
                <h4 className="font-headline-md text-on-surface mb-2">Report a Problem</h4>
                <p className="text-body-sm text-on-surface-variant mb-8">
                  Encountered an issue? File a grievance or report a technical glitch and our team will get back to you within 24 hours.
                </p>
              </div>
              <button className="w-full bg-primary text-white py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                Open New Ticket
              </button>
            </div>

            {/* Common Resources Grid */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-surface-container-lowest border border-outline-variant rounded-lg hover:border-primary cursor-pointer transition-colors flex items-start gap-4">
                <div className="bg-secondary-container p-2 rounded-lg">
                  <span className="material-symbols-outlined text-secondary">help</span>
                </div>
                <div>
                  <h5 className="font-label-md text-on-surface">FAQs</h5>
                  <p className="text-body-sm text-on-surface-variant">Find quick answers to common questions.</p>
                </div>
              </div>
              <div className="p-4 bg-surface-container-lowest border border-outline-variant rounded-lg hover:border-primary cursor-pointer transition-colors flex items-start gap-4">
                <div className="bg-primary-container/30 p-2 rounded-lg">
                  <span className="material-symbols-outlined text-primary">description</span>
                </div>
                <div>
                  <h5 className="font-label-md text-on-surface">HR Policies</h5>
                  <p className="text-body-sm text-on-surface-variant">Read guidelines on leave, conduct, and more.</p>
                </div>
              </div>
              <div className="p-4 bg-surface-container-lowest border border-outline-variant rounded-lg hover:border-primary cursor-pointer transition-colors flex items-start gap-4">
                <div className="bg-tertiary-container p-2 rounded-lg">
                  <span className="material-symbols-outlined text-tertiary">computer</span>
                </div>
                <div>
                  <h5 className="font-label-md text-on-surface">IT Support</h5>
                  <p className="text-body-sm text-on-surface-variant">Remote assistance and device troubleshooting.</p>
                </div>
              </div>
              <div className="p-4 bg-surface-container-lowest border border-outline-variant rounded-lg hover:border-primary cursor-pointer transition-colors flex items-start gap-4">
                <div className="bg-secondary-container p-2 rounded-lg">
                  <span className="material-symbols-outlined text-secondary">payments</span>
                </div>
                <div>
                  <h5 className="font-label-md text-on-surface">Payroll Help</h5>
                  <p className="text-body-sm text-on-surface-variant">Issues with salary, tax, or reimbursements.</p>
                </div>
              </div>
            </div>
          </div>

          {/* My Tickets Section */}
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center">
              <h4 className="font-headline-md text-on-surface">My Recent Tickets</h4>
              <a className="text-primary font-label-md hover:underline cursor-pointer">View All Tickets</a>
            </div>
            <TableContainer className="border-none shadow-none rounded-none">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Loading tickets...</TableCell>
                    </TableRow>
                  ) : userProblems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-on-surface-variant">No recent tickets.</TableCell>
                    </TableRow>
                  ) : (
                    userProblems.map((ticket) => {
                      let statusIconColor = 'bg-outline';
                      let statusText = 'Resolved';
                      let textColor = 'text-on-surface-variant';
                      
                      if (ticket.status === 'in_progress') {
                        statusIconColor = 'bg-primary animate-pulse';
                        statusText = 'In Progress';
                        textColor = 'text-primary';
                      } else if (ticket.status === 'open') {
                        statusIconColor = 'bg-error';
                        statusText = 'Open';
                        textColor = 'text-error';
                      }

                      let catColor = 'bg-surface-container-highest text-on-surface-variant';
                      if (ticket.category === 'Technical' || ticket.category === 'Hardware') catColor = 'bg-tertiary-container text-on-tertiary-container';
                      if (ticket.category === 'Payroll' || ticket.category === 'Pay Dispute') catColor = 'bg-secondary-container text-on-secondary-container';

                      return (
                        <TableRow key={ticket.id}>
                          <TableCell className="text-primary font-semibold">#{ticket.ticketId}</TableCell>
                          <TableCell>{ticket.filedDate}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 ${catColor} rounded-full text-[10px] font-bold uppercase tracking-wider`}>{ticket.category}</span>
                          </TableCell>
                          <TableCell className="text-on-surface font-medium">{ticket.description || 'No description'}</TableCell>
                          <TableCell>
                            <div className={`flex items-center gap-1.5 ${textColor} font-semibold`}>
                              <span className={`w-2 h-2 rounded-full ${statusIconColor}`}></span>
                              {statusText}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </section>
        </div>
      </main>
    </>
  );
}
