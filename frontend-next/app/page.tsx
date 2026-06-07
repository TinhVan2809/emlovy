import { redirect } from "next/navigation";
function Page() {
  return (
    // Mặc định là trang login nếu chưa đăng nhập
    redirect("/login")
  );
}

export default Page;
