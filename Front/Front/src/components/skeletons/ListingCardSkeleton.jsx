export function ListingCardSkeleton({ featured = false }) {
  return (
    <div className={featured ? 'md:col-span-2 md:row-span-2' : ''}>
      <div
        className={`rounded-xl bg-slate-200 animate-pulse mb-3 ${
          featured ? 'aspect-[16/10]' : 'aspect-[4/3]'
        }`}
      />
      <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4 mb-2" />
      <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2 mb-3" />
      <div className="h-5 bg-slate-200 rounded animate-pulse w-1/3" />
    </div>
  )
}

export function ListingGridSkeleton({ count = 6, featured = false }) {
  return (
    <div
      className={
        featured
          ? 'grid md:grid-cols-2 lg:grid-cols-4 gap-6'
          : 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
      }
    >
      {featured && <ListingCardSkeleton featured />}
      {Array.from({ length: count - (featured ? 1 : 0) }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  )
}
