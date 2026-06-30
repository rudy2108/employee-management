import { Link } from 'react-router'

interface ProfileHeaderProps {
  name?: string;
  department?: string;
  status?: string;
  designation?: string;
  employeeId?: string;
  imageUrl?: string;
  editUrl?: string;
  showDeleteButton?: boolean;
}

export default function ProfileHeader({
  name = "John Doe",
  department = "Tech Dept",
  status = "Active",
  designation = "Senior Developer",
  employeeId = "EMP-123",
  editUrl,
  showDeleteButton = false,
}: ProfileHeaderProps) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 flex flex-col md:flex-row items-start md:items-center gap-8 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_4px_6px_-2px_rgba(0,0,0,0.02)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/5 rounded-bl-full pointer-events-none"></div>
      <div className="w-32 h-32 rounded-full border-4 border-surface shadow-sm z-10 bg-primary/10 text-primary flex items-center justify-center text-4xl font-semibold">
        <span>{initials}</span>
      </div>
      
      <div className="flex-1 z-10">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
          <h1 className="text-headline-lg font-headline-lg text-on-surface">{name}</h1>
          <div className="flex gap-2">
            <span className="bg-tertiary-container/10 text-tertiary-container border border-tertiary-container text-label-sm font-label-sm px-3 py-1 rounded-full inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
              {department}
            </span>
            <span className="bg-secondary/10 text-secondary border border-secondary text-label-sm font-label-sm px-3 py-1 rounded-full inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              {status}
            </span>
          </div>
        </div>
        <p className="text-body-lg font-body-lg text-on-surface-variant mb-1">{designation}</p>
        <p className="text-label-sm font-label-sm text-outline">{employeeId}</p>
      </div>

      {(showDeleteButton || editUrl) && (
        <div className="flex gap-3 z-10 w-full md:w-auto mt-4 md:mt-0">
          {showDeleteButton && (
            <button className="flex-1 md:flex-none bg-surface-container-lowest text-error border border-error hover:bg-error/10 px-6 py-2 rounded-lg text-label-md font-label-md transition-colors active:scale-95 shadow-sm">
              Delete
            </button>
          )}
          {editUrl && (
            <Link
              to={editUrl}
              className="flex-1 md:flex-none bg-primary text-on-primary px-6 py-2 rounded-lg text-label-md font-label-md hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
