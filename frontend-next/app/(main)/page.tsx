// Trang home
import Story from "@/components/story/Story";
import PostFeed from "@/components/PostFeed";
// import InterestManager from "@/components/InterestManager";

export default function Home() {
  return (
    <>
      <div className="flex flex-col">
        <Story />
        <PostFeed />
      </div>
    </>
  );
}
