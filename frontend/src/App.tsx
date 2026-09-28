import { Route, Routes } from "react-router-dom";
import LeadDetail from "./pages/LeadDetail";
import LeadList from "./pages/LeadList";

export default function App() {
  return (
    <main>
      <h1>Lead Intake</h1>
      <Routes>
        <Route path="/" element={<LeadList />} />
        <Route path="/leads/:id" element={<LeadDetail />} />
      </Routes>
    </main>
  );
}