import { BrowserRouter, Route, Routes } from "react-router-dom";
import Detail from "./pages/Detail";
import Home from "./pages/Home";
import Confirm from "./pages/Confirm"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/transaction/:id" element={<Detail/>} />
        <Route path="/confirm" element={<Confirm/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
