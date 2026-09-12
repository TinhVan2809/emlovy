import { cookies } from "next/headers";
import port from "@/api/api";
import StoryList from "./StoryList";
import type { StoryGroup } from "./StoryCard";

const ownPlaceholder: StoryGroup = {
  user_id: 0,
  is_own: true,
  author: { name: "Tin của bạn", avatar_url: "/Profile-Default.webp" },
  stories: [],
};

export default async function Story() {
  const cookieStore = await cookies();
  let groups: StoryGroup[] = [];

  try {
    const response = await fetch(`${port}/api/stories`, {
      headers: { Cookie: cookieStore.toString() },
      credentials: "include",
      cache: "no-store",
    });
    if (response.ok) {
      const data = await response.json();
      groups = data?.data?.groups || [];
    }
  } catch {
    groups = [];
  }

  // Luôn đảm bảo card "Tin của bạn" hiển thị đầu tiên
  const hasOwnGroup = groups.some((g) => g.is_own);
  const finalGroups = hasOwnGroup ? groups : [ownPlaceholder, ...groups];

  return <StoryList groups={finalGroups} />;
}

