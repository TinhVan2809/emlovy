"use client";
import { IUserProfileApiResponse } from "../[user_id]/user";
import { useState } from "react";
import {
  RiCheckboxCircleLine,
  RiProhibited2Line,
  RiVerifiedBadgeLine,
  RiVipDiamondLine,
} from "@remixicon/react";

function AccountStatus({ user }: { user: IUserProfileApiResponse | null }) {
  const [status, setStatus] = useState(user?.data?.profile?.status);
  const [isStatus, setIsStatus] = useState(false);
  return (
    <div className="flex flex-col p-5 gap-10 shadow-md rounded-2xl my-5">
      <div className="">
        <p className="flex flex-col">
          <span className="text-[18px] font-bold opacity-55">
            Account Status
          </span>
          <span className="text-sm opacity-60">
            Manage account standing and privileges
          </span>
        </p>
      </div>
      <div className="flex flex-col">
        <span className="text-[12px] font-semibold opacity-55">
          ACCOUNT STATUS
        </span>
        <div
          className="relative flex flex-col mt-2 cursor-pointer"
          onClick={() => setIsStatus((v) => !v)}
        >
          <div className="">
            {status === 1 ? (
              <div className="flex items-center gap-3">
                <RiCheckboxCircleLine size={19} className="text-green-700" />
                <p className="flex flex-col">
                  <span className="text-green-700 font-bold">Active</span>
                  <span className="text-sm opacity-65">
                    Account is good standing and fully accessible
                  </span>
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <RiProhibited2Line size={19} className="text-red-700" />
                <p className="flex flex-col">
                  <span className="text-red-700 font-bold">Block</span>
                  <span className="text-sm opacity-65">
                    Account temporarirt disble due to policy violations
                  </span>
                </p>
              </div>
            )}
          </div>
          {isStatus && (
            <div
              className="absolute top-12 p-5 left-0 z-100 shadow-2xl bg-white w-full rounded-2xl"
              onClick={() => setIsStatus((v) => !v)}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 cursor-pointer justify-between">
                  <div className="flex items-center gap-3">
                    <RiCheckboxCircleLine
                      size={19}
                      className="text-green-700"
                    />
                    <p className="flex flex-col">
                      <span className="text-green-700 font-bold">Active</span>
                      <span className="text-sm opacity-65">
                        Account is good standing and fully accessible
                      </span>
                    </p>
                  </div>
                  <p className={status == 1 ? "block" : "hidden"}>
                    <RiCheckboxCircleLine size={17} />
                  </p>
                </div>

                <div className="flex items-center gap-3 cursor-pointer justify-between">
                  <div className="flex items-center gap-3">
                    <RiProhibited2Line size={19} className="text-red-700" />
                    <p className="flex flex-col">
                      <span className="text-red-700 font-bold">Block</span>
                      <span className="text-sm opacity-65">
                        Account temporarirt disble due to policy violations
                      </span>
                    </p>
                  </div>
                  <p className={status == 0 ? "block" : "hidden"}>
                    <RiCheckboxCircleLine size={17} />
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <span className="text-[12px] font-semibold opacity-55">PRIVILEGES</span>
        <div className="flex flex-col gap-2">
          <div className="flex gap-5 w-full justify-between items-center shadow-sm p-3 rounded-[20px]">
            <div className="flex gap-3 items-center">
              <RiVerifiedBadgeLine size={18} className="text-blue-600" />
              <p className="flex flex-col">
                <span className="font-semibold">Verified Account</span>
                <span className="text-sm opacity-50">
                  Blue checkmark visible on profile
                </span>
              </p>
            </div>
            <input type="checkbox" />
          </div>

          <div className="flex gap-5 w-full justify-between items-center shadow-sm p-3 rounded-[20px]">
            <div className="flex gap-3 items-center">
              <RiVipDiamondLine size={18} className="text-yellow-600" />
              <p className="flex flex-col">
                <span className="font-semibold">Verified Account</span>
                <span className="text-sm opacity-50">
                  Access to premium features and content
                </span>
              </p>
            </div>
            <input type="checkbox" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountStatus;
