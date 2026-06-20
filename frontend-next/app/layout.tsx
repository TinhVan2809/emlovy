import { UserProvider } from "@/context/useUserContext";
import { SocketProvider } from "@/context/SocketContext";
import QueryProvider from "./providers/QueryProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@4.9.0/fonts/remixicon.css"
          rel="stylesheet"
        />
        <meta charSet="UTF-8" />
      </head>
      <UserProvider>
        <SocketProvider>
          <body>
            <QueryProvider>{children}</QueryProvider>
          </body>
        </SocketProvider>
      </UserProvider>
    </html>
  );
}
