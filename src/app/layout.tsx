import type { Metadata } from "next";
import "./globals.css";
import { Background } from "@stella-ds/react";
import { ClientProviders } from "@/components/ClientProviders";

export const metadata: Metadata = {
  title: "Meal AI - 魔法のパティシエが食事プランを提案",
  description: "目標体重やカロリーから、AIが最適な食事プランとレシピを提案します",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <Background variant="galaxy" color="mixed" theme="light">
          <ClientProviders>{children}</ClientProviders>
        </Background>
      </body>
    </html>
  );
}
