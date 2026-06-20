'use client';

import React, { useEffect, useState } from 'react';
import port from '@/api/api';
import PostCard from './PostCard';
import { useSocket } from '@/context/SocketContext';

type PostMedia = {
  post_media_id: number;
  media_url: string;
  type: string;
};

type PostAuthor = {
  user_id: number;
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

export default function PostFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${port}/api/posts`, {
          credentials: 'include',
        });
        const data = await response.json();
        setPosts(data.data.items || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();

    if (socket) {
      socket.on('post:created', (newPost: Post) => {
        console.log('New post received via socket:', newPost);
        setPosts((prev) => [newPost, ...prev]);
      });

      return () => {
        socket.off('post:created');
      };
    }
  }, [socket]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 md:gap-8 w-full items-center">
        <div className="w-full max-w-xl h-40 bg-gray-200 animate-pulse rounded-xl" />
        <div className="w-full max-w-xl h-40 bg-gray-200 animate-pulse rounded-xl" />
        <div className="w-full max-w-xl h-40 bg-gray-200 animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-8 w-full items-center">
      {posts.map((post) => (
        <PostCard i={post} key={post.post_id} />
      ))}
    </div>
  );
}
