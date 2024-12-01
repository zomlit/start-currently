import { getAuth } from "@clerk/tanstack-start/server";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { getWebRequest } from "vinxi/http";

export const requireAuth = createServerFn({ method: "GET" }).handler(
  async () => {
    const { userId } = await getAuth(getWebRequest());

    if (!userId) {
      throw redirect({
        to: "/sign-in",
        search: () =>
          ({
            returnTo: "/widgets/gamepad",
          }) as { returnTo: string },
      });
    }

    return { userId };
  }
);

export type SearchParams = {
  returnTo?: string;
  error?: string;
};

export function getReturnTo(search: SearchParams): string {
  return search.returnTo || "/";
}
