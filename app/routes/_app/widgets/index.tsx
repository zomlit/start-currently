import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { widgetConfigs } from "@/config/widgets";
import { WidgetAuthGuard } from "@/components/auth/WidgetAuthGuard";

export const Route = createFileRoute("/_app/widgets/")({
  component: () => (
    <WidgetAuthGuard>
      <WidgetsIndex />
    </WidgetAuthGuard>
  ),
});

function WidgetsIndex() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {widgetConfigs.map((widget) => {
        const Icon = widget.icon;
        return (
          <Link
            key={widget.id}
            to={widget.href}
            className="transition-transform hover:scale-[1.02]"
          >
            <Card className="h-full cursor-pointer border-2 hover:border-primary">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="h-6 w-6" />
                  <CardTitle>{widget.title}</CardTitle>
                </div>
                <CardDescription>{widget.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
