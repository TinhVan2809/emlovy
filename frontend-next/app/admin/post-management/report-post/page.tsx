"use client";

import { useEffect, useState } from "react";
import { getReports, updateReportStatus, Report, Pagination } from "@/api/reportApi";
import Image from "next/image";
import port from "@/api/api";
import ReportCardSkeleton from "@/components/ReportCardSkeleton";

export default function ReportPost() {
  const [reports, setReports] = useState<Report[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<"post" | "user" | "comment" | "all">("post");
  const [filterStatus, setFilterStatus] = useState<"pending" | "resolved" | "dismissed" | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch reports
  const fetchReports = async (page: number = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = {
        page,
        limit: 10,
        type: filterType === "all" ? null : filterType,
        status: filterStatus === "all" ? null : filterStatus,
      };

      const response = await getReports(params);
      setReports(response.data.reports);
      setPagination(response.data.pagination);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchReports(1);
  }, [filterType, filterStatus]);

  // Handle status update
  const handleStatusUpdate = async (reportId: number, newStatus: "pending" | "resolved" | "dismissed") => {
    try {
      await updateReportStatus(reportId, newStatus);
      // Refresh current page
      fetchReports(currentPage);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể cập nhật trạng thái");
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchReports(page);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "dismissed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "resolved":
        return "Đã xử lý";
      case "dismissed":
        return "Đã bỏ qua";
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Bài viết bị báo cáo</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Loại báo cáo:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="post">Bài viết</option>
            <option value="user">Người dùng</option>
            <option value="comment">Bình luận</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Trạng thái:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ xử lý</option>
            <option value="resolved">Đã xử lý</option>
            <option value="dismissed">Đã bỏ qua</option>
          </select>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <ReportCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Reports list */}
      {!isLoading && !error && (
        <>
          {reports.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Không có báo cáo nào
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.report_id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src={
                          report.reporter.avatar_url
                            ? `${port}/${report.reporter.avatar_url}`
                            : "/Profile-Default.webp"
                        }
                        alt={report.reporter.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div>
                        <p className="font-medium">{report.reporter.name}</p>
                        <p className="text-sm text-gray-500">
                          @{report.reporter.username}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        report.status
                      )}`}
                    >
                      {getStatusLabel(report.status)}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Loại:
                      </span>
                      <span className="text-sm text-gray-600">
                        {report.report_type === "post" && "Bài viết"}
                        {report.report_type === "user" && "Người dùng"}
                        {report.report_type === "comment" && "Bình luận"}
                      </span>
                    </div>

                    {report.reason && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Lý do:
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          {report.reason}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Reported Entity */}
                  {report.reported_entity && (
                    <div className="bg-gray-50 p-4 rounded-md mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Nội dung bị báo cáo:
                      </p>
                      {report.reported_entity.type === "post" && (
                        <div>
                          <p className="text-sm text-gray-600">
                            {report.reported_entity.content}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            ID: {report.reported_entity.id} | Loại:{" "}
                            {report.reported_entity.post_type}
                          </p>
                        </div>
                      )}
                      {report.reported_entity.type === "user" && (
                        <div>
                          <p className="text-sm text-gray-600">
                            {report.reported_entity.name} (@
                            {report.reported_entity.username})
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            ID: {report.reported_entity.id}
                          </p>
                        </div>
                      )}
                      {report.reported_entity.type === "comment" && (
                        <div>
                          <p className="text-sm text-gray-600">
                            {report.reported_entity.content}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            ID: {report.reported_entity.id} | Post ID:{" "}
                            {report.reported_entity.post_id}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      {formatDate(report.created_at)}
                    </p>

                    <div className="flex gap-2">
                      {report.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusUpdate(report.report_id, "resolved")
                            }
                            className="px-4 py-2 bg-black text-white text-sm rounded-[20px] hover:opacity-55 transition-colors"
                          >
                            Xử lý
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(report.report_id, "dismissed")
                            }
                            className="px-4 py-2 border border-black/20 text-sm rounded-[20px] hover:opacity-55 transition-colors"
                          >
                            Bỏ qua
                          </button>
                        </>
                      )}
                      {report.status !== "pending" && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(report.report_id, "pending")
                          }
                          className="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                        >
                          Đánh dấu chờ xử lý
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>

              <div className="flex gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first page, last page, current page, and pages around current
                    return (
                      page === 1 ||
                      page === pagination.totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .map((page, index, array) => {
                    // Add ellipsis if there's a gap
                    const prevPage = index > 0 ? array[index - 1] : 0;
                    const showEllipsis = page - prevPage > 1;

                    return (
                      <div key={page} className="flex items-center">
                        {showEllipsis && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 border rounded-md ${
                            page === currentPage
                              ? "bg-blue-500 text-white border-blue-500"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    );
                  })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          )}

          {/* Pagination info */}
          <div className="mt-4 text-center text-sm text-gray-600">
            Trang {pagination.page} / {pagination.totalPages} (Tổng:{" "}
            {pagination.total} báo cáo)
          </div>
        </>
      )}
    </div>
  );
}