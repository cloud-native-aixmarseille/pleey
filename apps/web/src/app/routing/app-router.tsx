import { createBrowserRouter, RouterProvider } from 'react-router-dom';

interface AppRouterProps {
  readonly router: ReturnType<typeof createBrowserRouter>;
}

export function AppRouter({ router }: AppRouterProps) {
  return <RouterProvider router={router} />;
}
