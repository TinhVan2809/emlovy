// Trang home
import Story from "@/components/story/Story";
import PostFeed from "@/components/PostFeed";

export default function Home() {
  return (
    <>
      <div className="flex flex-col gap-12">
        <Story />
        <PostFeed />
      </div>
    </>
  );
}
