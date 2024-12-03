import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { supabase } from "@/utils/supabase/client";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Database } from "@/types/supabase";
import { toast } from "@/utils/toast";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect } from "react";

type ModelName = keyof Database["public"]["Tables"];

type DatabaseState = {
  [K in ModelName]?: Database["public"]["Tables"][K]["Row"][];
} & {
  currentUserId: string | null;
  loading: boolean;
  error: string | null;
  isElysiaSocketConnected: boolean;
  currentTrack: any | null;
  visualizerWidgetSubscription: RealtimeChannel | null;
  activeSubscriptions: Set<ModelName>;
};

type DatabaseActions = {
  setCurrentUserId: (userId: string | null) => void;
  fetchAllData: () => Promise<void>;
  subscribeToChanges: () => Promise<void>;
  unsubscribeFromChanges: () => Promise<void>;
  createRecord: <T extends ModelName>(
    model: T,
    data: Database["public"]["Tables"][T]["Insert"]
  ) => Promise<void>;
  updateRecord: <T extends ModelName>(
    model: T,
    id: string,
    data: Database["public"]["Tables"][T]["Update"]
  ) => Promise<void>;
  deleteRecord: <T extends ModelName>(model: T, id: string) => Promise<void>;
  setUserData: (table: ModelName, data: any[]) => void;
  subscribeToVisualizerWidget: (userId: string) => void;
  unsubscribeFromVisualizerWidget: () => void;
  setCurrentTrack: (track: any) => void;
  subscribeToTable: (table: ModelName) => void;
  unsubscribeFromTable: (table: ModelName) => void;
};

const initialState: DatabaseState = {
  currentUserId: null,
  loading: false,
  error: null,
  isElysiaSocketConnected: false,
  currentTrack: null,
  visualizerWidgetSubscription: null,
  activeSubscriptions: new Set<ModelName>(),
};

