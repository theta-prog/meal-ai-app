"use client";

import { ToastProvider, ToastViewport } from "@stella-ds/react";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <ToastViewport />
    </ToastProvider>
  );
}
