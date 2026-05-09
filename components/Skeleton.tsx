import React from 'react';

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
    return (
        <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-md ${className}`} />
    );
};

export const ArticleCardSkeleton: React.FC = () => {
    return (
        <div className="flex flex-col gap-4">
            <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
            <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-2/3" />
            </div>
        </div>
    );
};

export const FeaturedSkeleton: React.FC = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
                <Skeleton className="aspect-[16/10] w-full rounded-3xl" />
            </div>
            <div className="lg:col-span-5 space-y-6">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-20 w-full" />
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>
        </div>
    );
};

export const ArticleSkeleton: React.FC = () => {
    return (
        <div className="animate-fade-in pb-20">
            <Skeleton className="h-[70vh] w-full" />
            <div className="max-w-4xl mx-auto px-4 -mt-32 relative z-10">
                <div className="bg-white dark:bg-slate-900 p-8 md:p-12 shadow-2xl rounded-3xl space-y-6">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-3/4" />
                    <div className="flex items-center gap-4 pt-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="space-y-4 pt-8">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                    </div>
                </div>
            </div>
        </div>
    );
};
