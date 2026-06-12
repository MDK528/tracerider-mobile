import { useState } from "react";
import { View, TextInput, TouchableOpacity, type TextInputProps } from "react-native";
import { Text } from "./Text";
import { cn } from "@/lib/utils";
import { Colors } from "@/constants/colors";
import { Eye, EyeOff } from "lucide-react-native";

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerClassName,
  secureTextEntry,
  className,
  ...props
}: Props) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = secureTextEntry;

  return (
    <View className={cn("gap-1.5", containerClassName)}>
      {label && (
        <Text variant="body-sm" weight="medium" color="primary">
          {label}
        </Text>
      )}

      <View
        className={cn(
          "flex-row items-center bg-surface border rounded-lg px-4 h-12",
          error ? "border-danger" : "border-border",
        )}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}

        <TextInput
          className={cn("flex-1 text-[16px] text-text-primary font-inter-regular", className)}
          placeholderTextColor={Colors.textSecondary}
          secureTextEntry={isPassword && !passwordVisible}
          autoCapitalize="none"
          autoCorrect={false}
          {...props}
        />

        {isPassword ? (
          <TouchableOpacity
            onPress={() => setPasswordVisible((v) => !v)}
            className="ml-3"
          >
            {passwordVisible
              ? <EyeOff size={18} color={Colors.textSecondary} />
              : <Eye size={18} color={Colors.textSecondary} />
            }
          </TouchableOpacity>
        ) : (
          rightIcon && <View className="ml-3">{rightIcon}</View>
        )}
      </View>

      {error && (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      )}

      {hint && !error && (
        <Text variant="caption" color="secondary">
          {hint}
        </Text>
      )}
    </View>
  );
}