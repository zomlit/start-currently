import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface PublicUrlHeaderProps {
  publicUrl: string;
}

export function PublicUrlHeader({ publicUrl }: PublicUrlHeaderProps) {
  return (
    <div className="flex-none p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center space-x-2">
        <Input
          key={publicUrl}
          value={publicUrl}
          readOnly
          className="flex-grow ring-offset-0 focus:ring-offset-0 focus-visible:ring-offset-0"
        />
        <Button
          onClick={(e) => {
            e.preventDefault();
            navigator.clipboard.writeText(publicUrl);
            toast.success("The public URL has been copied to your clipboard.");
          }}
          size="icon"
          variant="outline"
          className="ring-offset-0 focus:ring-offset-0 focus-visible:ring-offset-0"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
