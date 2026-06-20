import { BrowserRouter as Router, Routes, Route, Navigate as Redirect } from "react-router-dom";
import Report from "@/pages/Report";
import NavigatePage from "@/pages/Navigate";
import NavigationExecution from "@/pages/NavigationExecution";
import Receipt from "@/pages/Receipt";
import History from '@/pages/History';

export default function App() {
  return (
    <Router>
      <div className="max-w-md mx-auto min-h-screen">
        <Routes>
          <Route path="/" element={<Redirect to="/report" replace />} />
          <Route path="/report" element={<Report />} />
          <Route path="/navigate" element={<NavigatePage />} />
          <Route path="/navigation-execution" element={<NavigationExecution />} />
          <Route path="/receipt" element={<Receipt />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </Router>
  );
}
