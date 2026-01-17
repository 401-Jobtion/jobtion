import { useState } from "react";
import LeftSidebar from "../components/LeftSidebar/LeftSidebar";
import RightSidebar from "../components/RightSidebar/RightSidebar";
import "./resume-editor.css";

export default function ResumeEditor() {
  const [profile, setProfile] = useState(null);
  const [workExperiences, setWorkExperiences] = useState([]);

  return (
    <>
      {/* Left Sidebar */}
      <LeftSidebar
        profile={profile}
        onAddProfile={setProfile}
        workExperiences={workExperiences}
        onAddWorkExperience={(exp) =>
          setWorkExperiences((prev) => [...prev, exp])
        }
      />

      {/* Right Sidebar */}
      <RightSidebar />

      {/* Resume Canvas */}
      <main className="editor-main">
        <div className="editor-center">
          <div className="resume-canvas">
            {profile && <ProfileHeader profile={profile} />}

            {workExperiences.length > 0 && (
              <WorkExperienceSection experiences={workExperiences} />
            )}
          </div>
        </div>
      </main>
    </>
  );
}

/* =========================
   PROFILE HEADER
   ========================= */

function ProfileHeader({ profile }) {
  return (
    <div className="resume-profile">
      <h1 className="profile-name">{profile.name}</h1>

      <div className="profile-meta">
        {profile.phone && <span>📞 {profile.phone}</span>}
        {profile.email && <span>✉️ {profile.email}</span>}
      </div>

      <hr />
    </div>
  );
}

/* =========================
   WORK EXPERIENCE SECTION
   ========================= */

function WorkExperienceSection({ experiences }) {
  return (
    <section className="resume-section">
      <h2 className="resume-section-title">Experience</h2>

      {experiences.map((exp, index) => (
        <div key={index} className="resume-item">
          <div className="resume-item-header">
            <strong>{exp.company}</strong>
            <span className="resume-date">
              {exp.start} – {exp.end}
            </span>
          </div>

          <div className="resume-item-role">{exp.role}</div>

          <ul>
            {exp.description
              .split("\n")
              .filter(Boolean)
              .map((line, i) => (
                <li key={i}>{line}</li>
              ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
