import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../Store';
import Header from '../../components/layout/Header';
import LogProblem from '../../components/problems/LogProblem';
import { Button } from '../../components/ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableEmpty,
  TableHead,
  TableHeader,
  TableLoading,
  TableRow,
} from '../../components/ui/DataTable';
import { ResourceCardContent } from '../../components/ui/StatCard';
import { getCategoryColor, getTicketStatus } from '../../lib/Utils';
import { employeeAPI, problemAPI, reportProblemCardAPI, resourceCardAPI, ticketCategoryAPI, ticketStatusAPI } from '../../services/Api';

export default function EmployeeSupport() {
  const admin = useSelector((s: RootState) => s.auth.admin);
  const [isLogProblemOpen, setIsLogProblemOpen] = useState(false);

  const { data: employees = [] } = useQuery({ queryKey: ['employees'], queryFn: employeeAPI.fetchAll });
  const user = employees.find((e) => e.email.toLowerCase() === admin?.email?.toLowerCase());

  const { data: problems = [], isLoading } = useQuery({ queryKey: ['problems'], queryFn: problemAPI.fetchAll });
  const { data: resourceCards = [] } = useQuery({ queryKey: ['resourceCards'], queryFn: resourceCardAPI.fetchAll });
  const { data: reportCards = [] } = useQuery({ queryKey: ['reportProblemCard'], queryFn: reportProblemCardAPI.fetchAll });
  const { data: ticketStatuses = [] } = useQuery({ queryKey: ['ticketStatuses'], queryFn: ticketStatusAPI.fetchAll });
  const { data: ticketCategories = [] } = useQuery({ queryKey: ['ticketCategories'], queryFn: ticketCategoryAPI.fetchAll });

  const userProblems = user ? problems.filter((p) => String(p.employeeId) === String(user.id)) : [];
  const tableHeaders = ['Ticket ID', 'Date', 'Category', 'Subject', 'Status'];

  return (
    <>
      <Header placeholder="Search for 'Leave Policy', 'VPN Access', or 'Payroll'..." />
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        <div className="p-8 md:p-12 space-y-8 max-w-[1400px] mx-auto w-full">
          <section className="relative bg-primary-container/20 rounded-xl p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-4">
            <h3 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">How can we help you today?</h3>
            <p className="text-body-md text-on-surface-variant max-w-2xl">Find answers to your questions, explore HR policies, or report a technical problem directly to our support team.</p>
            
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {reportCards[0] ? (
              <div className="lg:col-span-1 flex flex-col bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 justify-between">
                <div>
                  <div className={`w-12 h-12 ${reportCards[0].iconBg} rounded-lg flex items-center justify-center mb-4`}>
                    <span className={`material-symbols-outlined ${reportCards[0].iconColor}`}>{reportCards[0].icon}</span>
                  </div>
                  <h4 className="font-headline-md text-on-surface mb-2">{reportCards[0].title}</h4>
                  <p className="text-body-sm text-on-surface-variant mb-8">{reportCards[0].description}</p>
                </div>
                <Button variant="default" size="lg" className="w-full flex items-center justify-center gap-2" onClick={() => setIsLogProblemOpen(true)}>
                  <span className="material-symbols-outlined text-[20px]">{reportCards[0].buttonIcon}</span>
                  {reportCards[0].buttonLabel}
                </Button>
              </div>
            ) : (
              <div className="lg:col-span-1 flex flex-col bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 justify-between">
                <div>
                  <div className="w-12 h-12 bg-error-container rounded-lg flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-error">warning</span>
                  </div>
                  <h4 className="font-headline-md text-on-surface mb-2">Report a Problem</h4>
                  <p className="text-body-sm text-on-surface-variant mb-8">Encountered an issue? File a grievance or report a technical glitch and our team will get back to you within 24 hours.</p>
                </div>
                <Button variant="default" size="lg" className="w-full flex items-center justify-center gap-2" onClick={() => setIsLogProblemOpen(true)}>
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  Open New Ticket
                </Button>
              </div>
            )}

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {resourceCards.map((card) => (
                <div key={card.id} className="p-4 bg-surface-container-lowest border border-outline-variant rounded-lg hover:border-primary cursor-pointer transition-colors flex items-start gap-4">
                  <ResourceCardContent icon={card.icon} iconBg={card.iconBg} iconColor={card.iconColor} title={card.title} description={card.description} />
                </div>
              ))}
            </div>
          </div>

          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center">
              <h4 className="font-headline-md text-on-surface">My Recent Tickets</h4>
              <Button variant="ghost" size="md" className="text-primary font-label-md">View All Tickets</Button>
            </div>
            <TableContainer className="border-none shadow-none rounded-none">
              <Table>
                <TableHeader>
                  <TableRow>
                    {tableHeaders.map((h) => (
                      <TableHead key={h}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableLoading colSpan={5} message="Loading tickets..." />
                  ) : userProblems.length === 0 ? (
                    <TableEmpty colSpan={5} message="No recent tickets." />
                  ) : (
                    userProblems.map((ticket) => {
                      const statusInfo = getTicketStatus(ticketStatuses, ticket.status) || { statusIconColor: 'bg-outline', statusText: 'Resolved', textColor: 'text-on-surface-variant' };
                      const categoryColor = getCategoryColor(ticketCategories, ticket.category);
                      const catClass = `${categoryColor.bgColor} ${categoryColor.textColor}`;

                      return (
                        <TableRow key={ticket.id}>
                          <TableCell className="text-primary font-semibold">#{ticket.ticketId}</TableCell>
                          <TableCell>{ticket.filedDate}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 ${catClass} rounded-full text-[10px] font-bold uppercase tracking-wider`}>{ticket.category}</span>
                          </TableCell>
                          <TableCell className="text-on-surface font-medium">{ticket.description || 'No description'}</TableCell>
                          <TableCell>
                            <div className={`flex items-center gap-1.5 ${statusInfo.textColor} font-semibold`}>
                              <span className={`w-2 h-2 rounded-full ${statusInfo.statusIconColor}`}></span>
                              {statusInfo.statusText}
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

      <LogProblem
        isOpen={isLogProblemOpen}
        onClose={() => setIsLogProblemOpen(false)}
        employees={employees}
        defaultEmployeeId={user?.id}
      />
    </>
  );
}
