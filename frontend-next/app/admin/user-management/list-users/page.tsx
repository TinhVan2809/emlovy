import port from "@/api/api";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Badge } from "./badge";
import { RoleFilter } from "./role-filter";
import SearchUsers from "./search-users";

import {
  IUser,
  IPaginationData,
  IUserProfileApiResponse,
  IPost
} from "./user-profile/[user_id]/user";

async function ListManagement({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; role?: string }>;
}) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1", 10);
  const role = params.role || "";
  const limit = 10;

  const fetchUrl = `${port}/api/users/list?page=${currentPage}&limit=${limit}${role ? `&role=${role}` : ""}`;
  const response = await fetch(fetchUrl, {
    method: "GET",
    cache: "no-store",
  });

  const result = await response.json();
  const data: IUser[] = result.items || [];
  const pagination: IPaginationData = result.pagination || {
    total: 0,
    totalPages: 1,
    page: 1,
    limit: 10,
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Quản lý người dùng
          </h1>
          <p className="text-slate-500 text-sm">
            Danh sách tất cả người dùng trên hệ thống Emlovy.
          </p>
        </div>
        <div className="flex items-center gap-3.5 ">
          <SearchUsers />
          <RoleFilter />
        </div>
      </div>

      {data && Array.isArray(data) && data.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-50">Họ tên</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Ngày tham gia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((user: IUser) => (
                <TableRow key={user.user_id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>@{user.username}</TableCell>
                  <TableCell>{user.email || "N/A"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.status === 1 ? "success" : "destructive"}
                    >
                      {user.status === 1 ? "Hoạt động" : "Bị khóa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-slate-500">
                    {new Date(user.created_at).toLocaleDateString("vi-VN")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Hiển thị trang {pagination.page} / {pagination.totalPages} (
              {pagination.total} người dùng)
            </p>
            <div className="flex gap-2">
              <Link
                href={`?page=${Math.max(1, currentPage - 1)}${role ? `&role=${role}` : ""}`}
                className={`px-4 py-2 text-sm border rounded-md transition-colors ${currentPage <= 1 ? "pointer-events-none opacity-50 bg-slate-50" : "hover:bg-slate-50"}`}
              >
                Trang trước
              </Link>
              <Link
                href={`?page=${Math.min(pagination.totalPages, currentPage + 1)}${role ? `&role=${role}` : ""}`}
                className={`px-4 py-2 text-sm border rounded-md transition-colors ${currentPage >= pagination.totalPages ? "pointer-events-none opacity-50 bg-slate-50" : "hover:bg-slate-50"}`}
              >
                Trang sau
              </Link>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-10 text-slate-500">
          Không có dữ liệu người dùng.
        </div>
      )}
    </div>
  );
}

export default ListManagement;
