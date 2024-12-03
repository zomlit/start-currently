interface StatusIndicatorProps {
  isPresent: boolean;
  label?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isPresent,
  label = "Connected",
}) => {
  console.log("StatusIndicator props:", { isPresent, label }); // Add logging

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`h-2 w-2 rounded-full ${
          isPresent ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
};
