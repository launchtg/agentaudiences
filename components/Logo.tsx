import Image from "next/image";

const VARIANT_MAP: Record<string, Record<string, string>> = {
  primary: {
    dark: "/brand/logo-primary-dark.png",
    light: "/brand/logo-primary-light.png",
  },
  horizontal: {
    dark: "/brand/logo-horz-dark.png",
    light: "/brand/logo-horz-light.png",
  },
  icon: {
    dark: "/brand/logo-icon.png",
    light: "/brand/logo-icon.png",
  },
  mark: {
    dark: "/brand/logo-mark.png",
    light: "/brand/logo-mark.png",
  },
};

const SIZE_MAP: Record<string, { width: number; height: number }> = {
  sm: { width: 80, height: 24 },
  md: { width: 140, height: 40 },
  lg: { width: 200, height: 56 },
};

const ICON_SIZE_MAP: Record<string, { width: number; height: number }> = {
  sm: { width: 24, height: 24 },
  md: { width: 36, height: 36 },
  lg: { width: 64, height: 64 },
};

export default function Logo({
  variant = "horizontal",
  theme = "dark",
  size = "md",
  className,
}: {
  variant?: "primary" | "horizontal" | "icon" | "mark";
  theme?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const src = VARIANT_MAP[variant]?.[theme] || VARIANT_MAP.horizontal.dark;
  const isSquare = variant === "icon" || variant === "mark";
  const dimensions = isSquare ? ICON_SIZE_MAP[size] : SIZE_MAP[size];

  return (
    <Image
      src={src}
      alt="AgentAudiences"
      width={dimensions.width}
      height={dimensions.height}
      className={className}
      priority
    />
  );
}
