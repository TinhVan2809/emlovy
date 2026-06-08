import port from "@/api/api";
import { useUser } from "@/context/useUserContext";
import Image from "next/image";
import { RiSettingsLine } from "@remixicon/react";
interface Props {
  params: Promise<{ user_id: string }>;
}
interface Posts {
  post_id: number;
  avatar_url?: string;
}

interface Profile {
  stats: {
    posts: number;
    followers: number;
    following: number;
  };
  posts: number;
}

async function Profile({params}: Props) {

  const user_id = await params;
 

    try {
      const responseMe = await fetch(
        `${port}/api/profile/me?user_id=${user_id}`,
        {
          credentials: 'include',
        }
      );
      const responseMyPosts = await fetch(`${port}/api/posts/me?page=1&limit=10`, {
        credentials: 'include',
      });

      const dataMe = await responseMe.json();
      const postsData = await responseMyPosts.json();


      console.log('my profile:', dataMe);
      console.log('my posts:', postsData);
    } catch (_err) {
      console.error("Error fething my data", _err);
    }

    console.log(user_id);
 



  // Avatar handler
  // const avatarSrc = user?.avatar_url
  //   ? `${port}${user.avatar_url}`
  //   : "/Profile-Default.webp";

  return (
    <>
      {/* <div className=" flex flex-col md:grid md:grid-cols-3 items-center gap-10">
        <div className="flex flex-col justify-center items-center md:col-span-1">
          <div className="">
            <div className="relative w-20 h-20 md:w-30 md:h-30">
              <Image
                src={avatarSrc}
                alt="avatar"
                fill
                className="object-cover rounded-full"
                priority
              />
            </div>
          </div>
          <div className="flex flex-col">
            <span>{user?.name}</span>
            <span className="text-sm opacity-50">@{user?.username}</span>
          </div>
        </div>

        <div className="flex flex-col gap-5 col-span-2">
          <div className="flex items-center gap-5">
            <span className="text-black cursor-pointer text-sm md:text-[14px]">
              <span className="font-semibold">{myProfile?.stats?.posts}</span>{" "}
              Bài viết
            </span>
            <span className="text-black cursor-pointer text-sm md:text-[14px]">
              <span className="font-semibold">
                {myProfile?.stats?.followers}
              </span>{" "}
              Người theo dõi
            </span>
            <span className="text-black cursor-pointer text-sm md:text-[14px]">
              <span className="font-semibold">
                {myProfile?.stats?.following}
              </span>{" "}
              Đang theo dõi
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onSetting}>
              <RiSettingsLine />
            </button>
            <button className="bg-gray-100 min-w-30 md:min-w-45 py-1.5 rounded-md text-sm md:text-16px">
              Xem kho lưu trữ
            </button>
            <button className="bg-gray-100 min-w-30 md:min-w-45 py-1.5 rounded-md text-sm md:text-16px">
              Chia sẻ trang cá nhân
            </button>
          </div>
        </div>
      </div> */}

      {/* {isSetting && (
        <div className="fixed z-1000 top-0 left-0 w-full h-screen bg-black/10 flex justify-center items-center">
            <div className="bg-white flex flex-col gap-5 p-3 rounded-2xl">
                <button>Cài đặt trang cá nhân</button>
                <button>Cài đặt hệ thống</button>
                <button>Cài đặt quyền riêng tư</button>
                <button>Mã QR</button>
                <button onClick={logout}>Đăng xuất</button>
            </div>
        </div>
      )} */}

    </>
  );
}

export default Profile;
