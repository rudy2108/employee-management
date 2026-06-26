import React from 'react';

interface LeaveSummaryCardProps {
  leavesTaken?: number;
  leaveBalance?: number;
}

export default function LeaveSummaryCard({
  leavesTaken = 12,
  leaveBalance = 8
}: LeaveSummaryCardProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_4px_6px_-2px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:shadow-[0_20px_25px_-5px_rgba(124,58,237,0.1)] transition-shadow">
      <div className="absolute right-[-20px] top-[-20px] bg-primary-container/5 rounded-full w-32 h-32 group-hover:scale-110 transition-transform duration-500 pointer-events-none"></div>
      <div className="flex items-center gap-2 mb-6 border-b border-surface-variant pb-4 relative z-10">
        <span className="material-symbols-outlined text-primary">event_note</span>
        <h2 className="text-headline-md font-headline-md text-on-surface text-[18px]">Leave Summary</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div className="bg-surface-container-low rounded-lg p-4 flex flex-col justify-center border border-surface-variant/50">
          <span className="text-label-sm font-label-sm text-on-surface-variant mb-1">Leaves Taken</span>
          <div className="text-headline-lg font-headline-lg text-primary">
            {leavesTaken.toString().padStart(2, '0')}
          </div>
        </div>
        <div className="bg-surface-container-low rounded-lg p-4 flex flex-col justify-center border border-surface-variant/50">
          <span className="text-label-sm font-label-sm text-on-surface-variant mb-1">Leave Balance</span>
          <div className="text-headline-lg font-headline-lg text-secondary">
            {leaveBalance.toString().padStart(2, '0')}
          </div>
        </div>
      </div>
    </div>
  );
}
