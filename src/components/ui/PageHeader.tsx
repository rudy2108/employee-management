interface PageHeaderProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
      <div>
        <h2 className="text-headline-lg font-headline-lg text-on-surface">{title}</h2>
        <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
