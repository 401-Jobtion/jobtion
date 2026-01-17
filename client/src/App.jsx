import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "./App.css";
import Home from './pages/Home';
import Resume from './pages/Resume';
import Link from './pages/Link';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resume" element={<Resume />} />
        <Route path="/link" element={<Link />} />
      </Routes>
    </Router>
  );
}

export default App;