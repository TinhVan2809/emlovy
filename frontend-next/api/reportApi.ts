import port from "./api";

/**
 * Interface cho pagination
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Interface cho reported entity
 */
export interface ReportedEntity {
  id: number;
  type: "post" | "user" | "comment";
  content?: string;
  post_type?: string;
  author_id?: number;
  username?: string;
  name?: string;
  post_id?: number;
}

/**
 * Interface cho reporter
 */
export interface Reporter {
  user_id: number;
  name: string;
  username: string;
  avatar_url?: string;
}

/**
 * Interface cho report
 */
export interface Report {
  report_id: number;
  reporter: Reporter;
  report_type: "post" | "user" | "comment";
  reported_entity: ReportedEntity | null;
  reason: string | null;
  status: "pending" | "resolved" | "dismissed";
  created_at: string;
  updated_at: string;
}

/**
 * Interface cho response
 */
export interface ReportsResponse {
  success: boolean;
  message: string;
  data: {
    reports: Report[];
    pagination: Pagination;
  };
}

/**
 * Query params cho lấy danh sách reports
 */
export interface GetReportsParams {
  page?: number;
  limit?: number;
  type?: "post" | "user" | "comment" | null;
  status?: "pending" | "resolved" | "dismissed" | null;
}

/**
 * Lấy danh sách báo cáo với phân trang
 */
export async function getReports(
  params: GetReportsParams = {}
): Promise<ReportsResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.type) queryParams.append("type", params.type);
    if (params.status) queryParams.append("status", params.status);

    const response = await fetch(
      `${port}/api/reports?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể lấy danh sách báo cáo");
    }

    return data;
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
}

/**
 * Lấy danh sách báo cáo theo loại
 */
export async function getReportsByType(
  type: "post" | "user" | "comment",
  page: number = 1,
  limit: number = 10
): Promise<ReportsResponse> {
  return getReports({ page, limit, type });
}

/**
 * Cập nhật trạng thái báo cáo
 */
export async function updateReportStatus(
  reportId: number,
  status: "pending" | "resolved" | "dismissed"
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const response = await fetch(`${port}/api/reports/${reportId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ status }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể cập nhật trạng thái báo cáo");
    }

    return data;
  } catch (error) {
    console.error("Error updating report status:", error);
    throw error;
  }
}

/**
 * Tạo báo cáo mới
 */
export async function createReport(reportData: {
  report_type: "post" | "user" | "comment";
  reported_post_id?: number;
  reported_user_id?: number;
  reported_comment_id?: number;
  reason?: string;
}): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const response = await fetch(`${port}/api/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(reportData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể tạo báo cáo");
    }

    return data;
  } catch (error) {
    console.error("Error creating report:", error);
    throw error;
  }
}
