interface SettingsSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  value: string;
}

export function SettingsSection({
  title,
  icon,
  children,
  value,
}: SettingsSectionProps) {
  return (
    <AccordionItem value={value} className="border rounded-md">
      <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]]:rounded-t-lg [&[data-state=closed]]:rounded-md">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{title}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 space-y-4 bg-violet-50 dark:bg-violet-500/10 shadow-inner">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}
