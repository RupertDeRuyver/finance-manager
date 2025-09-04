import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Detail from "./pages/Detail";
import Home from "./pages/Home";
import Confirm from "./pages/Confirm"
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Groceries from "./pages/Groceries";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home/>} />
        <Route path="/transaction/:id" element={<Detail/>} />
        <Route path="/confirm" element={<Confirm/>} />
        <Route path="/settings" element={<Settings/>} />
        <Route path="/groceries" element={<Groceries/>} />
        <Route path="/analytics" element={<Analytics/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
