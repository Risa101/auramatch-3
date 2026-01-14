export default function ShortsSkeleton() {
  return (
    <div className="flex gap-4 px-10 py-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="min-w-[240px] max-w-[240px] aspect-[9/16] rounded-2xl border bg-white overflow-hidden"
        >
          <div className="w-full h-full animate-pulse bg-gradient-to-b from-[#FADCDC] to-[#E6DCEB]" />
        </div>
      ))}
    </div>
  );
}
