import { CARD_SHADOW } from "../../lib/Utils";

export interface BarChartItem {
  key: string;
  label: string;
  count: number;
  percentage: number;
  barColor: string;
  textColor: string;
  suffix?: string;
}

interface BarChartCardProps {
  title: string;
  items: BarChartItem[];
}

export default function BarChartCard({ title, items }: BarChartCardProps) {
  return (
    <div
      className="bg-surface-container-lowest rounded-xl border border-surface-container-highest overflow-hidden"
      style={CARD_SHADOW}
    >
      <div className="p-3 border-b border-surface-container-highest">
        <h3 className="text-headline-md font-headline-md text-on-surface">{title}</h3>
      </div>
      <div className="p-3 flex flex-col gap-2.5">
        {items.map((item) => (
          <div key={item.key}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-label-md font-label-md text-on-surface">{item.label}</span>
              <span className={`text-label-sm font-label-sm font-bold ${item.textColor}`}>
                {item.count}
                {item.suffix && (
                  <span className="text-on-surface-variant font-normal"> {item.suffix}</span>
                )}
              </span>
            </div>
            <div className="w-full h-2 bg-surface-container-highest rounded-full">
              <div
                className={`h-full rounded-full ${item.barColor}`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
