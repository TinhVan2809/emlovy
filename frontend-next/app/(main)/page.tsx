// Trang home
import port from "@/api/api";
import PostCard from "@/components/PostCard";
import Story from "@/components/story/Story";

type PostMedia = {
  post_media_id: number;
  media_url: string;
  type: string;
};

type PostAuthor = {
  name: string;
  username: string;
};

type Post = {
  post_id: number;
  content: string;
  media?: PostMedia[];
  author?: PostAuthor;
  created_at: string;
  like_count: number;
  comment_count: number;
  share_count: number;
};
export default async function Home() {
  const response = await fetch(`${port}/api/posts`, {
    next: { revalidate: 120 },
    credentials: 'include',
  });
  const data = await response.json();

  const posts = data.data.items || [];


  return (
    <>
      <Story />
      <div className="flex flex-col gap-20">
        {posts.map((i: Post) => (
          <PostCard i={i} key={i.post_id} />
        ))}
      </div>
    </>
  );
}
