import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import "../../i18n/config";

import { queryClient } from "../../infrastructure/shared/http/api/openapiClient";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
