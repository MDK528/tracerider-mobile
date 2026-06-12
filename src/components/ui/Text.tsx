import { Text as RNText, type TextProps } from "react-native";
import { cn } from "@/lib/utils";

interface Props extends TextProps {
  variant?: "heading-lg" | "heading-md" | "heading-sm" | "body-lg" | "body-md" | "body-sm" | "caption";
  weight?: "thin" | "light" | "regular" | "medium" | "semibold" | "bold";
  color?: "primary" | "secondary" | "accent" | "danger" | "success" | "white";
  className?: string;
}

const variantClasses: Record<NonNullable<Props["variant"]>, string> = {
  "heading-lg": "text-[32px] leading-[40px]",
  "heading-md": "text-[24px] leading-[32px]",
  "heading-sm": "text-[20px] leading-[28px]",
  "body-lg":    "text-[18px] leading-[28px]",
  "body-md":    "text-[16px] leading-[24px]",
  "body-sm":    "text-[14px] leading-[20px]",
  "caption":    "text-[12px] leading-[16px]",
};

const weightClasses: Record<NonNullable<Props["weight"]>, string> = {
  thin:      "font-inter-thin",
  light:     "font-inter-light",
  regular:   "font-inter-regular",
  medium:    "font-inter-medium",
  semibold:  "font-inter-semibold",
  bold:      "font-inter-bold",
};

const colorClasses: Record<NonNullable<Props["color"]>, string> = {
  primary:   "text-text-primary",
  secondary: "text-text-secondary",
  accent:    "text-primary",
  danger:    "text-danger",
  success:   "text-success",
  white:     "text-white",
};

export function Text({
  variant = "body-md",
  weight = "regular",
  color = "primary",
  className,
  ...props
}: Props) {
  return (
    <RNText
      className={cn(
        variantClasses[variant],
        weightClasses[weight],
        colorClasses[color],
        className
      )}
      {...props}
    />
  );
}