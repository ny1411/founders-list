import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Back Button Skeleton */}
      <div>
        <Skeleton className="h-5 w-32" />
      </div>

      {/* Hero Section Skeleton */}
      <section className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-6 max-w-3xl w-full">
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-2xl" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>
          </div>
          
          <Skeleton className="h-8 w-full max-w-2xl" />
          <Skeleton className="h-8 w-3/4 max-w-2xl" />
          
          <div className="flex flex-col gap-2 mt-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="h-5 w-4/6" />
          </div>

          <div className="flex flex-wrap gap-4 mt-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-48" />
          </div>
        </div>

        {/* Key Details Card Skeleton */}
        <div className="w-full md:w-80 shrink-0 bg-card border border-border rounded-2xl p-6 flex flex-col gap-6">
          <Skeleton className="h-4 w-32" />
          
          <div className="flex flex-col gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="flex flex-col gap-2 w-full">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-4 border-t border-border flex flex-wrap gap-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-16 rounded-md" />
            ))}
          </div>
        </div>
      </section>

      {/* Founders Section Skeleton */}
      <section className="pt-10 border-t border-border">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-full shrink-0" />
                <div className="flex flex-col gap-2 w-full">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
              
              <div className="pt-4 mt-auto flex items-center gap-2 border-t border-border/50">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
