import { useQuery } from '@tanstack/react-query';
import { optionsAPI } from '../../services/Api';

interface ProblemsFiltersBarProps {
  search: string;
  categoryFilter: string;
  statusFilter: string;
  filteredCount: number;
  totalCount: number;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export default function ProblemsFiltersBar({
  search,
  categoryFilter,
  statusFilter,
  filteredCount,
  totalCount,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
}: ProblemsFiltersBarProps) {
  const { data: problemCategories = [] } = useQuery({ queryKey: ['problemCategories'], queryFn: optionsAPI.fetchProblemCategories });

  return (
    <div className="p-4 border-b border-outline-variant flex flex-col md:flex-row gap-3 justify-between items-center bg-surface-container-low/50">
      <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
        <div className="relative flex-grow md:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
            search
          </span>
          <input
            className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-lg text-label-md bg-white focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Filter by Ticket ID or Employee"
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-4 py-2 border border-outline-variant rounded-lg bg-white text-label-md focus:ring-2 focus:ring-primary focus:outline-none"
        >
          <option value="all">All Categories</option>
          {problemCategories.map((category) => (
            <option key={category.id} value={category.value}>{category.label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-4 py-2 border border-outline-variant rounded-lg bg-white text-label-md focus:ring-2 focus:ring-primary focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-label-sm text-on-surface-variant">
          Displaying {filteredCount} of {totalCount} entries
        </p>
      </div>
    </div>
  );
}
