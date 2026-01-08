import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TourCardSkeletonProps {
    variant?: "default" | "featured" | "recommended";
    className?: string;
}

/**
 * Skeleton loader for TourCard component.
 * Matches the dimensions of corresponding TourCard variants.
 */
export function TourCardSkeleton({
    variant = "default",
    className,
}: TourCardSkeletonProps) {
    // Featured/Recommended variant skeleton
    if (variant === "featured" || variant === "recommended") {
        return (
            <Card
                className={cn(
                    "border-0 shadow-lg overflow-hidden rounded-2xl",
                    className
                )}
            >
                <Skeleton className="h-[240px] w-full rounded-none" />
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <Skeleton className="h-7 w-3/4" />
                    </div>
                    <div className="flex items-center gap-4 mb-6">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                    <div className="flex items-end justify-between pt-4 border-t border-slate-100">
                        <div>
                            <Skeleton className="h-3 w-8 mb-2" />
                            <Skeleton className="h-8 w-28" />
                        </div>
                        <Skeleton className="h-9 w-24 rounded-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Default variant skeleton (grid layout)
    return (
        <Card
            className={cn(
                "overflow-hidden border-0 shadow-sm bg-white rounded-2xl",
                className
            )}
        >
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-6 w-full mb-3" />
                <div className="flex gap-3 mb-4">
                    <Skeleton className="h-6 w-16 rounded-md" />
                    <Skeleton className="h-6 w-20 rounded-md" />
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                    <div>
                        <Skeleton className="h-3 w-8 mb-1" />
                        <Skeleton className="h-7 w-28" />
                    </div>
                    <Skeleton className="h-10 w-24 rounded-xl" />
                </div>
            </div>
        </Card>
    );
}
