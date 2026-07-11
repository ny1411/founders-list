import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section Skeleton */}
      <section className="flex flex-col gap-6 max-w-3xl pt-10">
        <Skeleton className="h-16 w-3/4" />
        <Skeleton className="h-16 w-1/2" />
        <Skeleton className="h-8 w-full max-w-lg" />
        <div className="flex items-center gap-4 mt-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-10 w-32 ml-auto" />
        </div>
      </section>

      {/* Main Content & Sidebar Skeleton */}
      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar Filters Skeleton */}
        <aside className="w-full md:w-56 flex flex-col gap-10 shrink-0">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <Skeleton className="h-3 w-24" />
              <div className="flex flex-col gap-2.5">
                {[...Array(6)].map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* Content Area Skeleton */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
          {/* Search Bar & Controls Skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Skeleton className="h-12 w-full sm:max-w-md rounded-full" />
            <div className="flex items-center gap-3 shrink-0">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-[200px] bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-3 items-center">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="pt-2 mt-auto flex flex-wrap gap-2 items-center">
                  <Skeleton className="h-5 w-16 rounded-md" />
                  <Skeleton className="h-5 w-20 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
