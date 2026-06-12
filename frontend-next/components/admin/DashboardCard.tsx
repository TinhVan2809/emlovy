'use client';
import port from "@/api/api";
import { useEffect, useState } from "react";
interface Props {
  endpoint: string;
  period: string;
  title: string;
  icon: string
}
function DashboardCard({ endpoint, period, title, icon }: Props) {
  const [data, setData] = useState<unknown>(null);
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
          credentials: 'include',
        });
        if (!response.ok) throw new Error(`ERROR HTTP ${response.status}`);

        const data = await response.json();

        if (data.success) {
          setData(data);
        }
        console.log(data);
      } catch (_err) {
        console.error("Error fething stats", _err);
        setError(_err instanceof Error ? _err.message : String(_err));
      } finally {
        setLoading(false);
      }
    };
    handleFetchstats();
  }, [endpoint, period]);

  return <div className=""></div>;
}

export default DashboardCard;
