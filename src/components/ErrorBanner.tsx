"use client";

import { Alert, AlertTitle, AlertDescription } from "@stella-ds/react";

interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <Alert variant="error">
      <AlertTitle>エラーが発生しました</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
