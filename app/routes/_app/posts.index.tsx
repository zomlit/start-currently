import GenericHeader from "@/components/GenericHeader";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/posts/")({
  component: PostsIndexComponent,
});

function PostsIndexComponent() {
  return (
    <div>
      <GenericHeader
        category="Pricing"
        title="Creator Plans"
        className="font-black"
        description="Get priority support, expanded customization, early access and more."
      />
      Select a post.
    </div>
  );
}
