import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ColorPicker } from '@/components/ColorPicker'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export const gamepadSchema = z.object({
  selectedSkin: z.enum(["ds4", "xbox", "switch"]),
  showButtonPresses: z.boolean(),
  showAnalogSticks: z.boolean(),
  showTriggers: z.boolean(),
  buttonHighlightColor: z.string(),
  buttonPressColor: z.string(),
  analogStickColor: z.string(),
  triggerColor: z.string(),
  backgroundColor: z.string(),
  opacity: z.number(),
  scale: z.number(),
  deadzone: z.number(),
  touchpadEnabled: z.boolean(),
  rumbleEnabled: z.boolean(),
  debugMode: z.boolean(),
})

export type GamepadSettings = z.infer<typeof gamepadSchema>

interface GamepadSettingsFormProps {
  settings: GamepadSettings
  onUpdate: (settings: Partial<GamepadSettings>) => void
}

export const GamepadSettingsForm: React.FC<GamepadSettingsFormProps> = ({
  settings,
  onUpdate,
}) => {
  const form = useForm<GamepadSettings>({
    resolver: zodResolver(gamepadSchema),
    defaultValues: settings,
  })

  const handleSettingChange = (key: keyof GamepadSettings, value: any) => {
    onUpdate({ [key]: value })
  }

  return (
    <Form {...form}>
      <form className="space-y-4 p-4">
        <Accordion type="single" collapsible defaultValue="appearance">
          <AccordionItem value="general">
            <AccordionTrigger>General Settings</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <FormField
                control={form.control}
                name="selectedSkin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Controller Skin</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => handleSettingChange("selectedSkin", value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select skin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ds4">PlayStation (DS4)</SelectItem>
                        <SelectItem value="xbox">Xbox</SelectItem>
                        <SelectItem value="switch">Nintendo Switch</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Add more form fields following the pattern */}
            </AccordionContent>
          </AccordionItem>

          {/* Add more accordion items for different setting categories */}
        </Accordion>
      </form>
    </Form>
  )
} 