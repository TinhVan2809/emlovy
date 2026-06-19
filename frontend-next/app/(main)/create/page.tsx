"use client";
import Image from "next/image";
import { RiMultiImageLine, RiVideoOnLine } from "@remixicon/react";
import { useRouter } from "next/navigation";

function Create() {
  const router = useRouter();
  return (
    <div className="w-full h-full flex flex-col py-20">
      <div className="w-full h-full flex flex-col gap-4">
        <div className="px-10">
          <div className="relative flex justify-center w-full h-40 items-center border border-dashed rounded-2xl cursor-pointer" onClick={() => router.push("/create/post")}>
            <div className="w-30 h-full absolute left-0 top-0">
              <Image
                src="/1280w-Bz6D3DbmRuc.jpg"
                fill
                priority
                alt="post img"
                loading="eager"
                className="rounded-tl-2xl rounded-bl-2xl"
              />
            </div>
            <div className="flex items-center gap-3 opacity-50">
              <RiMultiImageLine />
              <span>Create post</span>
            </div>
          </div>
        </div>
        <div className="px-10">
          <div className="relative flex justify-center w-full h-40 items-center border border-dashed rounded-2xl cursor-pointer" onClick={() => router.push("/create/reel")}>
            <div className="w-30 h-full absolute left-0 top-0">
              <Image
                src="/jairo-gonzalez-yBk1U1G9cjI-unsplash.jpg"
                fill
                priority
                alt="post img"
                loading="eager"
                className="rounded-tl-2xl rounded-bl-2xl"
              />
            </div>
            <div className="flex items-center gap-3 opacity-50">
              <RiVideoOnLine />
              <span>Create Reel</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Create;
