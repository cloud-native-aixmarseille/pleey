import { AppProviders } from "./providers/AppProviders";
import { RootApp } from "../presentation/RootApp";

export default function App() {
  return (
    <AppProviders>
      <RootApp />
    </AppProviders>
  );
}
