import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MicrophoneSelectProps {
  value?: string;
  onChange: (deviceId: string) => void;
}

const MicrophoneSelect: React.FC<MicrophoneSelectProps> = ({
  value,
  onChange,
}) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    const getDevices = async () => {
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = allDevices.filter(
          (device) => device.kind === "audioinput"
        );
        setDevices(audioInputs);
      } catch (error) {
        console.error("Error getting audio devices:", error);
      }
    };

    getDevices();
    navigator.mediaDevices.addEventListener("devicechange", getDevices);

    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", getDevices);
    };
  }, []);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select microphone" />
      </SelectTrigger>
      <SelectContent>
        {devices.map((device) => (
          <SelectItem key={device.deviceId} value={device.deviceId}>
            {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default MicrophoneSelect;
