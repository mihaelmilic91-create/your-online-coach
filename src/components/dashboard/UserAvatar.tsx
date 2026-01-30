import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-2xl",
};

const UserAvatar = ({ name, size = "md", className }: UserAvatarProps) => {
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center font-semibold text-white shadow-md",
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
};

export default UserAvatar;
