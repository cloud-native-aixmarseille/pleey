import { Route, Routes } from 'react-router-dom';
import { ThemeIdentifier } from '../application/workspace/themes/services/theme-identifier';
import { ThemeRoutesFactory } from '../presentation/theme/routes/theme-routes-factory';

export function ThemeRoutesTestApp() {
  const routes = new ThemeRoutesFactory(new ThemeIdentifier()).create();
  return (
    <Routes>
      {routes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      <Route path="/workspace/organizations" element={<h1>Organizations</h1>} />
      <Route path="/identity/sign-in" element={<h1>Sign in</h1>} />
    </Routes>
  );
}
