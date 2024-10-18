import React from "react";
import { ErrorComponentProps, Link, useRouter } from "@tanstack/react-router";
import { RefreshCw, Home } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();

  console.error("Caught error:", error);
  console.error("Caught error:", error);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <div className="space-y-6 max-w-md">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Oops! Something went wrong
        </h1>
        <div className="text-xl text-gray-600 dark:text-gray-400">
          <div className="text-xl text-gray-600 dark:text-gray-400 space-y-4">
            <p>We encountered an unexpected error. Here are the details:</p>
            <div className="bg-gray-100 dark:bg-background/50 p-4 rounded-lg text-left">
              <p className="font-mono text-sm text-red-600 dark:text-red-400">
                {error.message || "Unknown error"}
              </p>
              {error.stack && (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="stack-trace">
                    <AccordionTrigger className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                      Stack trace
                    </AccordionTrigger>
                    <AccordionContent className="spring-bounce-60 spring-duration-300">
                      <pre className="mt-2 whitespace-pre-wrap text-xs text-gray-600 dark:text-gray-400 overflow-hidden">
                        {error.stack}
                      </pre>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          </div>{" "}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <button
            onClick={() => {
              router.invalidate();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
          >
            <RefreshCw size={20} />
            Try Again
          </button>
          <Link
            to="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50"
          >
            <Home size={20} />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
