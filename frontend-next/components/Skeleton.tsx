export default function Skeleton() {
  return (
    <div className="w-full max-w-150 md:rounded-xl bg-white mb-4 p-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-300 shrink-0"></div>
        <div className="flex flex-col gap-2 w-full">
          <div className="h-3 w-1/4 bg-gray-300 rounded"></div>
          <div className="h-2 w-1/5 bg-gray-300 rounded"></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 mt-4">
        <div className="h-3 w-full bg-gray-300 rounded"></div>
        <div className="h-3 w-5/6 bg-gray-300 rounded"></div>
      </div>

      {/* Media */}
      <div className="w-full h-96 bg-gray-300 mt-4 rounded-lg"></div>

      {/* Actions */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-4">
          <div className="w-16 h-6 bg-gray-300 rounded"></div>
          <div className="w-16 h-6 bg-gray-300 rounded"></div>
          <div className="w-16 h-6 bg-gray-300 rounded"></div>
        </div>
        <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  );
}
