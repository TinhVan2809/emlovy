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
      <div className="col-span-2 h-full"><Sidebar /></div>
      <div className="col-span-12 flex flex-col w-full h-full">
        <Header />
        <main className="w-full h-full">{children}</main>
      </div>
    </div>
  );
}
