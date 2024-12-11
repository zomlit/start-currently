import React from "react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import IconMicrophone from "@icons/outline/microphone-2.svg?react";
import MicrophoneSelect from "@/components/MicrophoneSelect";
import type { Control, UseFormWatch } from "@tanstack/react-form";

interface AudioSectionProps {
  control: Control<VisualizerSettings>;
  watch: UseFormWatch<VisualizerSettings>;
  onSettingChange: (key: keyof VisualizerSettings, value: any) => void;
  onSettingCommit: (key: keyof VisualizerSettings, value: any) => void;
}

export function AudioSection({
  control,
  watch,
  onSettingChange,
  onSettingCommit,
}: AudioSectionProps) {
  return (
    <AccordionItem value="audio">
      <AccordionTrigger>
        <div className="flex items-center space-x-2">
          <IconMicrophone className="h-6 w-6" />
          <span>Audio Settings</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 p-2">
        <FormField
          control={control}
          name="specificSettings.micEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Microphone Input</FormLabel>
                <FormDescription>
                  Use microphone input instead of audio playback
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {watch("specificSettings.micEnabled") && (
          <FormField
            control={control}
            name="specificSettings.selectedMicId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Microphone</FormLabel>
                <MicrophoneSelect
                  value={field.value}
                  onValueChange={field.onChange}
                />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={control}
          name="specificSettings.channelLayout"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Channel Layout</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel layout" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="dual-combined">Dual Combined</SelectItem>
                  <SelectItem value="dual-horizontal">
                    Dual Horizontal
                  </SelectItem>
                  <SelectItem value="dual-vertical">Dual Vertical</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="specificSettings.frequencyScale"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequency Scale</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency scale" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="bark">Bark</SelectItem>
                  <SelectItem value="linear">Linear</SelectItem>
                  <SelectItem value="log">Logarithmic</SelectItem>
                  <SelectItem value="mel">Mel</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="specificSettings.weightingFilter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weighting Filter</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select weighting filter" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="A">A-weighting</SelectItem>
                  <SelectItem value="B">B-weighting</SelectItem>
                  <SelectItem value="C">C-weighting</SelectItem>
                  <SelectItem value="D">D-weighting</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="specificSettings.linearAmplitude"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Linear Amplitude</FormLabel>
                <FormDescription>
                  Use linear amplitude scaling instead of logarithmic
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {watch("specificSettings.linearAmplitude") && (
          <FormField
            control={control}
            name="specificSettings.linearBoost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Linear Boost: {field.value.toFixed(1)}x</FormLabel>
                <FormControl>
                  <Slider
                    value={[field.value]}
                    onValueChange={([value]) => field.onChange(value)}
                    min={1}
                    max={5}
                    step={0.1}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
