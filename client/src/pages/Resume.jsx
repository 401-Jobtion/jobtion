import './Resume.css';
import LeftSidebar from "../components/LeftSidebar/LeftSidebar"
import RightSidebar from "../components/RightSidebar/RightSidebar"

function Resume() {
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

export default Resume;