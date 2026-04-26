"use client";

import {
  Card,
  CardContent,
  CardHeader,
  Skeleton,
  Stack,
} from "@stella-ds/react";

export function MealPlanSkeleton() {
  return (
    <Stack gap="6">
      <Stack direction="horizontal" gap="2">
        <Skeleton variant="rectangular" width={130} height={26} />
        <Skeleton variant="rectangular" width={110} height={26} />
      </Stack>

      <Skeleton variant="rectangular" width="100%" height={48} />

      <Card>
        <CardHeader>
          <Stack direction="horizontal" justify="between" align="center">
            <Skeleton variant="rectangular" width="55%" height={22} />
            <Skeleton variant="rectangular" width={80} height={24} />
          </Stack>
          <Skeleton variant="text" lines={2} />
        </CardHeader>
        <CardContent>
          <Stack gap="4">
            <Skeleton variant="text" width="30%" height={16} />
            <Skeleton variant="text" lines={5} />
            <Skeleton variant="text" width="30%" height={16} />
            <Skeleton variant="text" lines={4} />
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
