import { ErrorComponent, Link, createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { postQueryOptions } from "@/utils/posts";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { NotFound } from "@/components/NotFound";
import { Spinner } from "@/components/ui/spinner";

export const Route = createFileRoute("/_app/posts/$postId")({
  loader: async ({ params: { postId }, context }) => {
    const data = await context.queryClient.ensureQueryData(
      postQueryOptions(postId)
    );
    return { data };
  },
  meta: ({ loaderData }) => [
    {
      title: loaderData?.data?.title || "Post Details",
    },
  ],
  errorComponent: PostErrorComponent as any,
  notFoundComponent: () => {
    return <NotFound>Post not found</NotFound>;
  },
  component: PostComponent,
});

export function PostErrorComponent({ error }: ErrorComponentProps) {
  return <ErrorComponent error={error} />;
}

function PostComponent() {
  const { postId } = Route.useParams();
  const postQuery = useSuspenseQuery(postQueryOptions(postId));

  if (postQuery.isLoading) {
    return <Spinner className="w-8 fill-violet-300 text-white" />;
  }

  if (!postQuery.data) {
    return <NotFound>Post not found</NotFound>;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xl font-bold underline">{postQuery.data.title}</h4>
      <div className="text-sm">{postQuery.data.body}</div>
      <Link
        to="/posts/$postId/deep"
        params={{
          postId: postQuery.data.id,
        }}
        activeProps={{ className: "text-black font-bold" }}
        className="block py-1 text-blue-800 hover:text-blue-600"
      >
        Deep View
      </Link>
    </div>
  );
}
