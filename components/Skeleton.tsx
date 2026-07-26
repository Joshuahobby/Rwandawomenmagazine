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

/** Mirrors the real article layout exactly so nothing jumps when data lands. */
export const ArticleSkeleton: React.FC = () => {
    return (
        <div className="animate-fade-in mx-auto w-full max-w-screen-xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] px-4 sm:px-6 lg:px-8 3xl:px-12 pb-24">
            <div className="grid gap-10 xl:gap-14 lg:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_352px]">
                <div className="min-w-0">
                    {/* Header: breadcrumb, category pill, title, deck, meta */}
                    <div className="pt-6 lg:pt-10 pb-8 space-y-4">
                        <Skeleton className="h-3 w-40" />
                        <Skeleton className="h-8 w-32 rounded-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-5 w-full max-w-[60ch]" />
                        <div className="flex items-center gap-4 pt-5">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>

                    {/* Featured image frame — same aspect ratios as the real hero */}
                    <Skeleton className="w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9] rounded-2xl lg:rounded-3xl" />

                    {/* Body */}
                    <div className="pt-10 mx-auto max-w-[68ch] 3xl:max-w-[72ch] space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </div>

                <div className="space-y-8 pt-6 lg:pt-10">
                    <Skeleton className="h-[250px] w-full max-w-[300px] mx-auto rounded-xl" />
                    <Skeleton className="h-40 w-full rounded-2xl" />
                    <Skeleton className="h-64 w-full rounded-2xl" />
                </div>
            </div>
        </div>
    );
};
