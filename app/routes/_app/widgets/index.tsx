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
    <div className="bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 min-h-screen p-8">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white">
          Widget Gallery
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
          Browse and manage your stream widgets
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {widgetConfigs.map((widget, index) => {
          const Icon = widget.icon;
          return (
            <Link
              key={widget.id}
              to={widget.href}
              className="transform transition-transform hover:scale-105"
            >
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={index}
              >
                <Card className="h-full cursor-pointer border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-white dark:bg-gray-800">
                  <CardHeader className="flex items-center justify-start p-6">
                    <div className="flex items-center">
                      <Icon className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                      <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white ml-4">
                        {widget.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardDescription className="p-6 text-gray-600 dark:text-gray-300 text-base">
                    {widget.description}
                  </CardDescription>
                </Card>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default WidgetsIndex;
