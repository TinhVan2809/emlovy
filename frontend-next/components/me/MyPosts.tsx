import PostCard from "../PostCard";

export type Post = {
  post_id: number;
  content: string;
  created_at: string;
  like_count: number;
  comment_count: number;
  share_count: number;
};

type Props = {
    myPosts: Post[];
}

function MyPosts({myPosts}: Props) {

    console.log(myPosts);
    return ( 
       <div className="flex flex-col gap-4 md:gap-8 items-center w-full">
         {myPosts.map((post: Post) => (
            <PostCard i={post} key={post.post_id}/>
        ))}
       </div>
     );
}

export default MyPosts;