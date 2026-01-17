import LeftSidebar from "../components/LeftSidebar/LeftSidebar";
import RightSidebar from "../components/RightSidebar/RightSidebar";
import "./resume-editor.css";

export default function ResumeEditor() {
  return (
    <>
      <LeftSidebar />
      <RightSidebar />

      <main className="editor-main">
        <div className="editor-center">
          <div className="resume-canvas" />
        </div>
      </main>
    </>
  );
}
