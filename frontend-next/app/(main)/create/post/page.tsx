import { RiAddLargeLine } from "@remixicon/react";
export default function CreatePost() {
  return (
    <div className="bg-[#f2f3f8] px-10 py-20">
      <div className="bg-white">
        <div className="flex flex-col gap-10 p-5">
          <div className="w-full h-50">
            <textarea
              name=""
              id=""
              placeholder="Nhập cảm nghĩ của bạn"
              className="w-full outline-0"
            />
          </div>

          <div className="flex items-center justify-center px-3 py-2 border border-dashed border-gray-300 rounded-xl opacity-50 gap-2 cursor-pointer">
            <RiAddLargeLine size={22} />
            <span className="text-sm">Add more media</span>
          </div>
        </div>
        <hr className="h-1 w-full border-black/10" />
        <div className="w-fll flex items-center justify-between bg-[#fafafa] px-10 py-5">
          <div className="flex gap-2 items-center">
            <button className="border border-gray-200 px-3 py-1 rounded-2xl text-sm text-black/50">Save drauft</button>
            <button className="border border-gray-200 px-3 py-1 rounded-2xl text-sm text-black/50">Preview</button>
            <button className="border border-gray-200 px-3 py-1 rounded-2xl text-sm text-black/50">Schedule</button>
          </div>
          <button className="px-3 py-1 rounded-2xl bg-[#5c4cf8] text-sm text-white duration-150 hover:shadow-xl">Upload now</button>
        </div>
      </div>
    </div>
  );
}
