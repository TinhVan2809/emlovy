"use client";
import { useRouter } from "next/navigation";
export default function NotFound() {
  const router = useRouter();
  return (
    <div className="bg-[#0d0d0d] w-full h-screen">
      <div className="w-full flex justify-between p-3">
        <span className="text-white/50 text-sm">ERROR</span>
        <span className="text-white/50 text-sm">HTTP 404</span>
      </div>
      <div className="w-full md:w-300 flex justify-center items-center flex-co px-10 md:p-0">
        <div className="flex flex-col">
          <span className="text-[#272727] text-[200px] md:text-[240px] lg:text-[290px]">
            404
          </span>
          <div className="flex flex-col gap-4">
            <span className="text-white text-4xl">Route not found.</span>
            <span className="text-white/50 text-sm">
              The path you requested does not exist or has been moved
            </span>
          </div>
          <div className="mt-10 flex gap-5">
            <button
              className="text-white py-2 px-4 rounded-md hover:bg-gray-100/10"
              onClick={() => router.push("/")}
            >
              Go home
            </button>
            <button
              className="text-white/50 hover:text-white"
              onClick={() => router.back()}
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
