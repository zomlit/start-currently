import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { createGlobalSlice, GlobalState } from "./globalStore";

export const useCombinedStore = create<GlobalState>()(
  devtools(
    (...a) => ({
      ...createGlobalSlice(...a),
    }),
    { name: "GlobalStore" }
  )
);
