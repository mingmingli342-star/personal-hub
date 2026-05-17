import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import AssetsPage from "./pages/AssetsPage";
import WorkPage from "./pages/WorkPage";
import HealthPage from "./pages/HealthPage";
import PlansPage from "./pages/PlansPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="assets" element={<AssetsPage />} />
        <Route path="work" element={<WorkPage />} />
        <Route path="health" element={<HealthPage />} />
        <Route path="plans" element={<PlansPage />} />
      </Route>
    </Routes>
  );
}
