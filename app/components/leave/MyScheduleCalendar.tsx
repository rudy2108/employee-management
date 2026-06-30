import { useState } from "react";
import { Button } from "../ui/Button";

export default function MyScheduleCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2023, 10)); // November 2023

  const monthName = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden h-fit">
      <div className="p-6 border-b border-outline-variant bg-surface-container-low/50">
        <div className="flex justify-between items-center">
          <h4 className="font-headline-md text-headline-md">My Schedule</h4>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
              <span className="material-symbols-outlined text-[20px]">
                chevron_left
              </span>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <span className="material-symbols-outlined text-[20px]">
                chevron_right
              </span>
            </Button>
          </div>
        </div>
        <p className="text-label-md font-bold mt-2">{monthName}</p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          <div className="text-label-sm text-on-surface-variant">S</div>
          <div className="text-label-sm text-on-surface-variant">M</div>
          <div className="text-label-sm text-on-surface-variant">T</div>
          <div className="text-label-sm text-on-surface-variant">W</div>
          <div className="text-label-sm text-on-surface-variant">T</div>
          <div className="text-label-sm text-on-surface-variant">F</div>
          <div className="text-label-sm text-on-surface-variant">S</div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Just representative days */}
          <div className="h-10 flex items-center justify-center text-label-md text-on-surface-variant opacity-40">
            30
          </div>
          <div className="h-10 flex items-center justify-center text-label-md text-on-surface-variant opacity-40">
            31
          </div>
          {[...Array(20)].map((_, i) => (
            <div
              key={i + 1}
              className="h-10 flex items-center justify-center text-label-md hover:bg-surface-container rounded-lg cursor-pointer transition-colors"
            >
              {i + 1}
            </div>
          ))}
          <div className="h-10 flex items-center justify-center text-label-md bg-tertiary/20 text-tertiary font-bold rounded-lg cursor-pointer ring-1 ring-tertiary relative transition-colors">
            22
            <span className="absolute bottom-1 w-1 h-1 bg-tertiary rounded-full"></span>
          </div>
          {[...Array(4)].map((_, i) => (
            <div
              key={i + 23}
              className="h-10 flex items-center justify-center text-label-md hover:bg-surface-container rounded-lg cursor-pointer transition-colors"
            >
              {i + 23}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
