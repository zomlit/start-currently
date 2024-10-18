import { SupabaseClient } from "@supabase/supabase-js";

interface SaveDataToSupabaseParams {
  supabase: SupabaseClient;
  tableName: string;
  uniqueKey: string;
  uniqueValue: string | number;
  data: Record<string, any>;
  updateDescription: string;
  showToast?: boolean;
  toastMessage?: string;
}

export const saveDataToSupabase = async ({
  supabase,
  tableName,
  uniqueKey,
  uniqueValue,
  data,
  updateDescription,
  showToast = true,
  toastMessage = "",
}: SaveDataToSupabaseParams): Promise<{ success: boolean; message: string }> => {
  const upsertData = {
    [uniqueKey]: uniqueValue,
    ...data,
  };

  const { error } = await supabase.from(tableName).upsert(upsertData, {
    onConflict: uniqueKey,
  });

  if (error) {
    return {
      success: false,
      message: `Error updating ${updateDescription}: ${error.message}`,
    };
  } else {
    const message = toastMessage || `${updateDescription} updated successfully.`;
    return { success: true, message };
  }
};

interface HandleFieldChangeParams {
  fieldName: string;
  value: any;
  updateState: (callback: (prevState: any) => any) => void;
  tableName: string;
  uniqueKey: string;
  uniqueValue: string | number;
  updateDescription: string;
  store: GenericStore;
  stateSlice: string;
  showToast?: boolean;
  toastMessage?: string;
}

type GenericStore = {
  getState: () => any;
};

export const handleFieldChange = async ({
  fieldName,
  value,
  updateState,
  tableName,
  uniqueKey,
  uniqueValue,
  updateDescription,
  store,
  stateSlice,
  showToast = true,
  toastMessage = "",
}: HandleFieldChangeParams): Promise<void> => {
  const currentState = store.getState()[stateSlice];

  updateState((prevState) => ({ ...prevState, [fieldName]: value }));

  // Prepare data for saving
  const dataToUpdate = {
    [fieldName]: value,
  };

  // Save updated data to Supabase
  await saveDataToSupabase({
    supabase: useSupabase(),
    tableName,
    uniqueKey,
    uniqueValue,
    data: dataToUpdate,
    updateDescription,
    showToast,
    toastMessage,
  });
};
