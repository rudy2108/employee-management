import { useQuery } from "@tanstack/react-query";
import { holidayAPI } from "../../services/Api";
import { CARD_SHADOW } from "../../lib/Utils";

export default function UpcomingHolidaysCard() {
  const { data: holidays = [] } = useQuery({ queryKey: ['holidays'], queryFn: holidayAPI.fetchAll });

  const now = new Date();
  const upcomingHolidays = holidays
    .filter((h) => {
      try {
        return new Date(h.date) >= now;
      } catch {
        return false;
      }
    })
    .slice(0, 5);

  return (
    <div
      className="flex-1 bg-surface-container-lowest rounded-xl border border-surface-container-highest overflow-hidden"
      style={CARD_SHADOW}
    >
      <div className="p-4 border-b border-surface-container-highest">
        <h3 className="text-headline-md font-headline-md text-on-surface">Upcoming Holidays</h3>
      </div>
      <div className="divide-y divide-surface-container-highest">
        {upcomingHolidays.length === 0 ? (
          <p className="p-4 text-center text-on-surface-variant">No upcoming holidays.</p>
        ) : (
          upcomingHolidays.map((h) => (
            <div key={h.id} className="p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[18px]">celebration</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body-sm font-body-sm text-on-surface font-medium truncate">{h.name}</p>
                <p className="text-label-sm font-label-sm text-on-surface-variant">{h.date}</p>
              </div>
              <span
                className={`text-label-sm font-label-sm px-2 py-0.5 rounded-full shrink-0 ${
                  h.type === "Public" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                }`}
              >
                {h.type}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
