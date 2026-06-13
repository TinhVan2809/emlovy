import { UserProvider } from "@/context/useUserContext";
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
      </head>
      <UserProvider>
        <body>{children}</body>
      </UserProvider>
    </html>
  );
}
