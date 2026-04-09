export default function CountryInfoSkeleton() {
  const shimmer = "bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_100%] animate-shimmer rounded";

  return (
    <div className="space-y-5 p-6">
      <div className={`h-32 w-full rounded-xl ${shimmer}`} />
      <div className={`h-7 w-3/4 ${shimmer}`} />
      <div className="space-y-3">
        <div className={`h-4 w-full ${shimmer}`} />
        <div className={`h-4 w-2/3 ${shimmer}`} />
        <div className={`h-4 w-1/2 ${shimmer}`} />
        <div className={`h-4 w-5/6 ${shimmer}`} />
      </div>
      <div className="flex gap-2 pt-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-8 w-24 rounded-full ${shimmer}`} />
        ))}
      </div>
    </div>
  );
}
