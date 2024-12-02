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
import { motion } from "framer-motion";
import { WidgetCard, WidgetGallery } from "@/components/sections/WidgetGallery";

export const Route = createFileRoute("/_app/widgets/")({
  component: () => (
    <WidgetAuthGuard>
      <WidgetsIndex />
    </WidgetAuthGuard>
  ),
});

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
    },
  }),
};

function WidgetsIndex() {
  return (
    <div className="">
      <WidgetGallery />

      {/* <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {widgetConfigs.map((widget, index) => {
          const Icon = widget.icon;
          return (
            <Link
              key={widget.id}
              to={widget.href}
              className="transition-transform hover:scale-[1.03] transform-gpu"
            >
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={index}
              >
                <Card className="h-full cursor-pointer border border-gray-300 dark:border-white/10 rounded-md shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-white/10">
                  <CardHeader className="flex items-center justify-start p-6">
                    <div className="flex items-center">
                      <Icon className="h-16 w-16 text-purple-600 dark:text-purple-400" />
                      <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white ml-4">
                        {widget.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardDescription className="p-6 text-gray-600 dark:text-gray-300 text-center text-base">
                    {widget.description}
                  </CardDescription>
                </Card>
              </motion.div>
            </Link>
          );
        })}
      </div> */}
    </div>
  );
}

export default WidgetsIndex;
