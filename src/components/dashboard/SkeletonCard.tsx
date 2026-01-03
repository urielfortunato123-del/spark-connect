import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonCardProps {
  variant?: "stat" | "chart" | "map" | "chat";
}

const SkeletonCard = ({ variant = "stat" }: SkeletonCardProps) => {
  if (variant === "stat") {
    return (
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </div>
    );
  }

  if (variant === "chart") {
    return (
      <div className="glass-card p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="h-[180px] flex items-end justify-center gap-2 pt-4">
          {[60, 80, 45, 90, 70, 55].map((h, i) => (
            <Skeleton 
              key={i} 
              className="w-8 rounded-t animate-pulse" 
              style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }} 
            />
          ))}
        </div>
        <div className="flex justify-center gap-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    );
  }

  if (variant === "map") {
    return (
      <div className="glass-card h-full relative overflow-hidden">
        <Skeleton className="absolute inset-0" />
        <div className="absolute top-4 left-4 right-4">
          <Skeleton className="h-9 w-full max-w-xs rounded-lg" />
        </div>
        <div className="absolute bottom-4 right-4">
          <Skeleton className="h-32 w-40 rounded-lg" />
        </div>
        {/* Simulated markers */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-64 h-64">
            {[...Array(6)].map((_, i) => (
              <Skeleton 
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                  animationDelay: `${i * 150}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "chat") {
    return (
      <div className="glass-card h-full flex flex-col">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`flex gap-3 ${i === 1 ? "flex-row-reverse" : ""}`}>
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <Skeleton 
                className={`h-16 rounded-2xl ${i === 1 ? "w-32" : "w-48"}`}
                style={{ animationDelay: `${i * 200}ms` }}
              />
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-border/50">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return null;
};

export default SkeletonCard;
