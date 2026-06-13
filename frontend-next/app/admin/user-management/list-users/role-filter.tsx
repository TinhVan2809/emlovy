"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function RoleFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentRole = searchParams.get("role") || "";

  const handleRoleChange = (role: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (role) {
      params.set("role", role);
    } else {
      params.delete("role");
    }
    
    // Reset về trang 1 khi thay đổi bộ lọc
    params.set("page", "1");
    
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="role-filter" className="text-sm font-medium text-slate-700">Lọc theo:</label>
      <select
        id="role-filter"
        value={currentRole}
        onChange={(e) => handleRoleChange(e.target.value)}
        className="h-9 w-37.5 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm outline-none focus:ring-1 focus:ring-indigo-500"
      >
        <option value="">Tất cả vai trò</option>
        <option value="admin">Admin</option>
        <option value="customer">Customer</option>
      </select>
    </div>
  );
}