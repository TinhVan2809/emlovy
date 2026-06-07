import Image from "next/image";
import Link from "next/link";
import {
  RiGoogleFill,
  RiFacebookCircleFill,
  RiAppleFill,
} from "@remixicon/react";
function Register() {
  return (
    <div className="relative w-full h-screen">
      <Image
        src="/registergb.jpg"
        alt="register background"
        fill
        className="object-cover"
      />
      <div className="absolute w-full h-full top-0 right-0 z-100 flex justify-center items-center">
        <div className="bg-white w-[70%] h-[80%] flex">
          <form className="flex flex-col p-10 flex-1">
            <div className="flex flex-col">
              <span className="text-3xl">Create An Account</span>
              <span>
                Have an account?{" "}
                <Link href={"/login"} className="text-[#092ea7] font-semibold">
                  Log in
                </Link>
              </span>
            </div>
            <div className="py-10 flex flex-col gap-5">
              <div className="flex w-full gap-10 items-center">
                <label
                  htmlFor=""
                  className="flex flex-col text-black/60 w-full"
                >
                  Your name
                  <input
                    type="text"
                    className="outline-0 border-b border-black/80 text-black"
                  />
                </label>
                <label
                  htmlFor=""
                  className="flex flex-col text-black/60 w-full"
                >
                  Username
                  <input
                    type="text"
                    className="outline-0 border-b border-black/80 text-black"
                  />
                </label>
              </div>
              <div className="flex w-full gap-10 items-center">
                <label
                  htmlFor=""
                  className="flex flex-col text-black/60 w-full"
                >
                  Email
                  <input
                    type="text"
                    className="outline-0 border-b border-black/80 text-black"
                  />
                </label>
                <label
                  htmlFor=""
                  className="flex flex-col text-black/60 w-full"
                >
                  Phone (option)
                  <input
                    type="text"
                    className="outline-0 border-b border-black/80 text-black"
                  />
                </label>
              </div>
              <div className="flex w-full gap-10 items-center">
                <label
                  htmlFor=""
                  className="flex flex-col text-black/60 w-full"
                >
                  Passowrd
                  <input
                    type="password"
                    className="outline-0 border-b border-black/80 text-black"
                  />
                </label>
                <label
                  htmlFor=""
                  className="flex flex-col text-black/60 w-full"
                >
                  Confirm Password
                  <input
                    type="password"
                    className="outline-0 border-b border-black/80 text-black"
                  />
                </label>
              </div>
            </div>
            <div className="w-full">
              <button className="bg-blue-700 w-full text-white py-2 rounded-[20px] duration-200 hover:opacity-80">
                Sign in
              </button>
            </div>
            <div className="flex flex-col gap-5 mt-5">
              <div className="flex gap-1 justify-center items-center">
                <hr className="w-50 h-0.5 border-black/50" />
                <span className="text-sm text-black/50">Or sign in with</span>
                <hr className="w-50 h-0.5 border-black/50" />
              </div>
              <div className="flex justify-center items-center gap-2">
                <div className="flex gap-2 items-center cursor-pointer duration-200 hover:bg-blue-500/10 px-3 py-1 rounded-2xl">
                  <RiGoogleFill /> <span>Google</span>
                </div>
                <div className="flex gap-2 items-center cursor-pointer duration-200 hover:bg-blue-500/10 px-3 py-1 rounded-2xl">
                  <RiFacebookCircleFill /> <span>Facebook</span>
                </div>
                <div className="flex gap-2 items-center cursor-pointer duration-200 hover:bg-blue-500/10 px-3 py-1 rounded-2xl">
                  <RiAppleFill /> <span>Apple</span>
                </div>
              </div>
            </div>
          </form>
          <div className="relative w-100 h-full right-0 z-100 top-0">
            <Image
              src="/registerimg.jpg"
              alt="register img"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
