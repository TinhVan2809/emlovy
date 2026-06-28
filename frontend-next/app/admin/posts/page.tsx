'use client';
import port from "@/api/api";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RiHeartFill, RiImageFill, RiLoader4Line, RiMessage2Fill } from "@remixicon/react";
import Image from "next/image";

type Period = "7days" | "30days" | "12months";

// Định nghĩa cấu trúc dữ liệu cho một bài viết hàng đầu
interface TopPost {
  post_id: number;
  content: string;
  post_type: 'post' | 'reel';
  like_count: number;
  comment_count: number;
  media_url: string | null;
  username: string;
  user_name: string;
  user_avatar: string | null;
  label: string; // Thêm thuộc tính label để hiển thị trên biểu đồ
}

// Tooltip tùy chỉnh để hiển thị thông tin chi tiết hơn
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm text-sm">
                <p className="font-bold text-gray-800 truncate max-w-xs">{data.content ? `"${data.content}"` : `Post #${data.post_id}`}</p>
                <p className="text-gray-600 text-xs">bởi @{data.username}</p>
                <p className="mt-2 text-indigo-500">{`Lượt thích: ${data.like_count}`}</p>
                <p className="text-green-500">{`Bình luận: ${data.comment_count}`}</p>
            </div>
        );
    }
    return null;
};

// Nhãn trục X tùy chỉnh để cắt bớt và xoay văn bản dài
const CustomizedXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const label = payload.value;
    const truncatedLabel = label.length > 15 ? `${label.substring(0, 12)}...` : label;
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={16} textAnchor="end" fill="#666" fontSize={12} transform="rotate(-35)">
                {truncatedLabel}
            </text>
        </g>
    );
};

// Component để hiển thị media (ảnh hoặc video)
const MediaItem = ({ post }: { post: TopPost }) => {
    const mediaUrl = post.media_url ? `${port}${post.media_url}` : null;
    const isVideo = !!(mediaUrl && (post.post_type === 'reel' || mediaUrl.endsWith('.mp4')));

    return (
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group border-2 border-transparent hover:border-indigo-400 transition-all duration-200">
            {mediaUrl ? (
                isVideo ? (
                    <video src={mediaUrl} className="w-full h-full object-cover" muted loop playsInline onMouseOver={e => e.currentTarget.play()} onMouseOut={e => e.currentTarget.pause()} />
                ) : (
                    <Image src={mediaUrl} alt={`Post by ${post.username}`} width={200} height={200} className="w-full h-full object-cover" />
                )
            ) : <div className="w-full h-full bg-gray-200 flex items-center justify-center"><RiImageFill className="text-gray-400" size={40}/></div>}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 text-white text-xs">
                <p className="font-bold line-clamp-2">{post.content || `Post #${post.post_id}`}</p>
                <div className="flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1"><RiHeartFill className="text-red-400"/> {post.like_count}</span>
                    <span className="flex items-center gap-1"><RiMessage2Fill className="text-sky-400"/> {post.comment_count}</span>
                </div>
            </div>
        </div>
    );
};

function TopPosts() {
   const [topPosts, setTopPosts] = useState<TopPost[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [period, setPeriod] = useState<Period>("7days");

    useEffect(() => {
        const handleFetchTopPosts = async() => {
            setLoading(true);
            setError(null);
            try{
                const response = await fetch(`${port}/api/admin/stats/top-posts?limit=7&range=${period}`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();

                if(data.success) {
                    const formattedData = data.data.map((post: TopPost) => ({
                        ...post,
                        label: post.content ? post.content : `Post #${post.post_id}`,
                    }));
                    setTopPosts(formattedData);
                } else {
                    throw new Error(data.message || "Không thể tải dữ liệu top posts.");
                }
            } catch(err) { 
                setError(err instanceof Error ? err.message : "Lỗi không xác định");
                console.error("Error fetching top posts", err);
            } finally {
                setLoading(false);
            }
        };
        handleFetchTopPosts();
    },[period]);

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm flex justify-center items-center h-96">
                <RiLoader4Line className="animate-spin text-2xl text-gray-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 text-red-500 text-sm h-96 flex justify-center items-center">
                Lỗi: {error}
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-800">Top 7 bài viết tương tác cao nhất</h3>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as Period)}
                    className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                >
                    <option value="7days">7 ngày qua</option>
                    <option value="30days">30 ngày qua</option>
                    <option value="12months">12 tháng qua</option>
                </select>
            </div>
            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                    <BarChart data={topPosts} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" type="category" interval={0} tick={<CustomizedXAxisTick />} />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(240, 240, 240, 0.5)' }} />
                        <Legend wrapperStyle={{fontSize: "14px", paddingTop: "20px"}}/>
                        <Bar dataKey="like_count" name="Lượt thích" stackId="a" fill="#8884d8" barSize={30} />
                        <Bar dataKey="comment_count" name="Bình luận" stackId="a" fill="#82ca9d" barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            {topPosts.length > 0 && (
                <div className="mt-8">
                    <h4 className="font-bold text-md text-gray-700 mb-3">Media từ các bài viết hàng đầu</h4>
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                        {topPosts.map(post => <MediaItem key={post.post_id} post={post} />)}
                    </div>
                </div>
            )}
        </div>
    );
}

export default TopPosts;