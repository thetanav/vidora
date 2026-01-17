"use client";

import type React from "react";
import { HydrationBoundary, type DehydratedState } from "@tanstack/react-query";

export function RQHydrate({
  state,
  children,
}: {
  state: DehydratedState;
  children: React.ReactNode;
}) {
  return <HydrationBoundary state={state}>{children}</HydrationBoundary>;
}
