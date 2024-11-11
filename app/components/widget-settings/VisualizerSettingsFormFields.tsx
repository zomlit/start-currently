import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { VisualizerStyleOptions } from "./VisualizerStyleOptions";
import { VisualizerDisplayOptions } from "./VisualizerDisplayOptions";
import { UseFormReturn } from "react-hook-form";
import { VisualizerSettingsFormProps } from "@/types/visualizer";

// Add these type definitions
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

type VisualizerSettingsKey = NestedKeyOf<VisualizerSettingsFormProps>;

interface Props {
  form: UseFormReturn<VisualizerSettingsFormProps>;
  handleSettingChange: (field: VisualizerSettingsKey, value: any) => void;
  handleSettingCommit: (field: VisualizerSettingsKey, value: any) => void;
  setCanvasAvailable: (value: boolean) => void;
  currentProfile?: any;
}

const VisualizerSettingsFormFields: React.FC<Props> = ({
  form,
  handleSettingChange,
  handleSettingCommit,
  setCanvasAvailable,
  currentProfile,
}) => {
  const { watch } = form;
  const localColorSyncEnabled = watch("colorSync");

  return (
    <Tabs defaultValue="style" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="style">Style</TabsTrigger>
        <TabsTrigger value="display">Display</TabsTrigger>
      </TabsList>

      <TabsContent value="style">
        <Card className="border-none shadow-none">
          <VisualizerStyleOptions
            form={form}
            handleSettingChange={handleSettingChange}
            handleSettingCommit={handleSettingCommit}
            colorSyncEnabled={localColorSyncEnabled}
            currentProfile={currentProfile}
          />
        </Card>
      </TabsContent>

      <TabsContent value="display">
        <Card className="border-none shadow-none">
          <VisualizerDisplayOptions
            form={form}
            handleSettingChange={handleSettingChange}
            handleSettingCommit={handleSettingCommit}
            setCanvasAvailable={setCanvasAvailable}
          />
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default VisualizerSettingsFormFields;
