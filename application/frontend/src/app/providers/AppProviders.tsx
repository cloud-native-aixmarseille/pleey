import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import "../../i18n/config";

import { queryClient } from "./queryClient";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
