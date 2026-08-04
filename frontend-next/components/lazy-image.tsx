"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface LazyImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
}

/**
 * Lazy Loading Image Component với Intersection Observer
 * Hiển thị skeleton loading cho đến khi ảnh sẵn sàng
 */
export function LazyImage({
  src,
  alt,
  fill,
  width,
  height,
  className = "",
  priority = false,
  sizes,
  objectFit = "cover",
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(priority);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority || !imgRef.current) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "200px", // Tải trước 200px
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  const containerClassName = fill
    ? `relative ${className}`
    : className;

  const imageClassName = `transition-opacity duration-300 ${
    isLoaded ? "opacity-100" : "opacity-0"
  } ${objectFit === "cover" ? "object-cover" : objectFit === "contain" ? "object-contain" : ""}`;

  return (
    <div ref={imgRef} className={containerClassName} style={!fill ? { width, height } : undefined}>
      {/* Skeleton loader */}
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={!fill ? { width, height } : undefined}
        />
      )}

      {/* Chỉ load ảnh khi trong viewport */}
      {isInView && (
        <Image
          src={src}
          alt={alt}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          className={imageClassName}
          priority={priority}
          sizes={sizes}
          onLoad={() => setIsLoaded(true)}
          loading={priority ? "eager" : "lazy"}
        />
      )}
    </div>
  );
}

/**
 * Avatar Component với lazy loading
 */
export function LazyAvatar({
  src,
  name,
  size = 40,
  className = "",
}: {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`relative rounded-full overflow-hidden flex items-center justify-center bg-gray-200 ${className}`}
      style={{ width: size, height: size }}
    >
      {!isLoaded && (
        <span className="text-gray-500 font-semibold" style={{ fontSize: size / 2.5 }}>
          {initials}
        </span>
      )}
      {src && (
        <Image
          src={src}
          alt={name}
          fill
          className={`object-cover transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          sizes={`${size}px`}
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </div>
  );
}

/**
 * Background Image với lazy loading
 */
export function LazyBackgroundImage({
  src,
  alt,
  className = "",
  children,
}: {
  src: string;
  alt: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setIsLoaded(true)}
      />
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
}
