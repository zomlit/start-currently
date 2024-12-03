import { Link } from "@tanstack/react-router";
import { ArrowLeft, Home } from "lucide-react";

export function NotFound({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <div className="space-y-6 max-w-md">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          404 - Page Not Found
        </h1>
        <div className="text-xl text-gray-600 dark:text-gray-400">
          {children || (
            <p>Oops! The page you're looking for doesn't seem to exist.</p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
          <Link
            to="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50"
          >
            <Home size={20} />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
