import { Button } from "../ui/Button";

interface LeaveModalForm {
  reason: string;
  urgency: 'immediate' | 'regular';
  startDate: string;
  endDate: string;
  singleDay: boolean;
}

interface LeaveRequestModalProps {
  employeeName: string;
  form: LeaveModalForm;
  formError: string;
  onClose: () => void;
  onFormChange: (updates: Partial<LeaveModalForm>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function LeaveRequestModal({
  employeeName,
  form,
  formError,
  onClose,
  onFormChange,
  onSubmit,
}: LeaveRequestModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md border border-surface-variant"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-surface-variant">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">event_note</span>
            </div>
            <div>
              <h3 className="text-headline-sm font-headline-sm text-on-surface">Request Leave</h3>
              <p className="text-label-sm font-label-sm text-on-surface-variant">{employeeName}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} type="button">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </Button>
        </div>

        <form onSubmit={onSubmit} className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-label-md font-label-md text-on-surface">
              Reason for Leave <span className="text-error">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Describe the reason for leave..."
              value={form.reason}
              onChange={(e) => onFormChange({ reason: e.target.value })}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-body-sm font-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-label-md font-label-md text-on-surface">Leave Type</label>
            <div className="grid grid-cols-2 gap-3">
              {(['regular', 'immediate'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onFormChange({ urgency: opt })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-label-md font-label-md transition-colors ${
                    form.urgency === opt
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {opt === 'immediate' ? 'priority_high' : 'schedule'}
                  </span>
                  {opt === 'immediate' ? 'Immediate' : 'Regular'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="singleDay"
              type="checkbox"
              checked={form.singleDay}
              onChange={(e) =>
                onFormChange({
                  singleDay: e.target.checked,
                  endDate: e.target.checked ? form.startDate : form.endDate,
                })
              }
              className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
            />
            <label htmlFor="singleDay" className="text-label-md font-label-md text-on-surface cursor-pointer">
              Single day leave
            </label>
          </div>

          <div className={`grid gap-3 ${form.singleDay ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <div className="space-y-1.5">
              <label className="text-label-sm font-label-sm text-on-surface-variant">
                {form.singleDay ? 'Date' : 'From Date'} <span className="text-error">*</span>
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => onFormChange({ startDate: e.target.value })}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
            {!form.singleDay && (
              <div className="space-y-1.5">
                <label className="text-label-sm font-label-sm text-on-surface-variant">
                  To Date <span className="text-error">*</span>
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  min={form.startDate}
                  onChange={(e) => onFormChange({ endDate: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            )}
          </div>

          {formError && (
            <p className="flex items-center gap-1.5 text-label-sm font-label-sm text-error">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {formError}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
            >
              Submit Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
