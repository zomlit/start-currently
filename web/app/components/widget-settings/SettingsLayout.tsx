interface SettingsLayoutProps {
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
  loadingFallback?: React.ReactNode;
}

export function SettingsLayout({
  title,
  children,
  isLoading,
  loadingFallback = (
    <div className="space-y-8 p-4">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-[20px] w-full" />
      <Skeleton className="h-[20px] w-full" />
    </div>
  ),
}: SettingsLayoutProps) {
  if (isLoading) return loadingFallback;

  return (
    <Card className="border-border/0 bg-transparent rounded-none p-0">
      <CardHeader className="pl-0">
        <CardTitle className="text-xl font-semibold flex items-center gap-2 p-0">
          <div className="rounded-full p-2">
            <IconAdjustmentsCog className="h-5 w-5" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}