export const useDatabaseStore = create<DatabaseState & DatabaseActions>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,
      setCurrentUserId: (userId) => {
        set({ currentUserId: userId });
        if (userId) {
          get().fetchAllData();
          get().subscribeToChanges();
        }
      },
      fetchAllData: async () => {
        const { currentUserId } = get();
        if (!currentUserId) {
          console.log("No currentUserId available, skipping data fetch");
          return;
        }

        set({ loading: true, error: null });
        try {
          const { data: tables, error: tablesError } =
            await supabase.rpc("get_user_tables");
          if (tablesError) throw tablesError;
          const models = tables.map(
            (table: { table_name: string }) => table.table_name
          ) as ModelName[];

          const dataFetches = models.map((model) =>
            supabase.from(model).select("*").eq("user_id", currentUserId)
          );

          const results = await Promise.all(dataFetches);

          const newState = results.reduce((acc, result, index) => {
            const model = models[index];
            acc[model] = result.data || [];
            return acc;
          }, {} as DatabaseState);

          set({ ...newState, loading: false });
        } catch (error) {
          console.error("Error fetching data:", error);
          set({ error: (error as Error).message, loading: false });
        }
      },
      subscribeToChanges: async () => {
        const { currentUserId, activeSubscriptions } = get();
        if (!currentUserId) return;

        const { data: tables, error: tablesError } =
          await supabase.rpc("get_user_tables");
        if (tablesError) throw tablesError;
        const models = tables.map(
          (table: { table_name: string }) => table.table_name
        ) as ModelName[];

        models.forEach((model) => {
          if (activeSubscriptions.has(model)) {
            const subscription = supabase
              .channel(`public:${model}`)
              .on<RealtimePostgresChangesPayload<any>>(
                "postgres_changes",
                { event: "*", schema: "public", table: model },
                (payload) => {
                  const { new: newData } = payload;
                  set((state) => ({
                    [model]: state[model]?.map((item) =>
                      item.id === newData.id ? newData : item
                    ) || [newData],
                  }));
                }
              )
              .subscribe();

            set((state) => ({
              [`${model}Subscription`]: subscription,
            }));
          }
        });
      },
      unsubscribeFromChanges: async () => {
        const { activeSubscriptions } = get();
        activeSubscriptions.forEach((model) => {
          const subscription =
            get()[`${model}Subscription` as keyof DatabaseState];
          if (subscription) {
            supabase.removeChannel(subscription as any);
          }
        });
        set({ activeSubscriptions: new Set() });
      },
      createRecord: async <T extends ModelName>(
        model: T,
        data: Database["public"]["Tables"][T]["Insert"]
      ) => {
        try {
          const { data: record, error } = await supabase
            .from(model)
            .insert(data)
            .single();
          if (error) throw error;
          set((state) => ({ [model]: [...(state[model] || []), record] }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },
      updateRecord: async <T extends ModelName>(
        model: T,
        id: string,
        data: Database["public"]["Tables"][T]["Update"]
      ) => {
        try {
          const { data: record, error } = await supabase
            .from(model)
            .update(data)
            .eq("id", id)
            .single();
          if (error) throw error;
          set((state) => ({
            [model]: (state[model] || []).map((r) =>
              r.id === id ? record : r
            ),
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },
      deleteRecord: async <T extends ModelName>(model: T, id: string) => {
        try {
          const { error } = await supabase.from(model).delete().eq("id", id);
          if (error) throw error;
          set((state) => ({
            [model]: (state[model] || []).filter((r) => r.id !== id),
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },
      setUserData: (table, data) => {
        set((state) => ({
          [table]: data,
        }));
      },
      subscribeToVisualizerWidget: (userId: string) => {
        const channel = supabase
          .channel(`public:VisualizerWidget:${userId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "VisualizerWidget",
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              const { new: newData } = payload;
              if (newData) {
                set((state) => ({
                  VisualizerWidget: [newData],
                }));
              }
            }
          )
          .subscribe();

        set({ visualizerWidgetSubscription: channel });
      },
      unsubscribeFromVisualizerWidget: () => {
        const { visualizerWidgetSubscription } = get();
        if (visualizerWidgetSubscription) {
          supabase.removeChannel(visualizerWidgetSubscription);
          set({ visualizerWidgetSubscription: null });
        }
      },
      setCurrentTrack: (track: any) => {
        set({ currentTrack: track });
      },
      subscribeToTable: (table: ModelName) => {
        set((state) => {
          const newActiveSubscriptions = new Set(state.activeSubscriptions);
          newActiveSubscriptions.add(table);
          return { activeSubscriptions: newActiveSubscriptions };
        });
        get().subscribeToChanges();
      },
      unsubscribeFromTable: (table: ModelName) => {
        set((state) => {
          const newActiveSubscriptions = new Set(state.activeSubscriptions);
          newActiveSubscriptions.delete(table);
          return { activeSubscriptions: newActiveSubscriptions };
        });
        const subscription =
          get()[`${table}Subscription` as keyof DatabaseState];
        if (subscription) {
          supabase.removeChannel(subscription as any);
        }
      },
    })),
    { name: "DatabaseStore" }
  )
);

// React Query setup
export const useUserDataQuery = (table: ModelName, userId: string) => {
  const queryClient = useQueryClient();
  const { subscribeToTable, unsubscribeFromTable } = useDatabaseStore();

  useEffect(() => {
    subscribeToTable(table);
    return () => {
      unsubscribeFromTable(table);
    };
  }, [table, subscribeToTable, unsubscribeFromTable]);

  return useQuery({
    queryKey: [table, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("user_id", userId);
      if (error) {
        console.error(`Error fetching ${table} data:`, error);
        toast.error({
          title: `Failed to fetch ${table} data. Please try again.`,
        });
        throw error;
      }
      if (!data) {
        console.warn(`No ${table} data found for user ${userId}`);
        return [];
      }
      return data;
    },
    onSuccess: (data) => {
      useDatabaseStore.getState().setUserData(table, data);
    },
    onError: (error: Error) => {
      console.error(`Error in useUserDataQuery for ${table}:`, error);
      toast.error({
        title: `An error occurred while fetching ${table} data. Please try again later.`,
      });
    },
  });
};

// Add a hook to automatically subscribe to VisualizerWidget updates
export const useVisualizerWidgetSubscription = (userId: string | null) => {
  const subscribeToVisualizerWidget = useDatabaseStore(
    (state) => state.subscribeToVisualizerWidget
  );
  const unsubscribeFromVisualizerWidget = useDatabaseStore(
    (state) => state.unsubscribeFromVisualizerWidget
  );

  useEffect(() => {
    if (userId) {
      subscribeToVisualizerWidget(userId);
      return () => {
        unsubscribeFromVisualizerWidget();
      };
    }
  }, [userId, subscribeToVisualizerWidget, unsubscribeFromVisualizerWidget]);
};
