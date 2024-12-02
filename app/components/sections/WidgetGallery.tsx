import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BarChart2, Gamepad, MessageCircle } from "lucide-react";

interface WidgetCardProps {
  className?: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  image?: string;
  stats?: {
    value: string;
    label: string;
  }[];
  link: string;
  size?: "sm" | "md" | "lg";
  featured?: boolean;
}

export const WidgetCard = ({
  className,
  title,
  description,
  icon,
  image,
  stats,
  link,
  size = "md",
  featured = false,
}: WidgetCardProps) => {
  return (
    <Link
      to={link}
      className={cn(
        "group relative overflow-hidden rounded-3xl p-6 hover:shadow-2xl",
        "bg-white/40 dark:bg-gray-950/40 backdrop-blur-xl",
        "border border-gray-200 dark:border-gray-800",
        "transition-all duration-300",
        featured && "md:col-span-2 md:row-span-2",
        size === "sm" && "p-4",
        size === "lg" && "p-8",
        className
      )}
    >
      <div className="relative z-10 h-full shadow-text">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-500/10 p-2 dark:bg-violet-500/20">
              {icon}
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <ArrowRight className="h-4 w-4 transform transition-transform group-hover:translate-x-1" />
        </div>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>

        {image && (
          <div className="mt-6 overflow-hidden rounded-2xl">
            <motion.img
              src={image}
              alt={title}
              className="w-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {stats && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            {stats.map((stat, i) => (
              <div key={i}>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

export function WidgetGallery() {
  return (
    <div className="space-y-8 py-2">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <WidgetCard
          featured
          title="Gamepad Visualizer"
          description="Real-time controller input display with customizable styles and animations"
          icon={<Gamepad className="h-5 w-5 text-violet-500" />}
          image="/images/widgets/gamepad-preview.webp"
          stats={[
            { value: "20+", label: "Themes" },
            { value: "100%", label: "Customizable" },
            { value: "60fps", label: "Performance" },
          ]}
          link="/widgets/gamepad"
        />

        <WidgetCard
          size="sm"
          title="Chat Widget"
          description="Stylish chat overlay with custom emotes and badges"
          icon={<MessageCircle className="h-5 w-5 text-violet-500" />}
          link="/widgets/chat"
        />

        <WidgetCard
          size="lg"
          title="Analytics"
          description="Track your stream performance and viewer engagement"
          icon={<BarChart2 className="h-5 w-5 text-violet-500" />}
          stats={[
            { value: "24/7", label: "Tracking" },
            { value: "100+", label: "Metrics" },
          ]}
          link="/widgets/analytics"
        />

        {/* Add more widgets */}
      </div>
    </div>
  );
}
