import { cookies } from "next/headers";
import port from "@/api/api";

export default async function ReportPost() {
    const cookieStore = await cookies();

    const response = await fetch(`${port}/api/reports`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Cookie: cookieStore.toString(),
        },
        credentials: "include",
    });

    const data = await response.json();
    console.log(data);

    return (
        <div className="">
            <p>Trang bai viet bi bao cao</p>
        </div>
    )
}