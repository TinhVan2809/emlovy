import Image from "next/image";
import {
  RiArrowRightUpLine,
  RiArrowRightLine,
  RiGlobalLine,
  RiBehanceLine,
  RiTwitterLine,
} from "@remixicon/react";
function Footer() {
  return (
    <footer className="bg-[#f4f6f8]  flex flex-col gap-20 w-full p-10">
      <div className="bg-[#ffffff] shadow-xl flex p-5 rounded-4xl flex-col md:flex-row gap-10 md:gap-0 items-center md:items-start">
        <div className="flex flex-col gap-2 ">
          <span className="text-sm opacity-50">Welcome to Emlovy</span>
          <div className="flex flex-col gap-1">
            <h4 className="text-xl font-bold">Join our Social Application.</h4>
            <span className="opacity-75">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima ut
              a repellat.
            </span>
          </div>
          <button className="w-fit flex bg-black text-white py-2 px-4 rounded-[20px] mt-3">Become an Emlovy User <RiArrowRightUpLine /></button>
        </div>
        <div className="">
          <div className="relative w-50 h-50">
            <Image src={"/footer-img.png"} alt="footer img" fill className="rounded-3xl"/>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-12">
        <div className="flex flex-col">
          <div className="flex flex-col gap-1">
            <span className="text-xl font-semibold">EmlovyUi</span>
            <span className="opacity-65">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. At vero quis expedita blanditiis necessitatibus iure?
            </span>
          </div>
          <div className="flex w-full justify-around mt-10">
            <ul className="flex flex-col gap-3">
              <li className="font-bold mb-1">Company</li>
              <li className="opacity-70 cursor-pointer">Pricing</li>
              <li className="opacity-70 cursor-pointer">Contact us</li>
              <li className="opacity-70 cursor-pointer">Projects</li>
            </ul>
            <ul className="flex flex-col gap-3">
              <li className="font-bold mb-1">Socials</li>
              <li className="flex gap-1 opacity-70 cursor-pointer">
                Behandce <RiArrowRightUpLine size={20} />
              </li>
              <li className="flex gap-1 opacity-70 cursor-pointer">
                Dribble <RiArrowRightUpLine  size={20}/>
              </li>
              <li className="flex gap-1 opacity-70 cursor-pointer">
                Twitter/X <RiArrowRightUpLine  size={20}/>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-3 mt-12">
            <span className="text-xl font-semibold">Newsleter</span>
            <span className="opacity-65">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Iste beatae voluptatum hic rerum perferendis.
            </span>
            <div className="flex bg-white w-fit rounded-3xl">
              <input type="text" className="py-2 outline-0 px-3" placeholder="@ Enter your email..."/>
              <div className="">
                <RiArrowRightLine size={60} className="bg-black text-white h-full px-4 text-5xl rounded-2xl"/>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="">
            <span className="text-sm opacity-65">&copy; 2026 AmlovyUi . All rights reserved</span>
          </div>
          <div className="flex gap-3 items-center">
            <span className="text-sm opacity-65">Built in Framer</span>
            <RiGlobalLine size={22} className="opacity-65"/>
            <RiBehanceLine size={22} className="opacity-65"/>
            <RiTwitterLine size={22} className="opacity-65"/>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
