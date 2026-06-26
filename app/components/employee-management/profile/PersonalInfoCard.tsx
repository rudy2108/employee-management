import React from 'react';

interface PersonalInfoCardProps {
  dob?: string;
  gender?: string;
}

export default function PersonalInfoCard({
  dob = "15 Aug, 1988",
  gender = "Male"
}: PersonalInfoCardProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_4px_6px_-2px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-2 mb-6 border-b border-surface-variant pb-4">
        <span className="material-symbols-outlined text-primary">person</span>
        <h2 className="text-headline-md font-headline-md text-on-surface text-[18px]">Personal Info</h2>
      </div>
      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <span className="text-label-sm font-label-sm text-on-surface-variant">Date of Birth</span>
          <span className="text-body-md font-body-md text-on-surface font-medium">{dob}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-label-sm font-label-sm text-on-surface-variant">Gender</span>
          <span className="text-body-md font-body-md text-on-surface font-medium">{gender}</span>
        </div>
      </div>
    </div>
  );
}
