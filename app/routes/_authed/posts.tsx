import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { fetchPosts } from "../../utils/posts";
import { motion } from "framer-motion";
import { mainTransitionProps } from "../../components/PageTransition";
import BackgroundImage from "../../components/ui/background-image";
import { AlertCircle, Terminal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";

export const Route = createFileRoute("/_authed/posts")({
  loader: () => fetchPosts(),
  component: PostsComponent,
});

function PostsComponent() {
  const posts = Route.useLoaderData();

  if (!Array.isArray(posts)) {
    return (
      <div>
        <Alert className="text-pink-500 my-4 max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-lg">
          <AlertCircle className="h-4 w-4 stroke-pink-500" />
          <AlertTitle>Error: Unable to load posts</AlertTitle>
          <AlertDescription>
            <p>
              An unexpected error occurred while fetching the posts. Please try
              again later or contact support if the issue persists.
            </p>
            <pre className="my-4 p-2 border border-pink-500/20 rounded-md text-sm overflow-auto">
              {getErrorDetails(posts)}
            </pre>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <motion.div className="p-2" {...mainTransitionProps}>
      <ul className="list-disc pl-4">
        {[...posts, { id: "i-do-not-exist", title: "Non-existent Post" }].map(
          (post) => (
            <li key={post.id} className="whitespace-nowrap">
              <Link
                to="/posts/$postId"
                params={{
                  postId: post.id,
                }}
                className="block py-1 text-blue-800 hover:text-blue-600"
                activeProps={{ className: "text-black font-bold" }}
              >
                <div>{post.title.substring(0, 20)}</div>
              </Link>
            </li>
          )
        )}
      </ul>
      <hr />
      <Outlet />
    </motion.div>
  );
}

function isError(value: unknown): value is Error {
  return value instanceof Error;
}

function getErrorDetails(error: unknown): string {
  if (isError(error)) {
    return `Error: ${error.message}\n\nStack Trace:\n${error.stack}`;
  }
  if (error && typeof error === "object") {
    return JSON.stringify(error, null, 2);
  }
  return String(error);
}
