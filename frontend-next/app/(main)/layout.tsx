import "../globals.css";
import SidebarLeft from "@/components/SidebarLeft";
import SidebarRight from "@/components/SidebarRight";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-full lg:grid lg:grid-cols-8">
      <div className="lg:col-span-2">
        <SidebarLeft />
      </div>
      <div className="lg:col-span-4 flex flex-col justify-center w-full items-center">
        <main className="w-full">{children}</main>
      </div>
      <div className="hidden lg:block lg:col-span-2">
        <SidebarRight />
      </div>
    </div>
  );
}
