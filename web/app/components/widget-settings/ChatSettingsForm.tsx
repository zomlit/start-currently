import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { SliderWithInput } from "@/components/ui/slider-with-input";
import { GradientColorPicker } from "@/components/GradientColorPicker";
import { useSettingsForm } from "@/hooks/useSettingsForm";
import { cn } from "@/lib/utils";
import { SettingsFormFooter } from "@/components/ui/settings-form-footer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ChatSettings } from "@/types/chat";

const chatSchema = z.object({
  backgroundColor: z.string(),
  textColor: z.string(),
  fontSize: z.number(),
  fontFamily: z.string(),
  padding: z.number(),
  showBorders: z.boolean(),
  borderColor: z.string(),
  borderWidth: z.number(),
  borderRadius: z.number(),
  opacity: z.number(),
  showUsernames: z.boolean(),
  showTimestamps: z.boolean(),
  showBadges: z.boolean(),
  chatLayout: z.enum(["default", "compact", "bubble"]),
});

interface ChatSettingsFormProps {
  settings: ChatSettings;
  onSettingsChange: (settings: Partial<ChatSettings>) => Promise<void>;
  onPreviewUpdate?: (settings: Partial<ChatSettings>) => void;
  isLoading?: boolean;
}

export function ChatSettingsForm({
  settings,
  onSettingsChange,
  onPreviewUpdate,
  isLoading = false,
}: ChatSettingsFormProps) {
  const form = useForm({
    resolver: zodResolver(chatSchema),
    defaultValues: settings,
  });

  const {
    handleSettingChange,
    handleResetToDefaults,
    handleSubmit,
    dialogRef,
    isSaving,
    lastSaved,
    changingField,
    hasPendingChanges,
  } = useSettingsForm<ChatSettings>({
    form,
    settings,
    onSettingsChange,
    onPreviewUpdate: onPreviewUpdate || (() => {}),
    schema: chatSchema,
    defaultSettings: settings,
  });

  return (
    <FormProvider {...form}>
      <Form {...form} onSubmit={handleSubmit}>
        <div className="relative">
          <div
            className={cn(
              "flex flex-col",
              isLoading && "opacity-50 pointer-events-none"
            )}
          >
            <div className="space-y-6">
              <Card className="border-border/0 bg-transparent rounded-none p-0">
                <CardContent className="p-0 space-y-4">
                  {/* Chat Layout */}
                  <FormField
                    control={form.control}
                    name="chatLayout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chat Layout</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) =>
                            handleSettingChange("chatLayout", value)
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select layout" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="compact">Compact</SelectItem>
                            <SelectItem value="bubble">Bubble</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  {/* Show Usernames */}
                  <FormField
                    control={form.control}
                    name="showUsernames"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Show Usernames</FormLabel>
                          <FormDescription>
                            Display usernames in chat
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(value) =>
                              handleSettingChange("showUsernames", value)
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Show Timestamps */}
                  <FormField
                    control={form.control}
                    name="showTimestamps"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Show Timestamps</FormLabel>
                          <FormDescription>
                            Display message timestamps
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(value) =>
                              handleSettingChange("showTimestamps", value)
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Show Badges */}
                  <FormField
                    control={form.control}
                    name="showBadges"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Show Badges</FormLabel>
                          <FormDescription>
                            Display user badges and emotes
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(value) =>
                              handleSettingChange("showBadges", value)
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Include all the common styling fields (background, text, borders, etc.) */}
                  {/* ... (similar to StatsSettingsForm) ... */}
                </CardContent>
              </Card>

              <SettingsFormFooter
                onReset={handleResetToDefaults}
                hasPendingChanges={hasPendingChanges}
                dialogRef={dialogRef}
                resetDialogTitle="Reset Chat Settings?"
                resetDialogDescription="This will reset all chat settings to their default values. This action cannot be undone."
                isSaving={isSaving}
                saveError={null}
                lastSaved={lastSaved}
              />
            </div>
          </div>
        </div>
      </Form>
    </FormProvider>
  );
}
