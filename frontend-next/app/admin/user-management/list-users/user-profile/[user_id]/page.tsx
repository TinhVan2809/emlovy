import port from "@/api/api";
import Profile from "./profile";
// import Link from "next/link";
import { IUserProfileApiResponse, IPostsResponse } from "./user";

interface UserProfileProps {
  params: Promise<{ user_id: string }>;
}

async function UserProfile({ params }: UserProfileProps) {
  const resolvedParams = await params;
  const user_id = Number(resolvedParams.user_id);

  const urls = [
    `${port}/api/profile/${user_id}`,
    `${port}/api/posts/user/${user_id}`,
  ];
    let user: IUserProfileApiResponse | null = null;
  let posts: IPostsResponse | null = null;
  try {
    const fetchUserData = urls.map(async (url) => {
      const response = await fetch(url);
      return response.json();
    });

    const [userData, postsData] = await Promise.all(fetchUserData);
    user = userData;
    posts = postsData;
    console.log(user);
    console.log(posts);
  } catch (_err) {
    console.error("Error fetching user data", _err);
  }


  return (
    <div className="px-30 w-full h-full">
      <Profile user={user} posts={posts} />
    </div>
  );
}

export default UserProfile;
