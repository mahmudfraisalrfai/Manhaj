// app/components/ui/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export default function LoadingSpinner({
  size = "md",
  text = "جاري التحميل...",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div
        className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]} mb-4`}
      ></div>
      {text && <p className="text-gray-600 text-sm">{text}</p>}
    </div>
  );
}
