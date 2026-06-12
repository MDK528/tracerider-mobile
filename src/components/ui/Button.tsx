import { TouchableOpacity, ActivityIndicator, View, type TouchableOpacityProps } from "react-native";
import { Text } from "./Text";
import { cn } from "@/lib/utils";

interface Props extends TouchableOpacityProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  label: string;
}

const variantClasses = {
  primary:   "bg-dark active:opacity-80",
  secondary: "bg-surface border border-border active:opacity-70",
  outline:   "border border-border bg-transparent active:opacity-70",
  ghost:     "bg-transparent active:opacity-70",
  danger:    "bg-red-500 active:opacity-80",
};

const labelColorMap: Record<NonNullable<Props["variant"]>, "white" | "primary" | "secondary" | "danger"> = {
  primary:   "white",
  secondary: "primary",
  outline:   "primary",
  ghost:     "secondary",
  danger:    "white",
};

const sizeClasses = {
  sm: "h-10 px-4 rounded-card",
  md: "h-12 px-5 rounded-card",
  lg: "h-14 px-6 rounded-card",
};

const labelSizeMap: Record<NonNullable<Props["size"]>, "body-sm" | "body-md" | "body-lg"> = {
  sm: "body-sm",
  md: "body-md",
  lg: "body-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = true,
  leftIcon,
  rightIcon,
  label,
  disabled,
  className,
  ...props
}: Props) {
  return (
    <TouchableOpacity
      disabled={disabled || loading}
      className={cn(
        "flex-row items-center justify-center",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        (disabled || loading) && "opacity-50",
        className
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" || variant === "danger" ? "#FFFFFF" : "#16191A"}
        />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <Text
            variant={labelSizeMap[size]}
            weight="semibold"
            color={labelColorMap[variant]}
          >
            {label}
          </Text>
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
}