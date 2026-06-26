import React from 'react';

interface EmploymentDetailsCardProps {
  department?: string;
  designation?: string;
  dateOfJoining?: string;
  tenure?: string;
}

export default function EmploymentDetailsCard({
  department = "Technology",
  designation = "Senior Developer",
  dateOfJoining = "01 Mar, 2020",
  tenure = "3 yrs 8 mos"
}: EmploymentDetailsCardProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_4px_6px_-2px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-2 mb-6 border-b border-surface-variant pb-4">
        <span className="material-symbols-outlined text-primary">work</span>
        <h2 className="text-headline-md font-headline-md text-on-surface text-[18px]">Employment</h2>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-label-sm font-label-sm text-on-surface-variant">Department</span>
            <span className="text-body-md font-body-md text-on-surface font-medium">{department}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-label-sm font-label-sm text-on-surface-variant">Designation</span>
            <span className="text-body-md font-body-md text-on-surface font-medium">{designation}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 pt-2">
          <span className="text-label-sm font-label-sm text-on-surface-variant">Date of Joining</span>
          <span className="text-body-md font-body-md text-on-surface font-medium">
            {dateOfJoining} ({tenure})
          </span>
        </div>
      </div>
    </div>
  );
}
