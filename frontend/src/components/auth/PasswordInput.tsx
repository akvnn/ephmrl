import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ControllerRenderProps } from "react-hook-form";

interface PasswordInputProps {
  field: ControllerRenderProps<any, any>;
  label: string;
  placeholder?: string;
}

export function PasswordInput({
  field,
  label,
  placeholder = "••••••••",
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder={placeholder}
            className="pr-10"
            {...field}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
