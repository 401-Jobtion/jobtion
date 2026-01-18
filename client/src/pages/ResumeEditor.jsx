import { useState, useEffect } from "react";

// Enhanced Resume Editor Component
export default function ResumeEditorEnhanced() {
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    email: "",
    linkedin: "",
    website: ""
  });

  const [experiences, setExperiences] = useState([]);
  const [projects, setProjects] = useState([]);
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState({
    id: "skills-1",
    categories: []
  });

  // --- Saved Versions Logic ---
  const [savedVersions, setSavedVersions] = useState(() => {
    const saved = localStorage.getItem("resume_saved_versions");
    return saved ? JSON.parse(saved) : [];
  });

  const saveCurrentVersion = () => {
    const versionName = prompt("Enter a name for this version:", `Version ${savedVersions.length + 1}`);
    if (!versionName) return;

    const newVersion = {
      id: Date.now(),
      name: versionName,
      timestamp: new Date().toISOString(),
      data: { profile, experiences, projects, education, skills }
    };

    const updatedVersions = [newVersion, ...savedVersions];
    setSavedVersions(updatedVersions);
    localStorage.setItem("resume_saved_versions", JSON.stringify(updatedVersions));
  };

  const loadVersion = (version) => {
    if (confirm(`Load "${version.name}"? Current unsaved changes will be lost.`)) {
      setProfile(version.data.profile);
      setExperiences(version.data.experiences);
      setProjects(version.data.projects);
      setEducation(version.data.education);
      setSkills(version.data.skills);
    }
  };

  const deleteVersion = (e, id) => {
    e.stopPropagation();
    const updated = savedVersions.filter(v => v.id !== id);
    setSavedVersions(updated);
    localStorage.setItem("resume_saved_versions", JSON.stringify(updated));
  };

  const getTimeAgo = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };
  // --- End Saved Versions Logic ---

  const [draggedItem, setDraggedItem] = useState(null);
  const [jobUrl, setJobUrl] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [editingEducation, setEditingEducation] = useState(null);
  const [editingSkills, setEditingSkills] = useState(null);

  // Drag and Drop handlers
  const handleDragStart = (e, item, type) => {
    setDraggedItem({ item, type });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetIndex, type) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.type !== type) return;

    const items = type === 'experience' ? [...experiences] : 
                  type === 'project' ? [...projects] : [...education];
    
    const draggedIndex = items.findIndex(item => item.id === draggedItem.item.id);
    const [removed] = items.splice(draggedIndex, 1);
    items.splice(targetIndex, 0, removed);

    if (type === 'experience') setExperiences(items);
    else if (type === 'project') setProjects(items);
    else setEducation(items);

    setDraggedItem(null);
  };

  // LLM Optimization (simulated)
  const optimizeForJob = async () => {
    if (!jobUrl) {
      alert("Please enter a job posting URL");
      return;
    }

    setIsOptimizing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate LLM optimization - in real implementation, this would call your backend
    const optimizedExperiences = experiences.map(exp => ({
      ...exp,
      bullets: exp.bullets.map(bullet => 
        bullet + " (optimized for job posting)"
      )
    }));

    setExperiences(optimizedExperiences);
    setIsOptimizing(false);
    alert("Resume optimized! Check the updated bullet points.");
  };

  const addNewExperience = () => {
    const newExp = {
      id: `exp-${Date.now()}`,
      company: "",
      role: "",
      start: "",
      end: "",
      bullets: [""]
    };
    setEditingExperience(newExp);
  };

  const addNewProject = () => {
    const newProj = {
      id: `proj-${Date.now()}`,
      name: "",
      tech: "",
      bullets: [""]
    };
    setEditingProject(newProj);
  };

  const addNewEducation = () => {
    const newEdu = {
      id: `edu-${Date.now()}`,
      school: "",
      degree: "",
      period: "",
      gpa: ""
    };
    setEditingEducation(newEdu);
  };

  const deleteItem = (id, type) => {
    if (type === 'experience') {
      setExperiences(experiences.filter(exp => exp.id !== id));
    } else if (type === 'project') {
      setProjects(projects.filter(proj => proj.id !== id));
    } else if (type === 'education') {
      setEducation(education.filter(edu => edu.id !== id));
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#1e1e1e" }}>
      {/* Left Sidebar - Sections Library */}
      <aside style={{
        width: leftCollapsed ? "60px" : "280px",
        background: "#2b2b2b",
        color: "#eaeaea",
        padding: "20px",
        overflowY: "auto",
        transition: "width 0.3s",
        borderRight: "1px solid #3a3a3a"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          {!leftCollapsed && <h2 style={{ margin: 0, fontSize: "18px" }}>Sections</h2>}
          <button 
            onClick={() => setLeftCollapsed(!leftCollapsed)}
            style={{
              background: "none",
              border: "none",
              color: "#aaa",
              cursor: "pointer",
              fontSize: "20px"
            }}
          >
            {leftCollapsed ? "→" : "←"}
          </button>
        </div>

        {!leftCollapsed && (
          <>
            <Section title="Profile">
              <button
                onClick={() => setShowProfileEdit(true)}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "15px"
                }}
              >
                {profile.name ? "Edit Profile" : "Add Profile"}
              </button>
              {profile.name && (
                <div style={{
                  background: "#3a3a3a",
                  padding: "12px",
                  borderRadius: "6px",
                  fontSize: "13px"
                }}>
                  <div style={{ fontWeight: "500", marginBottom: "5px" }}>{profile.name}</div>
                  <div style={{ color: "#aaa", fontSize: "12px" }}>{profile.email}</div>
                  <div style={{ color: "#aaa", fontSize: "12px" }}>{profile.phone}</div>
                </div>
              )}
            </Section>

            <Section title="Experience" onAdd={addNewExperience}>
              {experiences.map((exp, idx) => (
                <DraggableItem
                  key={exp.id}
                  item={exp}
                  type="experience"
                  onDragStart={(e) => handleDragStart(e, exp, 'experience')}
                  onEdit={() => setEditingExperience(exp)}
                  onDelete={() => deleteItem(exp.id, 'experience')}
                  title={exp.company || "Untitled"}
                  subtitle={exp.role || "No role"}
                />
              ))}
            </Section>

            <Section title="Projects" onAdd={addNewProject}>
              {projects.map((proj) => (
                <DraggableItem
                  key={proj.id}
                  item={proj}
                  type="project"
                  onDragStart={(e) => handleDragStart(e, proj, 'project')}
                  onEdit={() => setEditingProject(proj)}
                  onDelete={() => deleteItem(proj.id, 'project')}
                  title={proj.name || "Untitled"}
                  subtitle={proj.tech || "No tech"}
                />
              ))}
            </Section>

            <Section title="Education" onAdd={addNewEducation}>
              {education.map((edu) => (
                <DraggableItem
                  key={edu.id}
                  item={edu}
                  type="education"
                  onDragStart={(e) => handleDragStart(e, edu, 'education')}
                  onEdit={() => setEditingEducation(edu)}
                  onDelete={() => deleteItem(edu.id, 'education')}
                  title={edu.school || "Untitled"}
                  subtitle={edu.degree || "No degree"}
                />
              ))}
            </Section>

            <Section title="Skills">
              <button
                onClick={() => setEditingSkills(skills)}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500"
                }}
              >
                {skills.categories.length > 0 ? "Edit Skills" : "Add Skills"}
              </button>
            </Section>
          </>
        )}
      </aside>

      {/* Main Canvas */}
      <main style={{
        flex: 1,
        padding: "40px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        overflowY: "auto"
      }}>
        <div style={{
          width: "794px",
          minHeight: "1123px",
          background: "white",
          boxShadow: "0 0 20px rgba(0,0,0,0.3)",
          padding: "40px 60px"
        }}>
          {/* Profile Header */}
          {profile.name && (
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <h1 style={{ fontSize: "32px", margin: "0 0 10px 0", color: "#000" }}>
                {profile.name}
              </h1>
              <div style={{ display: "flex", justifyContent: "center", gap: "20px", fontSize: "14px", color: "#555", flexWrap: "wrap" }}>
                {profile.phone && <span>📞 {profile.phone}</span>}
                {profile.email && <span>✉️ {profile.email}</span>}
                {profile.linkedin && <span>🔗 {profile.linkedin}</span>}
                {profile.website && <span>🌐 {profile.website}</span>}
              </div>
              <hr style={{ margin: "20px 0", border: "none", borderTop: "2px solid #000" }} />
            </div>
          )}

          {/* Experience Section */}
          {experiences.length > 0 && (
            <ResumeSection title="EXPERIENCE">
              {experiences.map((exp, idx) => (
                <div
                  key={exp.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, exp, 'experience')}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, idx, 'experience')}
                  style={{
                    marginBottom: "20px",
                    cursor: "move",
                    padding: "10px",
                    background: draggedItem?.item.id === exp.id ? "#f0f0f0" : "transparent",
                    borderRadius: "4px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <strong style={{ fontSize: "15px", color: "#000" }}>{exp.company}</strong>
                    <span style={{ fontSize: "14px", color: "#666" }}>
                      {exp.start} {exp.end && `– ${exp.end}`}
                    </span>
                  </div>
                  {exp.role && (
                    <div style={{ fontSize: "14px", fontStyle: "italic", marginBottom: "8px", color: "#555" }}>
                      {exp.role}
                    </div>
                  )}
                  {exp.bullets.length > 0 && exp.bullets[0] && (
                    <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", color: "#000" }}>
                      {exp.bullets.filter(b => b).map((bullet, i) => (
                        <li key={i} style={{ marginBottom: "4px", color: "#000" }}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </ResumeSection>
          )}

          {/* Projects Section */}
          {projects.length > 0 && (
            <ResumeSection title="PROJECTS">
              {projects.map((proj, idx) => (
                <div
                  key={proj.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, proj, 'project')}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, idx, 'project')}
                  style={{
                    marginBottom: "20px",
                    cursor: "move",
                    padding: "10px",
                    background: draggedItem?.item.id === proj.id ? "#f0f0f0" : "transparent",
                    borderRadius: "4px"
                  }}
                >
                  <div style={{ marginBottom: "5px" }}>
                    <strong style={{ fontSize: "15px", color:"#000" }}>{proj.name}</strong>
                  {proj.tech && (
                    <span style={{ fontSize: "13px", color: "#666", marginLeft: "10px" }}>
                      | {proj.tech}
                    </span>
                  )}
                </div>
                {proj.bullets.length > 0 && proj.bullets[0] && (
                  <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", color:"#555" }}>
                    {proj.bullets.filter(b => b).map((bullet, i) => (
                      <li key={i} style={{ marginBottom: "4px" }}>{bullet}</li>
                    ))}
                  </ul>
                )}
                </div>
              ))}
            </ResumeSection>
          )}

          {/* Education Section */}
          {education.length > 0 && (
            <ResumeSection title="EDUCATION">
              {education.map((edu, idx) => (
                <div
                  key={edu.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, edu, 'education')}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, idx, 'education')}
                  style={{
                    marginBottom: "15px",
                    cursor: "move",
                    padding: "10px",
                    background: draggedItem?.item.id === edu.id ? "#f0f0f0" : "transparent",
                    borderRadius: "4px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <strong style={{ fontSize: "15px", color: "#000" }}>{edu.school}</strong>
                      <div style={{ fontSize: "14px", color: "#555" }}>{edu.degree}</div>
                      {edu.gpa && <div style={{ fontSize: "13px", color: "#666" }}>GPA: {edu.gpa}</div>}
                    </div>
                    <span style={{ fontSize: "14px", color: "#666" }}>{edu.period}</span>
                  </div>
                </div>
              ))}
            </ResumeSection>
          )}

          {/* Skills Section */}
          {skills.categories.length > 0 && (
            <ResumeSection title="SKILLS">
              {skills.categories.map((cat, idx) => (
                cat.items.length > 0 && (
                  <div key={idx} style={{ marginBottom: "8px", fontSize: "13px", color: "#000" }}>
                    <strong style={{ color: "#000" }}>{cat.name}:</strong> {cat.items.join(", ")}
                  </div>
                )
              ))}
            </ResumeSection>
          )}
        </div>
      </main>

      {/* Right Sidebar - AI Tools & Saved Versions */}
      <aside style={{
        width: rightCollapsed ? "60px" : "320px",
        background: "#2b2b2b",
        color: "#eaeaea",
        padding: "20px",
        overflowY: "auto",
        transition: "width 0.3s",
        borderLeft: "1px solid #3a3a3a"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <button 
            onClick={() => setRightCollapsed(!rightCollapsed)}
            style={{
              background: "none",
              border: "none",
              color: "#aaa",
              cursor: "pointer",
              fontSize: "20px"
            }}
          >
            {rightCollapsed ? "←" : "→"}
          </button>
          {!rightCollapsed && <h2 style={{ margin: 0, fontSize: "18px" }}>AI Tools</h2>}
        </div>

        {!rightCollapsed && (
          <>
            <div style={{
              background: "#3a3a3a",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "20px"
            }}>
              <h3 style={{ fontSize: "16px", marginTop: 0, marginBottom: "15px" }}>
                🤖 Optimize for Job
              </h3>
              <p style={{ fontSize: "13px", color: "#bbb", marginBottom: "15px" }}>
                Paste a job posting URL and AI will tailor your resume bullets to match the job requirements.
              </p>
              <input
                type="text"
                placeholder="https://example.com/job-posting"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "10px",
                  background: "#2b2b2b",
                  border: "1px solid #555",
                  color: "#fff",
                  borderRadius: "4px",
                  boxSizing: "border-box"
                }}
              />
              <button
                onClick={optimizeForJob}
                disabled={isOptimizing}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: isOptimizing ? "#555" : "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isOptimizing ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "600"
                }}
              >
                {isOptimizing ? "Optimizing..." : "Optimize Resume"}
              </button>
            </div>

            <div style={{
              background: "#3a3a3a",
              padding: "20px",
              borderRadius: "8px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <h3 style={{ fontSize: "16px", margin: 0 }}>
                  💾 Saved Versions
                </h3>
                <button 
                  onClick={saveCurrentVersion}
                  style={{
                    background: "#4CAF50",
                    border: "none",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px"
                  }}
                >
                  Save New
                </button>
              </div>

              {savedVersions.length === 0 ? (
                <div style={{ textAlign: "center", color: "#888", fontSize: "13px", padding: "10px" }}>
                  No saved versions yet.
                </div>
              ) : (
                savedVersions.map(version => (
                  <div 
                    key={version.id}
                    onClick={() => loadVersion(version)}
                    style={{
                      background: "#2b2b2b",
                      padding: "15px",
                      borderRadius: "6px",
                      marginBottom: "10px",
                      cursor: "pointer",
                      border: "1px solid #555",
                      position: "relative"
                    }}
                  >
                    <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "5px", color: "#fff" }}>
                      {version.name}
                    </div>
                    <div style={{ fontSize: "12px", color: "#999" }}>
                      {getTimeAgo(version.timestamp)}
                    </div>
                    <button 
                      onClick={(e) => deleteVersion(e, version.id)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "15px",
                        background: "none",
                        border: "none",
                        color: "#f44336",
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </aside>

      {/* Modals */}
      {showProfileEdit && (
        <ProfileModal
          profile={profile}
          onSave={(data) => {
            setProfile(data);
            setShowProfileEdit(false);
          }}
          onClose={() => setShowProfileEdit(false)}
        />
      )}

      {editingExperience && (
        <ExperienceModal
          experience={editingExperience}
          onSave={(data) => {
            const exists = experiences.find(exp => exp.id === data.id);
            if (exists) {
              setExperiences(experiences.map(exp => exp.id === data.id ? data : exp));
            } else {
              setExperiences([...experiences, data]);
            }
            setEditingExperience(null);
          }}
          onClose={() => setEditingExperience(null)}
        />
      )}

      {editingProject && (
        <ProjectModal
          project={editingProject}
          onSave={(data) => {
            const exists = projects.find(proj => proj.id === data.id);
            if (exists) {
              setProjects(projects.map(proj => proj.id === data.id ? data : proj));
            } else {
              setProjects([...projects, data]);
            }
            setEditingProject(null);
          }}
          onClose={() => setEditingProject(null)}
        />
      )}

      {editingEducation && (
        <EducationModal
          education={editingEducation}
          onSave={(data) => {
            const exists = education.find(edu => edu.id === data.id);
            if (exists) {
              setEducation(education.map(edu => edu.id === data.id ? data : edu));
            } else {
              setEducation([...education, data]);
            }
            setEditingEducation(null);
          }}
          onClose={() => setEditingEducation(null)}
        />
      )}

      {editingSkills && (
        <SkillsModal
          skills={skills}
          onSave={(data) => {
            setSkills(data);
            setEditingSkills(null);
          }}
          onClose={() => setEditingSkills(null)}
        />
      )}
    </div>
  );
}

// Helper Components
function Section({ title, children, onAdd }) {
  return (
    <div style={{ marginBottom: "25px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#e0e0e0" }}>
          {title}
        </h3>
        {onAdd && (
          <button
            onClick={onAdd}
            style={{
              background: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "4px 10px",
              cursor: "pointer",
              fontSize: "18px",
              lineHeight: "1"
            }}
          >
            +
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

// Modal Components
function ProfileModal({ profile, onSave, onClose }) {
  const [formData, setFormData] = useState(profile);

  return (
    <ModalBackdrop onClose={onClose}>
      <div style={{
        background: "#2b2b2b",
        padding: "30px",
        borderRadius: "12px",
        width: "500px",
        maxHeight: "80vh",
        overflowY: "auto"
      }}>
        <h3 style={{ margin: "0 0 20px 0", color: "#fff" }}>Edit Profile</h3>
        
        <Input
          label="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="John Doe"
        />
        <Input
          label="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          placeholder="john@example.com"
        />
        <Input
          label="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          placeholder="(555) 123-4567"
        />
        <Input
          label="LinkedIn"
          value={formData.linkedin}
          onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
          placeholder="linkedin.com/in/johndoe"
        />
        <Input
          label="Website"
          value={formData.website}
          onChange={(e) => setFormData({...formData, website: e.target.value})}
          placeholder="johndoe.com"
        />

        <ModalActions onCancel={onClose} onSave={() => onSave(formData)} />
      </div>
    </ModalBackdrop>
  );
}

function ExperienceModal({ experience, onSave, onClose }) {
  const [formData, setFormData] = useState(experience);

  const updateBullet = (index, value) => {
    const newBullets = [...formData.bullets];
    newBullets[index] = value;
    setFormData({...formData, bullets: newBullets});
  };

  const addBullet = () => {
    setFormData({...formData, bullets: [...formData.bullets, ""]});
  };

  const removeBullet = (index) => {
    setFormData({...formData, bullets: formData.bullets.filter((_, i) => i !== index)});
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div style={{
        background: "#2b2b2b",
        padding: "30px",
        borderRadius: "12px",
        width: "600px",
        maxHeight: "80vh",
        overflowY: "auto"
      }}>
        <h3 style={{ margin: "0 0 20px 0", color: "#fff" }}>
          {experience.company ? "Edit Experience" : "Add Experience"}
        </h3>
        
        <Input
          label="Company"
          value={formData.company}
          onChange={(e) => setFormData({...formData, company: e.target.value})}
          placeholder="Google"
        />
        <Input
          label="Role"
          value={formData.role}
          onChange={(e) => setFormData({...formData, role: e.target.value})}
          placeholder="Software Engineer"
        />
        <div style={{ display: "flex", gap: "15px" }}>
          <Input
            label="Start Date"
            value={formData.start}
            onChange={(e) => setFormData({...formData, start: e.target.value})}
            placeholder="Jan 2022"
          />
          <Input
            label="End Date"
            value={formData.end}
            onChange={(e) => setFormData({...formData, end: e.target.value})}
            placeholder="Present"
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "8px", color: "#ccc", fontSize: "14px" }}>
            Achievements
          </label>
          {formData.bullets.map((bullet, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <input
                value={bullet}
                onChange={(e) => updateBullet(i, e.target.value)}
                placeholder={`Achievement ${i + 1}`}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#1f1f1f",
                  border: "1px solid #444",
                  color: "#fff",
                  borderRadius: "6px",
                  fontSize: "14px"
                }}
              />
              <button
                onClick={() => removeBullet(i)}
                style={{
                  background: "#f44336",
                  color: "white",
                  border: "none",
                  padding: "0 15px",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                −
              </button>
            </div>
          ))}
          <button
            onClick={addBullet}
            style={{
              background: "#4CAF50",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            + Add Achievement
          </button>
        </div>

        <ModalActions onCancel={onClose} onSave={() => onSave(formData)} />
      </div>
    </ModalBackdrop>
  );
}

function ProjectModal({ project, onSave, onClose }) {
  const [formData, setFormData] = useState(project);

  const updateBullet = (index, value) => {
    const newBullets = [...formData.bullets];
    newBullets[index] = value;
    setFormData({...formData, bullets: newBullets});
  };

  const addBullet = () => {
    setFormData({...formData, bullets: [...formData.bullets, ""]});
  };

  const removeBullet = (index) => {
    setFormData({...formData, bullets: formData.bullets.filter((_, i) => i !== index)});
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div style={{
        background: "#2b2b2b",
        padding: "30px",
        borderRadius: "12px",
        width: "600px",
        maxHeight: "80vh",
        overflowY: "auto"
      }}>
        <h3 style={{ margin: "0 0 20px 0", color: "#fff" }}>
          {project.name ? "Edit Project" : "Add Project"}
        </h3>
        
        <Input
          label="Project Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="AI Resume Builder"
        />
        <Input
          label="Technologies"
          value={formData.tech}
          onChange={(e) => setFormData({...formData, tech: e.target.value})}
          placeholder="React, Node.js, OpenAI"
        />

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "8px", color: "#ccc", fontSize: "14px" }}>
            Project Details
          </label>
          {formData.bullets.map((bullet, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <input
                value={bullet}
                onChange={(e) => updateBullet(i, e.target.value)}
                placeholder={`Detail ${i + 1}`}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#1f1f1f",
                  border: "1px solid #444",
                  color: "#fff",
                  borderRadius: "6px",
                  fontSize: "14px"
                }}
              />
              <button
                onClick={() => removeBullet(i)}
                style={{
                  background: "#f44336",
                  color: "white",
                  border: "none",
                  padding: "0 15px",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                −
              </button>
            </div>
          ))}
          <button
            onClick={addBullet}
            style={{
              background: "#4CAF50",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            + Add Detail
          </button>
        </div>

        <ModalActions onCancel={onClose} onSave={() => onSave(formData)} />
      </div>
    </ModalBackdrop>
  );
}

function EducationModal({ education, onSave, onClose }) {
  const [formData, setFormData] = useState(education);

  return (
    <ModalBackdrop onClose={onClose}>
      <div style={{
        background: "#2b2b2b",
        padding: "30px",
        borderRadius: "12px",
        width: "500px",
        maxHeight: "80vh",
        overflowY: "auto"
      }}>
        <h3 style={{ margin: "0 0 20px 0", color: "#fff" }}>
          {education.school ? "Edit Education" : "Add Education"}
        </h3>
        
        <Input
          label="School"
          value={formData.school}
          onChange={(e) => setFormData({...formData, school: e.target.value})}
          placeholder="University of Alberta"
        />
        <Input
          label="Degree"
          value={formData.degree}
          onChange={(e) => setFormData({...formData, degree: e.target.value})}
          placeholder="B.Sc. Computer Science"
        />
        <Input
          label="Period"
          value={formData.period}
          onChange={(e) => setFormData({...formData, period: e.target.value})}
          placeholder="2018 - 2022"
        />
        <Input
          label="GPA (Optional)"
          value={formData.gpa}
          onChange={(e) => setFormData({...formData, gpa: e.target.value})}
          placeholder="3.8/4.0"
        />

        <ModalActions onCancel={onClose} onSave={() => onSave(formData)} />
      </div>
    </ModalBackdrop>
  );
}

function SkillsModal({ skills, onSave, onClose }) {
  const [formData, setFormData] = useState(skills);

  const updateCategory = (index, field, value) => {
    const newCategories = [...formData.categories];
    newCategories[index] = {...newCategories[index], [field]: value};
    setFormData({...formData, categories: newCategories});
  };

  const addCategory = () => {
    setFormData({
      ...formData,
      categories: [...formData.categories, { name: "", items: [] }]
    });
  };

  const removeCategory = (index) => {
    setFormData({
      ...formData,
      categories: formData.categories.filter((_, i) => i !== index)
    });
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div style={{
        background: "#2b2b2b",
        padding: "30px",
        borderRadius: "12px",
        width: "600px",
        maxHeight: "80vh",
        overflowY: "auto"
      }}>
        <h3 style={{ margin: "0 0 20px 0", color: "#fff" }}>Edit Skills</h3>
        
        {formData.categories.map((cat, i) => (
          <div key={i} style={{ marginBottom: "20px", padding: "15px", background: "#1f1f1f", borderRadius: "8px" }}>
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <input
                value={cat.name}
                onChange={(e) => updateCategory(i, 'name', e.target.value)}
                placeholder="Category (e.g., Languages)"
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#2b2b2b",
                  border: "1px solid #444",
                  color: "#fff",
                  borderRadius: "6px",
                  fontSize: "14px"
                }}
              />
              <button
                onClick={() => removeCategory(i)}
                style={{
                  background: "#f44336",
                  color: "white",
                  border: "none",
                  padding: "0 15px",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                🗑️
              </button>
            </div>
            <input
              value={cat.items.join(", ")}
              onChange={(e) => updateCategory(i, 'items', e.target.value.split(",").map(s => s.trim()))}
              placeholder="Skills (comma-separated)"
              style={{
                width: "100%",
                padding: "10px",
                background: "#2b2b2b",
                border: "1px solid #444",
                color: "#fff",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
            />
          </div>
        ))}

        <button
          onClick={addCategory}
          style={{
            background: "#4CAF50",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            marginBottom: "20px",
            width: "100%"
          }}
        >
          + Add Category
        </button>

        <ModalActions onCancel={onClose} onSave={() => onSave(formData)} />
      </div>
    </ModalBackdrop>
  );
}

// Helper Components
function ModalBackdrop({ onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000
      }}
    >
      <div onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: "15px" }}>
      <label style={{ display: "block", marginBottom: "8px", color: "#ccc", fontSize: "14px" }}>
        {label}
      </label>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "10px",
          background: "#1f1f1f",
          border: "1px solid #444",
          color: "#fff",
          borderRadius: "6px",
          fontSize: "14px",
          boxSizing: "border-box"
        }}
      />
    </div>
  );
}

function ModalActions({ onCancel, onSave }) {
  return (
    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
      <button
        onClick={onCancel}
        style={{
          padding: "10px 20px",
          background: "#444",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px"
        }}
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        style={{
          padding: "10px 20px",
          background: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "500"
        }}
      >
        Save
      </button>
    </div>
  );
}

function DraggableItem({ item, type, onDragStart, onEdit, onDelete, title, subtitle }) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      style={{
        background: "#3a3a3a",
        padding: "12px",
        borderRadius: "6px",
        marginBottom: "8px",
        cursor: "move",
        border: "1px solid #555",
        transition: "all 0.2s"
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = "#454545"}
      onMouseLeave={(e) => e.currentTarget.style.background = "#3a3a3a"}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ color: "#888", fontSize: "12px" }}>⋮⋮</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "3px" }}>
            {title}
          </div>
          <div style={{ fontSize: "12px", color: "#aaa" }}>
            {subtitle}
          </div>
        </div>
        <button
          onClick={onEdit}
          style={{
            background: "none",
            border: "none",
            color: "#4CAF50",
            cursor: "pointer",
            fontSize: "16px",
            padding: "4px"
          }}
          title="Edit"
        >
          ✏️
        </button>
        <button
          onClick={onDelete}
          style={{
            background: "none",
            border: "none",
            color: "#f44336",
            cursor: "pointer",
            fontSize: "16px",
            padding: "4px"
          }}
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

function ResumeSection({ title, children }) {
  return (
    <div style={{ marginBottom: "25px" }}>
      <h2 style={{
        fontSize: "16px",
        fontWeight: "700",
        letterSpacing: "0.5px",
        borderBottom: "2px solid #000",
        paddingBottom: "4px",
        marginBottom: "15px",
        color: "#000"
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
}