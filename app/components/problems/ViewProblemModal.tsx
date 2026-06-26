import type { Employee, EmployeeProblem } from '../../services/Api';
import { Button } from '../ui/Button';

type ProblemStatus = 'open' | 'in_progress' | 'resolved';
type ProblemPriority = 'low' | 'medium' | 'high';

interface ViewProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: (EmployeeProblem & { employee: Employee }) | null;
}

const statusConfig: Record<ProblemStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In Progress', className: 'bg-amber-100 text-amber-700' },
  resolved: { label: 'Resolved', className: 'bg-green-100 text-green-700' },
};

const priorityConfig: Record<ProblemPriority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-blue-100 text-blue-700' },
  medium: { label: 'Medium', className: 'bg-gray-100 text-gray-700' },
  high: { label: 'High', className: 'bg-red-100 text-red-700' },
};

const categoryColors: Record<string, { bgClass: string; textClass: string }> = {
  Harassment: { bgClass: 'bg-red-100', textClass: 'text-red-700' },
  'Pay Dispute': { bgClass: 'bg-orange-100', textClass: 'text-orange-700' },
  'Workplace Safety': { bgClass: 'bg-yellow-100', textClass: 'text-yellow-700' },
  Discrimination: { bgClass: 'bg-pink-100', textClass: 'text-pink-700' },
  'Work Environment': { bgClass: 'bg-purple-100', textClass: 'text-purple-700' },
};

export default function ViewProblemModal({ isOpen, onClose, problem }: ViewProblemModalProps) {
  if (!isOpen || !problem) return null;

  const statusCfg = statusConfig[problem.status as ProblemStatus] || { label: problem.status, className: 'bg-gray-100 text-gray-700' };
  const priorityCfg = priorityConfig[problem.priority as ProblemPriority] || { label: problem.priority, className: 'bg-gray-100 text-gray-700' };
  const categoryColor = categoryColors[problem.category] || { bgClass: 'bg-gray-100', textClass: 'text-gray-700' };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40">
      <div className="bg-surface-container-lowest w-full max-w-[640px] rounded-xl shadow-2xl border border-outline-variant overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="px-5 py-4 border-b border-outline-variant flex justify-between items-center gap-4 bg-surface-bright">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-headline-md text-on-surface">Problem Details</h2>
              <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-label-sm font-bold rounded-lg">
                {problem.ticketId}
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Viewing full details and information regarding this logged problem.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} type="button" className="rounded-full flex-shrink-0">
            <span className="material-symbols-outlined">close</span>
          </Button>
        </div>

        <div className="p-5 space-y-4 custom-scrollbar max-h-[70vh] overflow-y-auto">
          <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/50">
            <h3 className="font-label-md text-on-surface-variant mb-2">Reported By</h3>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-title-medium font-bold text-primary">
                  {problem.employee.fullName?.charAt(0)?.toUpperCase() ?? '?'}
                </span>
              </div>
              <div>
                <p className="font-title-medium text-on-surface font-bold">{problem.employee.fullName}</p>
                <p className="text-body-sm text-on-surface-variant">{problem.employee.department} • {problem.employee.designation}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="font-label-md text-on-surface-variant">Category</span>
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${categoryColor.bgClass} ${categoryColor.textClass}`}>
                  {problem.category}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="font-label-md text-on-surface-variant">Filed Date</span>
              <p className="text-body-md text-on-surface font-medium">{problem.filedDate}</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="font-label-md text-on-surface-variant">Status</span>
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusCfg.className}`}>
                  {statusCfg.label}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="font-label-md text-on-surface-variant">Priority Level</span>
              <div>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${priorityCfg.className} uppercase`}>
                  {priorityCfg.label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-label-md text-on-surface-variant">Problem Description</span>
            <div className="w-full p-3 bg-surface-container-low border border-outline-variant rounded-xl text-body-md text-on-surface whitespace-pre-wrap min-h-[100px]">
              {problem.description || 'No description provided.'}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 bg-surface-bright border-t border-outline-variant flex items-center justify-end">
          <Button onClick={onClose} type="button">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
