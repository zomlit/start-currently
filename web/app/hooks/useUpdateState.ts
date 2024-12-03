import { useMutation, useQueryClient } from "@tanstack/react-query";
import debounce from "lodash/debounce";

export function useUpdateState(bracketId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (state: any) => {
      const response = await fetch(`/api/state`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bracketId, state }),
      });
      if (!response.ok) throw new Error("Failed to update state");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["bracket", bracketId], data);
    },
  });

  const debouncedMutate = debounce(mutation.mutate, 500);

  return { ...mutation, debouncedMutate };
}
