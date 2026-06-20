import { BrowserRouter as Router, Routes, Route, Navigate as Redirect } from "react-router-dom";
import Report from "@/pages/Report";
import NavigatePage from "@/pages/Navigate";
import Receipt from "@/pages/Receipt";

export default function App() {
  return (
    <Router>
      <div className="max-w-md mx-auto min-h-screen">
        <Routes>
          <Route path="/" element={<Redirect to="/report" replace />} />
          <Route path="/report" element={<Report />} />
          <Route path="/navigate" element={<NavigatePage />} />
          <Route path="/receipt" element={<Receipt />} />
        </Routes>
      </div>
    </Router>
  );
}
