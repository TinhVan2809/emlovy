"use client";
import port from "@/api/api";
import { useEffect, useMemo, useState } from "react";
import { RiArrowDownLine, RiArrowUpLine } from "@remixicon/react";
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from "recharts";

interface Props {
  endpoint: string;
  period: string;
  title: string;
  icon: string;
  backgroundColor: string;
  color: string;
}

interface StatData {
  label: string;
  value: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    type: string;
    range: string;
    data: StatData[];
    previous_total?: number; // Giả định backend bổ sung trường này
  };
}

function DashboardCard({
  endpoint,
  period,
  title,
  icon,
  backgroundColor,
  color,
}: Props) {
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    const handleFetchstats = async () => {
      try {
        const response = await fetch(`${port}/${endpoint}?range=${period}`, {
          method: "GET",
          signal: controller.signal,
          credentials: "include",
          next: {revalidate: 60},
        });
        if (!response.ok) throw new Error(`ERROR HTTP ${response.status}`);

        const result: ApiResponse = await response.json();

        if (result.success) {
          setResponse(result);
        }
      } catch (_err) {
        if ((_err as Error).name === "AbortError") return;
        setError(_err instanceof Error ? _err.message : String(_err));
      } finally {
        setLoading(false);
      }
    };
    handleFetchstats();
    return () => controller.abort();
  }, [endpoint, period]);

  // 1. Tính tổng giá trị của kỳ hiện tại (Tuần này)
  const currentTotal = useMemo(() => {
    if (!response?.data.data) return 0;
    return response.data.data.reduce((acc, curr) => acc + curr.value, 0);
  }, [response]);

  // 2. Logic tính toán tỷ lệ phần trăm thay đổi
  const previousTotal = response?.data.previous_total ?? 0;
  const percentageChange = useMemo(() => {
    if (previousTotal === 0) return currentTotal > 0 ? 100 : 0;
    return ((currentTotal - previousTotal) / previousTotal) * 100;
  }, [currentTotal, previousTotal]);

  const isPositive = percentageChange >= 0;

  if (loading)
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm animate-pulse h-32"></div>
    );
  if (error)
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 text-red-500 text-sm">
        Lỗi: {error}
      </div>
    );

    // format period to display
    let displayPeriod = "";
    if (period === "7days") displayPeriod = "7 ngày";
    else if (period === "30days") displayPeriod = "30 ngày";
    else if (period === "12months") displayPeriod = "12 tháng";


  return (
    <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col gap-2 border border-gray-100">
      <div className="flex gap-5 items-start flex-col md:flex-row">
        <div className="py-2 px-3 rounded-md" style={{ backgroundColor, color }}>
          <i className={`${icon} text-xl`}></i>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-gray-500 text-sm font-medium">{title}</span>
          <div className="flex gap-2">
            <div className="flex flex-col">
              <h3 className="text-xl font-bold">
                {currentTotal.toLocaleString()}
              </h3>
            </div>
            <div className="flex items-center">
              <div
                className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded-md ${
                  isPositive
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {isPositive ? (
                  <RiArrowUpLine size={14} />
                ) : (
                  <RiArrowDownLine size={14} />
                )}
                <span>{Math.abs(percentageChange).toFixed(1)}%</span>
              </div>
            </div>
          </div>
          <span className="text-xs text-gray-400">so với {displayPeriod} trước</span>
        </div>
      </div>

      {/* Mini Trend Chart */}
      <div className="h-10 w-full mt-2 relative">
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          debounce={100}
        >
          <LineChart data={response?.data.data}>
            <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
            <Tooltip
              contentStyle={{
                fontSize: "10px",
                borderRadius: "6px",
                border: "1px solid #f3f4f6",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                padding: "4px 8px",
              }}
              itemStyle={{ padding: 0, fontWeight: "bold" }}
              labelStyle={{ color: "#9ca3af", marginBottom: "2px" }}
              cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }}
              separator=": "
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ r: 3, fill: color, strokeWidth: 0 }}
              activeDot={{ r: 4, strokeWidth: 0 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default DashboardCard;
