interface BadgeProps {
  variant?: "blue" | "green" | "red" | "yellow" | "gray";
  children: React.ReactNode;
  dot?: boolean;
}

export default function Badge({
  variant = "gray",
  children,
  dot = false,
}: BadgeProps) {
  return (
    <span className={`badge badge-${variant}`}>
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === "green"
              ? "bg-emerald-500"
              : variant === "red"
              ? "bg-red-500"
              : variant === "yellow"
              ? "bg-amber-500"
              : variant === "blue"
              ? "bg-blue-500"
              : "bg-gray-400"
          }`}
        />
      )}
      {children}
    </span>
  );
}
