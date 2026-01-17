import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ResumeEditor from "./pages/ResumeEditor";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resume" element={<ResumeEditor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
