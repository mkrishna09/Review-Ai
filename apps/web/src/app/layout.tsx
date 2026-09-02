import "./globals.css";
import localFont from "next/font/local";
import AppProvider from "../providers/app-provider";

const geist = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "ReviewAI",
  description: "AI-powered repository review platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geist.variable}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
