import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { NewCasePage } from "./pages/NewCasePage";
import { EvidenceVaultPage } from "./pages/EvidenceVaultPage";
import { AnalysisHubPage } from "./pages/AnalysisHubPage";
import { ClarificationAgentPage } from "./pages/ClarificationAgentPage";
import { StatutoryRightsPage } from "./pages/StatutoryRightsPage";
import { ComplaintPackagePage } from "./pages/ComplaintPackagePage";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/cases/new" element={<NewCasePage />} />
        <Route path="/cases/:id/evidence" element={<EvidenceVaultPage />} />
        <Route path="/cases/:id/analysis" element={<AnalysisHubPage />} />
        <Route path="/cases/:id/agent" element={<ClarificationAgentPage />} />
        <Route path="/cases/:id/rights" element={<StatutoryRightsPage />} />
        <Route path="/cases/:id/package" element={<ComplaintPackagePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
