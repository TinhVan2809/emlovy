import "./globals.css";
import SidebarLeft from "@/components/SidebarLeft";
import SidebarRight from "@/components/SidebarRight";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-full md:grid md:grid-cols-8">
      <div className="md:col-span-2">
        <SidebarLeft />
      </div>
      <div className="md:col-span-4 flex flex-col justify-center w-full items-center">
        <main className="w-full">{children}</main>
      </div>
      <div className="hidden md:block md:col-span-2">
        <SidebarRight />
      </div>
    </div>
  );
}
