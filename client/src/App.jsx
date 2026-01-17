import LeftSidebar from "./components/LeftSidebar/LeftSidebar";
import RightSidebar from "./components/RightSidebar/RightSidebar";
import "./App.css";

export default function App() {
  return (
    <>
      <LeftSidebar />
      <RightSidebar />

      <main className="main-content">
        <div className="center-wrapper">
          <div className="resume-canvas" />
        </div>
      </main>
    </>
  );
}
