import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MusePath · AI 观展路径规划",
  description:
    "为展会、博览会与博物馆生成专属观展路线：AI 按你的兴趣挑选展项，A* 在 3D 场馆里算出可漫游的行走路径。自带 API Key，纯静态部署。",
  applicationName: "MusePath",
};

export const viewport: Viewport = {
  themeColor: "#070b16",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
