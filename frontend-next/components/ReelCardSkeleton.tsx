export default function ReelCardSkeleton() {
  return (
    <div className="max-w-95 w w-full border-zinc-700 border rounded-lg overflow-hidden bg-black shadow-lg animate-pulse">
      <div className="relative aspect-9/16 bg-zinc-800 flex items-end justify-between p-5">
        {/* Left side: Author info */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-1.5 items-center">
            <div className="h-9 w-9 rounded-full bg-zinc-700"></div>
            <div className="h-3 w-24 rounded bg-zinc-700"></div>
          </div>
          <div className="h-2 w-40 rounded bg-zinc-700"></div>
        </div>
        {/* Right side: Actions */}
        <div className="flex flex-col gap-5 items-center">
          <div className="flex flex-col items-center gap-1">
            <div className="h-7 w-7 rounded-full bg-zinc-700"></div>
            <div className="h-2 w-4 rounded bg-zinc-700"></div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="h-7 w-7 rounded-full bg-zinc-700"></div>
            <div className="h-2 w-4 rounded bg-zinc-700"></div>
          </div>
          <div className="h-7 w-7 rounded-full bg-zinc-700"></div>
          <div className="h-7 w-7 rounded-full bg-zinc-700"></div>
          <div className="h-7 w-7 rounded-full bg-zinc-700"></div>
        </div>
      </div>
    </div>
  );
}