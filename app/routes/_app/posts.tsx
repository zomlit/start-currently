import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Link,
  Outlet,
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import { postsQueryOptions, PostType } from "@/utils/posts";
import { Container } from "@/components/layout/Container";
import { useState, useEffect, Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import GenericHeader from "@/components/GenericHeader";

export const Route = createFileRoute("/_app/posts")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(postsQueryOptions());
  },
  meta: () => [{ title: "Blog Posts" }],
  component: PostsComponent,
});

function PostsComponent() {
  const postsQuery = useSuspenseQuery(postsQueryOptions());
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
  const navigate = useNavigate();

  const handlePostClick = (post: PostType) => {
    setSelectedPost(post);
    navigate({ to: "/posts/$postId", params: { postId: post.id } });
  };

  return (
    <Container maxWidth="7xl" paddingTop="lg">
      <GenericHeader
        title="Posts"
        category={""}
        description={""}
        className="text-7xl font-bold"
      />

      <div className="flex flex-col md:flex-row gap-8 relative z-40">
        <div className="md:w-1/3">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
            Recent Posts
          </h2>
          <ul className="space-y-2">
            {postsQuery.data.map((post: PostType) => (
              <li key={post.id}>
                <Link
                  to="/posts/$postId"
                  params={{
                    postId: post.id,
                  }}
                  className="block py-2 px-4 rounded-md transition duration-150 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-700"
                  activeProps={{
                    className:
                      "bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-200",
                  }}
                  onClick={() => handlePostClick(post)}
                >
                  <div className="font-medium text-gray-800 dark:text-gray-200">
                    {post.title.substring(0, 30)}...
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {post.body.substring(0, 60)}...
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:w-2/3">
          <Suspense
            fallback={<Spinner className="w-8 fill-violet-300 text-white" />}
          >
            {/* <PostPreview post={selectedPost} /> */}
            <div className="mt-8">
              <Outlet />
            </div>
          </Suspense>
        </div>
      </div>
    </Container>
  );
}
