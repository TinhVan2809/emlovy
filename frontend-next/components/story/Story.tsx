import { cookies } from "next/headers";
import port from "@/api/api";
export default async function Story() {
  const cookieStore = await cookies();
  const resppnse = await fetch(`${port}/api/stories`, {
    headers: {
      Cookie: cookieStore.toString(), // Do server component không thể tự động gửi cookie nên ta forward cookie
    },
  });
  const data = await resppnse.json();
  console.log("storis:", data);
  return <div className=""></div>;
}

