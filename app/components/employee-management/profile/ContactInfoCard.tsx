import React from 'react';

interface ContactInfoCardProps {
  email?: string;
  phone?: string;
}

export default function ContactInfoCard({
  email = "john.doe@company.com",
  phone = "+1 (555) 123-4567"
}: ContactInfoCardProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_4px_6px_-2px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-2 mb-6 border-b border-surface-variant pb-4">
        <span className="material-symbols-outlined text-primary">contact_mail</span>
        <h2 className="text-headline-md font-headline-md text-on-surface text-[18px]">Contact Info</h2>
      </div>
      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <span className="text-label-sm font-label-sm text-on-surface-variant">Email Address</span>
          <a className="text-body-md font-body-md text-primary hover:underline font-medium break-all" href={`mailto:${email}`}>
            {email}
          </a>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-label-sm font-label-sm text-on-surface-variant">Phone Number</span>
          <span className="text-body-md font-body-md text-on-surface font-medium">{phone}</span>
        </div>
      </div>
    </div>
  );
}
