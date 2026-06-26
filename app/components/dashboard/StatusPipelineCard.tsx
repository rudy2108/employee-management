import { CARD_SHADOW } from "../../lib/Utils";

export interface StatTile {
  label: string;
  value: number;
  color: string;
  bg: string;
}

export interface MiniBarItem {
  key: string;
  label: string;
  count: number;
  percentage: number;
}

interface StatusPipelineCardProps {
  title: string;
  stats: StatTile[];
  breakdownLabel: string;
  breakdownItems: MiniBarItem[];
  barColor?: string;
}

export default function StatusPipelineCard({
  title,
  stats,
  breakdownLabel,
  breakdownItems,
  barColor = "bg-primary",
}: StatusPipelineCardProps) {
  return (
    <div
      className="flex-1 bg-surface-container-lowest rounded-xl border border-surface-container-highest p-4"
      style={CARD_SHADOW}
    >
      <h3 className="text-headline-md font-headline-md text-on-surface mb-4">{title}</h3>
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {stats.map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-2.5 text-center`}>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-label-sm font-label-sm text-on-surface-variant mt-1">{label}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2.5">
        <p className="text-label-sm font-label-sm text-on-surface-variant mb-2">{breakdownLabel}</p>
        {breakdownItems.map((item) => (
          <div key={item.key}>
            <div className="flex justify-between mb-1">
              <span className="text-label-sm font-label-sm text-on-surface">{item.label}</span>
              <span className="text-label-sm font-label-sm text-on-surface-variant">{item.count}</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-highest rounded-full">
              <div className={`h-full ${barColor} rounded-full`} style={{ width: `${item.percentage}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
