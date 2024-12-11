import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser, useSession } from "@clerk/tanstack-start";
import { supabase } from "@/utils/supabase/client";
import { GradientColorPicker } from "@/components/GradientColorPicker";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChatSettings } from "@/types/Widget";
import { Input } from "@/components/ui/input";
import { toast } from "@/utils/toast";

// Define the props interface
interface ChatSettingsFormProps {
  settings: ChatSettings;
  onSettingsChange: (settings: Partial<ChatSettings>) => void;
  onBroadcastChannelChange?: (channel: string) => void; // Make this optional
}

// Define the schema for chat settings
const chatSettingsSchema = z.object({
  broadcastChannel: z.string().min(1, "Broadcast channel is required"),
  selectedUsername: z.string().min(1, "Username is required"),
  selectedUsernameToken: z.string().optional(),
  showAvatars: z.boolean().default(true),
  showBadges: z.boolean().default(true),
  showPlatform: z.boolean().default(true),
  chatSkin: z.enum(["default", "compact", "bubble"]),
  chatBubbleColor: z.string(),
  maxHeight: z.number().min(100).max(2000), // Add this line
});

export default function ChatSettingsForm({
  settings,
  onSettingsChange,
  onBroadcastChannelChange,
}: ChatSettingsFormProps) {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof chatSettingsSchema>>({
    resolver: zodResolver(chatSettingsSchema),
    defaultValues: settings,
  });

  useEffect(() => {
    form.reset(settings);
  }, [settings, form]);

  const { session } = useSession();
  const { data: twitchAccounts } = useQuery({
    queryKey: ["twitchAccounts", user?.id],
    queryFn: async () => {
      if (!session?.user) return [];

      return (session.user.externalAccounts || [])
        .filter((account) => account.provider === "twitch")
        .map((account) => ({
          providerUserId: account.id,
          label: account.username,
          avatar: account.imageUrl,
        }));
    },
    enabled: !!session?.user,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60, // 1 hour (renamed from cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const { data: userProfile, isLoading: isUserProfileLoading } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from("UserProfile")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour (renamed from cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const handleFormChange = (
    field: keyof z.infer<typeof chatSettingsSchema>
  ) => {
    return (value: any) => {
      form.setValue(field, value);
      if (field === "broadcastChannel" && onBroadcastChannelChange) {
        onBroadcastChannelChange(value);
      }
      onSettingsChange({ [field]: value });
    };
  };

  return (
    <Form {...form}>
      <form className="my-8 space-y-4">
        <FormField
          control={form.control}
          name="broadcastChannel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Broadcast Channel</FormLabel>
              <Select
                onValueChange={handleFormChange("broadcastChannel")}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select broadcast channel" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {twitchAccounts && twitchAccounts.length > 0 ? (
                    twitchAccounts.map((account) => (
                      <SelectItem
                        key={account.providerUserId}
                        value={account.label || ""}
                      >
                        <div className="flex items-center">
                          <Avatar className="mr-2 h-6 w-6">
                            <AvatarImage
                              src={account.avatar}
                              alt={account.label}
                            />
                            <AvatarFallback>
                              {account.label?.[0]?.toUpperCase() || ""}
                            </AvatarFallback>
                          </Avatar>
                          {account.label}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-accounts">
                      No Twitch accounts found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="selectedUsername"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Broadcast Account (Custom Bot)</FormLabel>
              <Select
                onValueChange={handleFormChange("selectedUsername")}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select broadcast account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {twitchAccounts?.map((account) => (
                    <SelectItem
                      key={account.providerUserId}
                      value={account.label || ""}
                    >
                      <div className="flex items-center">
                        <Avatar className="mr-2 h-6 w-6">
                          <AvatarImage
                            src={account.avatar}
                            alt={account.label}
                          />
                          <AvatarFallback>
                            {account.label?.[0]?.toUpperCase() || ""}
                          </AvatarFallback>
                        </Avatar>
                        {account.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="showAvatars"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg bg-white/10 p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Show Avatars</FormLabel>
                <FormDescription>
                  Display user avatars next to chat messages.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={handleFormChange("showAvatars")}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="showBadges"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg bg-white/10 p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Show Badges</FormLabel>
                <FormDescription>
                  Display user badges next to usernames.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={handleFormChange("showBadges")}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="showPlatform"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Show Platform</FormLabel>
                <FormDescription>
                  Display the platform icon next to usernames.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={handleFormChange("showPlatform")}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="chatSkin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chat Skin</FormLabel>
              <Select
                onValueChange={handleFormChange("chatSkin")}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a chat skin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="bubble">Bubble</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="chatBubbleColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chat Bubble Color</FormLabel>
              <FormControl>
                <GradientColorPicker
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    onSettingsChange({ chatBubbleColor: value });
                  }}
                />
              </FormControl>
              <FormDescription>
                Choose the color or gradient for chat bubbles
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxHeight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Height (px)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    field.onChange(value);
                    onSettingsChange({ maxHeight: value });
                  }}
                  min={100}
                  max={2000}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </FormControl>
              <FormDescription>
                Set the maximum height for the chat widget (100-2000px)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
