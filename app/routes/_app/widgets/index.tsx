import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  MessageSquare,
  Music2,
  PlaySquare,
  Bell,
  Gamepad2,
} from "lucide-react";

interface WidgetCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

export const Route = createFileRoute("/_app/widgets/")({
  component: WidgetsIndex,
});

function WidgetsIndex() {
  const widgets: WidgetCard[] = [
    {
      title: "Visualizer",
      description: "Create dynamic visual effects for your stream",
      icon: <BarChart3 className="h-6 w-6" />,
      href: "/widgets/visualizer",
    },
    {
      title: "Lyrics",
      description: "Display synchronized lyrics during music playback",
      icon: <Music2 className="h-6 w-6" />,
      href: "/widgets/lyrics",
    },
    {
      title: "Chat",
      description: "Customize your stream chat experience",
      icon: <MessageSquare className="h-6 w-6" />,
      href: "/widgets/chat",
    },
    {
      title: "Alerts",
      description: "Set up and customize stream alerts",
      icon: <Bell className="h-6 w-6" />,
      href: "/widgets/alerts",
    },
    {
      title: "Stats",
      description: "Display real-time statistics and metrics",
      icon: <BarChart3 className="h-6 w-6" />,
      href: "/widgets/stats",
    },
    {
      title: "Gamepad",
      description: "Show controller inputs and game interactions",
      icon: <Gamepad2 className="h-6 w-6" />,
      href: "/widgets/gamepad",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {widgets.map((widget) => (
        <Link
          key={widget.title}
          to={widget.href}
          className="transition-transform hover:scale-[1.02]"
        >
          <Card className="h-full cursor-pointer border-2 hover:border-primary">
            <CardHeader>
              <div className="flex items-center gap-2">
                {widget.icon}
                <CardTitle>{widget.title}</CardTitle>
              </div>
              <CardDescription>{widget.description}</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
