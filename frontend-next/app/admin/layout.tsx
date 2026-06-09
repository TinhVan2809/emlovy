import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import "./admin.css";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-14 w-full h-screen">
      <div className="col-span-2"><Sidebar /></div>
      <div className="flex flex-col col-span-12">
        <Header />
        <main>{children}</main>
      </div>
    </div>
  );
}
