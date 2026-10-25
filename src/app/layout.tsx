import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MusePath · AI 观展路径规划",
  description:
    "为展会、博览会与博物馆生成专属观展路线：AI 按你的兴趣挑选展项，A* 在 3D 场馆里算出可漫游的行走路径。自带 API Key，纯静态部署。",
  applicationName: "MusePath",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e3ebf7" },
    { media: "(prefers-color-scheme: dark)", color: "#070b16" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

/** 首帧前应用主题，避免日间/夜间闪屏；与 src/lib/theme.ts 读写同一 localStorage 键 */
const themeInitScript = `(function(){try{var t=localStorage.getItem("musepath-theme");if(t!=="light"&&t!=="dark")t="system";var l=t==="light"||(t==="system"&&window.matchMedia("(prefers-color-scheme: light)").matches);var d=document.documentElement;d.classList.toggle("light",l);d.classList.toggle("dark",!l);d.style.colorScheme=l?"light":"dark";var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",l?"#e3ebf7":"#070b16")}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
