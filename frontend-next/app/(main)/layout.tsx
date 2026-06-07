import "./globals.css";
import Footer from "@/components/Footer";
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
        <main>{children}</main>
        <Footer />
      </div>
      <div className="hidden md:block md:col-span-2">
        <SidebarRight />
      </div>
    </div>
  );
}
