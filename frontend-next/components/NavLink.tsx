"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  color: string;
  children: React.ReactNode;
}

export default function NavLink({ href, color, children }: NavLinkProps) {
  const pathname = usePathname();

  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={
        isActive ? `${color}` : ""
      }
    >
      {children}
    </Link>
  );
}
