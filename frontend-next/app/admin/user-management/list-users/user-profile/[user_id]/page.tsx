import port from "@/api/api";

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

  try {
    const fetchUserData = urls.map(async (url) => {
      const response = await fetch(url);
      return response.json();
    });

    const [user, posts] = await Promise.all(fetchUserData);
    console.log("user: ", user);
    console.log("post:", posts);
  } catch (_err) {
    console.error("Error fetching user data", _err);
  }

  return <div className="">Trang admin quan ly user profile</div>;
}

export default UserProfile;
