"use client";

import { ThemeProvider, ToastProvider, ToastViewport } from "@stella-ds/react";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme="light" style={{ display: "contents" }}>
      <ToastProvider>
        {children}
        <ToastViewport />
      </ToastProvider>
    </ThemeProvider>
  );
}
