import { useState, useRef, useEffect } from "react";
import PolygonBackground from "../components/PolygonBackground";
import "./resume-editor.css";

// Enhanced Resume Editor Component with AI Features
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

  const [savedInfo, setSavedInfo] = useState(() => {
    const saved = localStorage.getItem("resume_saved_info");
    return saved ? JSON.parse(saved) : {
      experiences: [],
      projects: [],
      education: []
    };
  });

  const [savedSkillSets, setSavedSkillSets] = useState(() => {
    const saved = localStorage.getItem("resume_saved_skillsets");
    return saved ? JSON.parse(saved) : [];
  });

  const [savedVersions, setSavedVersions] = useState(() => {
    const saved = localStorage.getItem("resume_saved_versions");
    return saved ? JSON.parse(saved) : [];
  });

  // --- Upload & AI State ---
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);
  
  const [jobUrl, setJobUrl] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeError, setOptimizeError] = useState(null);
  const [lastJobDetails, setLastJobDetails] = useState(null);

  // --- UI State ---
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [editingEducation, setEditingEducation] = useState(null);
  const [editingSkills, setEditingSkills] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  
  // Theme state - synced with localStorage
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('jobtion-theme');
    return saved !== 'light';
  });

  useEffect(() => {
    localStorage.setItem('jobtion-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // --- Upload Resume Handler ---
  const handleUploadResume = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Please upload a PDF file');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to parse resume');
      }

      const data = await response.json();

      if (data.profile) setProfile(data.profile);
      if (data.experiences?.length > 0) setExperiences(data.experiences);
      if (data.projects?.length > 0) setProjects(data.projects);
      if (data.education?.length > 0) setEducation(data.education);
      if (data.skills?.categories?.length > 0) setSkills(data.skills);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // --- Optimize Resume Handler ---
  const optimizeForJob = async () => {
    if (!jobUrl.trim()) {
      setOptimizeError("Please enter a job posting URL");
      return;
    }

    if (experiences.length === 0 && projects.length === 0) {
      setOptimizeError("Please add some content to your resume first");
      return;
    }

    setIsOptimizing(true);
    setOptimizeError(null);

    try {
      const response = await fetch('/api/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: { profile, experiences, projects, education, skills },
          jobUrl: jobUrl.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to optimize resume');
      }

      const data = await response.json();

      if (data.optimized.experiences) setExperiences(data.optimized.experiences);
      if (data.optimized.projects) setProjects(data.optimized.projects);
      if (data.optimized.skills) setSkills(data.optimized.skills);

      setLastJobDetails(data.job);
    } catch (error) {
      console.error('Optimize error:', error);
      setOptimizeError(error.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  // --- Version Management ---
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

  // --- Saved Info Management ---
  const saveBlockToLibrary = (block, type) => {
    const newSavedInfo = { ...savedInfo };
    const blockWithId = { ...block, savedId: `saved-${Date.now()}` };
    
    if (type === 'experience') {
      newSavedInfo.experiences = [...newSavedInfo.experiences, blockWithId];
    } else if (type === 'project') {
      newSavedInfo.projects = [...newSavedInfo.projects, blockWithId];
    } else if (type === 'education') {
      newSavedInfo.education = [...newSavedInfo.education, blockWithId];
    }
    
    setSavedInfo(newSavedInfo);
    localStorage.setItem("resume_saved_info", JSON.stringify(newSavedInfo));
  };

  const loadBlockFromLibrary = (block, type) => {
    const newBlock = { ...block, id: `${type}-${Date.now()}` };
    delete newBlock.savedId;
    
    if (type === 'experience') {
      setExperiences([...experiences, newBlock]);
    } else if (type === 'project') {
      setProjects([...projects, newBlock]);
    } else if (type === 'education') {
      setEducation([...education, newBlock]);
    }
  };

  const deleteSavedBlock = (savedId, type) => {
    const newSavedInfo = { ...savedInfo };
    if (type === 'experience') {
      newSavedInfo.experiences = newSavedInfo.experiences.filter(b => b.savedId !== savedId);
    } else if (type === 'project') {
      newSavedInfo.projects = newSavedInfo.projects.filter(b => b.savedId !== savedId);
    } else if (type === 'education') {
      newSavedInfo.education = newSavedInfo.education.filter(b => b.savedId !== savedId);
    }
    setSavedInfo(newSavedInfo);
    localStorage.setItem("resume_saved_info", JSON.stringify(newSavedInfo));
  };

  const loadSkillSetFromLibrary = (skillSet) => {
    setSkills({ ...skillSet, id: 'skills-1' });
  };

  const deleteSavedSkillSet = (savedId) => {
    const updated = savedSkillSets.filter(s => s.savedId !== savedId);
    setSavedSkillSets(updated);
    localStorage.setItem("resume_saved_skillsets", JSON.stringify(updated));
  };

  // --- Drag and Drop ---
  const handleDragStart = (e, item, type) => {
    setDraggedItem({ item, type });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
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

  // --- CRUD Operations ---
  const addNewExperience = () => {
    setEditingExperience({
      id: `exp-${Date.now()}`,
      company: "",
      role: "",
      start: "",
      end: "",
      bullets: [""]
    });
  };

  const addNewProject = () => {
    setEditingProject({
      id: `proj-${Date.now()}`,
      name: "",
      tech: "",
      bullets: [""]
    });
  };

  const addNewEducation = () => {
    setEditingEducation({
      id: `edu-${Date.now()}`,
      school: "",
      degree: "",
      period: "",
      gpa: ""
    });
  };

  const deleteItem = (id, type) => {
    if (type === 'experience') setExperiences(experiences.filter(exp => exp.id !== id));
    else if (type === 'project') setProjects(projects.filter(proj => proj.id !== id));
    else if (type === 'education') setEducation(education.filter(edu => edu.id !== id));
  };

  // --- Export PDF ---
  const exportToPDF = async () => {
    const resumeElement = document.getElementById('resume-canvas');
    if (!resumeElement) {
      alert('Resume not found');
      return;
    }

    const defaultName = profile.name ? `${profile.name}_Resume` : 'Resume';
    const userFileName = prompt('Enter a name for your PDF:', defaultName);
    
    if (userFileName === null) return;
    const fileName = userFileName.trim() || defaultName;

    try {
      if (!window.html2pdf) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        document.head.appendChild(script);
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      const originalStyles = {
        width: resumeElement.style.width,
        minWidth: resumeElement.style.minWidth,
        maxWidth: resumeElement.style.maxWidth,
        padding: resumeElement.style.padding,
        boxShadow: resumeElement.style.boxShadow
      };

      resumeElement.style.width = '210mm';
      resumeElement.style.minWidth = '210mm';
      resumeElement.style.maxWidth = '210mm';
      resumeElement.style.padding = '10mm 12mm';
      resumeElement.style.boxShadow = 'none';
      
      const opt = {
        margin: 0,
        filename: `${fileName}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
          scale: 2,
          useCORS: true
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await window.html2pdf().set(opt).from(resumeElement).save();
      
      resumeElement.style.width = originalStyles.width;
      resumeElement.style.minWidth = originalStyles.minWidth;
      resumeElement.style.maxWidth = originalStyles.maxWidth;
      resumeElement.style.padding = originalStyles.padding;
      resumeElement.style.boxShadow = originalStyles.boxShadow;

    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  return (
    <div className={`editor-wrapper ${isDark ? 'dark' : 'light'}`}>
      {/* Animated Background */}
      <PolygonBackground isDark={isDark} />

      {/* Theme Toggle */}
      <button 
        className="theme-toggle" 
        onClick={() => setIsDark(!isDark)}
        style={{ right: rightCollapsed ? '80px' : '300px' }}
      >
        <div className={`toggle-slider ${isDark ? 'dark' : 'light'}`}>
          {isDark ? '🌙' : '☀️'}
        </div>
      </button>

      {/* Left Sidebar */}
      <aside className={`left-sidebar ${leftCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!leftCollapsed && <h2>Sections</h2>}
          <button className="collapse-btn" onClick={() => setLeftCollapsed(!leftCollapsed)}>
            {leftCollapsed ? "→" : "←"}
          </button>
        </div>

        {!leftCollapsed && (
          <div className="sidebar-content">
            {/* Upload Resume Button */}
            <div className="sidebar-section">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleUploadResume}
                style={{ display: 'none' }}
                id="resume-upload"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="upload-btn"
              >
                {isUploading ? (
                  <>
                    <span className="spinner" />
                    Parsing...
                  </>
                ) : (
                  <>📄 Upload Resume (PDF)</>
                )}
              </button>
              {uploadError && (
                <div className="error-message">{uploadError}</div>
              )}
            </div>

            {/* Profile Section */}
            <div className="sidebar-section">
              <h3>Profile</h3>
              <button
                onClick={() => setShowProfileEdit(true)}
                className="action-btn primary"
              >
                {profile.name ? "Edit Profile" : "Add Profile"}
              </button>
            </div>

            {/* Experience Section */}
            <div className="sidebar-section">
              <div className="section-header">
                <h3>Experience</h3>
                <button onClick={addNewExperience} className="add-version-btn">+</button>
              </div>
              {experiences.map((exp) => (
                <DraggableItem
                  key={exp.id}
                  item={exp}
                  type="experience"
                  onDragStart={(e) => handleDragStart(e, exp, 'experience')}
                  onEdit={() => setEditingExperience(exp)}
                  onDelete={() => deleteItem(exp.id, 'experience')}
                  onSave={() => saveBlockToLibrary(exp, 'experience')}
                  title={exp.company || "Untitled"}
                  subtitle={exp.role || "No role"}
                />
              ))}
            </div>

            {/* Projects Section */}
            <div className="sidebar-section">
              <div className="section-header">
                <h3>Projects</h3>
                <button onClick={addNewProject} className="add-version-btn">+</button>
              </div>
              {projects.map((proj) => (
                <DraggableItem
                  key={proj.id}
                  item={proj}
                  type="project"
                  onDragStart={(e) => handleDragStart(e, proj, 'project')}
                  onEdit={() => setEditingProject(proj)}
                  onDelete={() => deleteItem(proj.id, 'project')}
                  onSave={() => saveBlockToLibrary(proj, 'project')}
                  title={proj.name || "Untitled"}
                  subtitle={proj.tech || "No tech"}
                />
              ))}
            </div>

            {/* Education Section */}
            <div className="sidebar-section">
              <div className="section-header">
                <h3>Education</h3>
                <button onClick={addNewEducation} className="add-version-btn">+</button>
              </div>
              {education.map((edu) => (
                <DraggableItem
                  key={edu.id}
                  item={edu}
                  type="education"
                  onDragStart={(e) => handleDragStart(e, edu, 'education')}
                  onEdit={() => setEditingEducation(edu)}
                  onDelete={() => deleteItem(edu.id, 'education')}
                  onSave={() => saveBlockToLibrary(edu, 'education')}
                  title={edu.school || "Untitled"}
                  subtitle={edu.degree || "No degree"}
                />
              ))}
            </div>

            {/* Skills Section */}
            <div className="sidebar-section">
              <h3>Skills</h3>
              <button
                onClick={() => setEditingSkills(skills)}
                className="action-btn primary"
              >
                {skills.categories.length > 0 ? "Edit Skills" : "Add Skills"}
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Canvas */}
      <main className="editor-main">
        <div id="resume-canvas" className="resume-canvas">
          {/* Profile Header */}
          {profile.name && (
            <div className="resume-profile">
              <h1 className="profile-name">{profile.name}</h1>
              <div className="profile-meta">
                {profile.phone && <span>📞 {profile.phone}</span>}
                {profile.email && <span>✉️ {profile.email}</span>}
                {profile.linkedin && <span>🔗 {profile.linkedin}</span>}
                {profile.website && <span>🌐 {profile.website}</span>}
              </div>
              <hr />
            </div>
          )}

          {/* Experience Section */}
          {experiences.length > 0 && (
            <div className="resume-section">
              <h2 className="resume-section-title">EXPERIENCE</h2>
              {experiences.map((exp, idx) => (
                <div
                  key={exp.id}
                  className="resume-item"
                  draggable
                  onDragStart={(e) => handleDragStart(e, exp, 'experience')}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, idx, 'experience')}
                >
                  <div className="resume-item-header">
                    <strong>{exp.company}</strong>
                    <span>{exp.start} {exp.end && `– ${exp.end}`}</span>
                  </div>
                  {exp.role && <div className="resume-item-role">{exp.role}</div>}
                  {exp.bullets?.length > 0 && (
                    <ul>
                      {exp.bullets.filter(b => b).map((bullet, i) => (
                        <li key={i}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Projects Section */}
          {projects.length > 0 && (
            <div className="resume-section">
              <h2 className="resume-section-title">PROJECTS</h2>
              {projects.map((proj, idx) => (
                <div
                  key={proj.id}
                  className="resume-item"
                  draggable
                  onDragStart={(e) => handleDragStart(e, proj, 'project')}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, idx, 'project')}
                >
                  <div className="resume-item-header">
                    <strong>{proj.name}</strong>
                    {proj.tech && <span style={{ color: "#666" }}>{proj.tech}</span>}
                  </div>
                  {proj.bullets?.length > 0 && (
                    <ul>
                      {proj.bullets.filter(b => b).map((bullet, i) => (
                        <li key={i}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education Section */}
          {education.length > 0 && (
            <div className="resume-section">
              <h2 className="resume-section-title">EDUCATION</h2>
              {education.map((edu, idx) => (
                <div
                  key={edu.id}
                  className="resume-item"
                  draggable
                  onDragStart={(e) => handleDragStart(e, edu, 'education')}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, idx, 'education')}
                >
                  <div className="resume-item-header">
                    <div>
                      <strong>{edu.school}</strong>
                      <div style={{ fontSize: "13px", color: "#555" }}>{edu.degree}</div>
                      {edu.gpa && <div style={{ fontSize: "12px", color: "#666" }}>GPA: {edu.gpa}</div>}
                    </div>
                    <span>{edu.period}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Skills Section */}
          {skills.categories.length > 0 && (
            <div className="resume-section">
              <h2 className="resume-section-title">SKILLS</h2>
              {skills.categories.map((cat, idx) => (
                cat.items.length > 0 && (
                  <div key={idx} style={{ marginBottom: "8px", fontSize: "13px" }}>
                    <strong>{cat.name}:</strong> {cat.items.join(", ")}
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className={`right-sidebar ${rightCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <button className="collapse-btn" onClick={() => setRightCollapsed(!rightCollapsed)}>
            {rightCollapsed ? "←" : "→"}
          </button>
          {!rightCollapsed && <h2>AI Tools</h2>}
        </div>

        {!rightCollapsed && (
          <div className="sidebar-content">
            {/* Export PDF Button */}
            <button onClick={exportToPDF} className="action-btn export">
              📄 Export to PDF
            </button>

            {/* AI Optimize Section */}
            <div className="sidebar-section ai-section">
              <h3>🤖 Optimize for Job</h3>
              <p className="section-description">
                Paste a job posting URL and AI will tailor your resume to match.
              </p>
              <input
                type="text"
                placeholder="https://example.com/job-posting"
                value={jobUrl}
                onChange={(e) => {
                  setJobUrl(e.target.value);
                  setOptimizeError(null);
                }}
                className="input-field"
              />
              <button
                onClick={optimizeForJob}
                disabled={isOptimizing}
                className="upload-btn"
                style={{ marginTop: '10px' }}
              >
                {isOptimizing ? (
                  <>
                    <span className="spinner" />
                    Optimizing...
                  </>
                ) : (
                  "✨ Optimize Resume"
                )}
              </button>
              
              {optimizeError && (
                <div className="error-message">{optimizeError}</div>
              )}

              {lastJobDetails && (
                <div className="success-card">
                  <div className="success-label">✓ Optimized for:</div>
                  <div className="success-title">{lastJobDetails.title}</div>
                  <div className="success-subtitle">{lastJobDetails.company}</div>
                </div>
              )}
            </div>

            {/* Saved Versions */}
            <div className="sidebar-section">
              <div className="version-header">
                <h3>💾 Saved Versions</h3>
                <button className="add-version-btn" onClick={saveCurrentVersion}>+</button>
              </div>

              {savedVersions.length === 0 ? (
                <div className="empty-state">No saved versions yet.</div>
              ) : (
                savedVersions.map((version) => (
                  <div key={version.id} className="version-card" onClick={() => loadVersion(version)}>
                    <span className="version-name">{version.name}</span>
                    <span className="version-time">{getTimeAgo(version.timestamp)}</span>
                    <button className="delete-version-btn" onClick={(e) => deleteVersion(e, version.id)}>✕</button>
                  </div>
                ))
              )}
            </div>

            {/* Saved Library */}
            <div className="sidebar-section">
              <h3>📚 Saved Library</h3>
              
              {savedInfo.experiences.length > 0 && (
                <div className="library-section">
                  <h4>Experience</h4>
                  {savedInfo.experiences.map((block) => (
                    <div key={block.savedId} className="version-card" onClick={() => loadBlockFromLibrary(block, 'experience')}>
                      <span className="version-name">{block.company || "Untitled"}</span>
                      <span className="version-time">{block.role || "No role"}</span>
                      <button className="delete-version-btn" onClick={(e) => { e.stopPropagation(); deleteSavedBlock(block.savedId, 'experience'); }}>🗑️</button>
                    </div>
                  ))}
                </div>
              )}

              {savedInfo.projects.length > 0 && (
                <div className="library-section">
                  <h4>Projects</h4>
                  {savedInfo.projects.map((block) => (
                    <div key={block.savedId} className="version-card" onClick={() => loadBlockFromLibrary(block, 'project')}>
                      <span className="version-name">{block.name || "Untitled"}</span>
                      <span className="version-time">{block.tech || "No tech"}</span>
                      <button className="delete-version-btn" onClick={(e) => { e.stopPropagation(); deleteSavedBlock(block.savedId, 'project'); }}>🗑️</button>
                    </div>
                  ))}
                </div>
              )}

              {savedInfo.education.length > 0 && (
                <div className="library-section">
                  <h4>Education</h4>
                  {savedInfo.education.map((block) => (
                    <div key={block.savedId} className="version-card" onClick={() => loadBlockFromLibrary(block, 'education')}>
                      <span className="version-name">{block.school || "Untitled"}</span>
                      <span className="version-time">{block.degree || "No degree"}</span>
                      <button className="delete-version-btn" onClick={(e) => { e.stopPropagation(); deleteSavedBlock(block.savedId, 'education'); }}>🗑️</button>
                    </div>
                  ))}
                </div>
              )}

              {savedSkillSets.length > 0 && (
                <div className="library-section">
                  <h4>Skills</h4>
                  {savedSkillSets.map((skillSet) => (
                    <div key={skillSet.savedId} className="version-card" onClick={() => loadSkillSetFromLibrary(skillSet)}>
                      <span className="version-name">{skillSet.name}</span>
                      <span className="version-time">{skillSet.categories.length} categories</span>
                      <button className="delete-version-btn" onClick={(e) => { e.stopPropagation(); deleteSavedSkillSet(skillSet.savedId); }}>🗑️</button>
                    </div>
                  ))}
                </div>
              )}

              {savedInfo.experiences.length === 0 && 
               savedInfo.projects.length === 0 && 
               savedInfo.education.length === 0 && 
               savedSkillSets.length === 0 && (
                <div className="empty-state">No saved blocks yet.</div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Modals */}
      {showProfileEdit && (
        <ProfileModal
          profile={profile}
          onSave={(data) => { setProfile(data); setShowProfileEdit(false); }}
          onClose={() => setShowProfileEdit(false)}
        />
      )}

      {editingExperience && (
        <ExperienceModal
          experience={editingExperience}
          onSave={(data) => {
            const exists = experiences.find(exp => exp.id === data.id);
            if (exists) setExperiences(experiences.map(exp => exp.id === data.id ? data : exp));
            else setExperiences([...experiences, data]);
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
            if (exists) setProjects(projects.map(proj => proj.id === data.id ? data : proj));
            else setProjects([...projects, data]);
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
            if (exists) setEducation(education.map(edu => edu.id === data.id ? data : edu));
            else setEducation([...education, data]);
            setEditingEducation(null);
          }}
          onClose={() => setEditingEducation(null)}
        />
      )}

      {editingSkills && (
        <SkillsModal
          skills={skills}
          savedSkillSets={savedSkillSets}
          setSavedSkillSets={setSavedSkillSets}
          onSave={(data) => { setSkills(data); setEditingSkills(null); }}
          onClose={() => setEditingSkills(null)}
        />
      )}
    </div>
  );
}

// ============================================
// Helper Components
// ============================================

function DraggableItem({ item, type, onDragStart, onEdit, onDelete, onSave, title, subtitle }) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="draggable-item"
    >
      <div className="drag-handle">⋮⋮</div>
      <div className="item-text">
        <span className="item-title">{title}</span>
        <span className="item-subtitle">{subtitle}</span>
      </div>
      <div className="item-actions">
        <button onClick={onSave} className="save-btn" title="Save to Library">💾</button>
        <button onClick={onEdit} className="edit-btn" title="Edit">✏️</button>
        <button onClick={onDelete} className="delete-btn" title="Delete">🗑️</button>
      </div>
    </div>
  );
}

// ============================================
// Modal Components
// ============================================

function ModalBackdrop({ onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }) {
  return (
    <div className="input-group">
      <label>{label}</label>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="modal-input"
      />
    </div>
  );
}

function ModalActions({ onCancel, onSave }) {
  return (
    <div className="modal-actions">
      <button onClick={onCancel} className="btn-cancel">Cancel</button>
      <button onClick={onSave} className="btn-save">Save</button>
    </div>
  );
}

function ProfileModal({ profile, onSave, onClose }) {
  const [formData, setFormData] = useState(profile);
  return (
    <ModalBackdrop onClose={onClose}>
      <div className="modal" style={{ width: "400px" }}>
        <h3>Edit Profile</h3>
        <Input label="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
        <Input label="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
        <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="(555) 123-4567" />
        <Input label="LinkedIn" value={formData.linkedin} onChange={(e) => setFormData({...formData, linkedin: e.target.value})} placeholder="linkedin.com/in/johndoe" />
        <Input label="Website" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} placeholder="johndoe.com" />
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

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="modal" style={{ width: "500px" }}>
        <h3>{experience.company ? "Edit Experience" : "Add Experience"}</h3>
        <Input label="Company" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} placeholder="Google" />
        <Input label="Role" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} placeholder="Software Engineer" />
        <div style={{ display: "flex", gap: "10px" }}>
          <Input label="Start Date" value={formData.start} onChange={(e) => setFormData({...formData, start: e.target.value})} placeholder="Jan 2022" />
          <Input label="End Date" value={formData.end} onChange={(e) => setFormData({...formData, end: e.target.value})} placeholder="Present" />
        </div>
        <div className="bullets-section">
          <label>Achievements</label>
          {formData.bullets.map((bullet, i) => (
            <div key={i} className="bullet-row">
              <input 
                value={bullet} 
                onChange={(e) => updateBullet(i, e.target.value)} 
                placeholder={`Achievement ${i + 1}`}
                className="modal-input"
              />
              <button 
                onClick={() => setFormData({...formData, bullets: formData.bullets.filter((_, idx) => idx !== i)})}
                className="btn-remove"
              >−</button>
            </div>
          ))}
          <button 
            onClick={() => setFormData({...formData, bullets: [...formData.bullets, ""]})}
            className="btn-add"
          >+ Add Achievement</button>
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

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="modal" style={{ width: "500px" }}>
        <h3>{project.name ? "Edit Project" : "Add Project"}</h3>
        <Input label="Project Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="My Awesome Project" />
        <Input label="Technologies" value={formData.tech} onChange={(e) => setFormData({...formData, tech: e.target.value})} placeholder="React, Node.js, PostgreSQL" />
        <div className="bullets-section">
          <label>Key Points</label>
          {formData.bullets.map((bullet, i) => (
            <div key={i} className="bullet-row">
              <input 
                value={bullet} 
                onChange={(e) => updateBullet(i, e.target.value)} 
                placeholder={`Point ${i + 1}`}
                className="modal-input"
              />
              <button 
                onClick={() => setFormData({...formData, bullets: formData.bullets.filter((_, idx) => idx !== i)})}
                className="btn-remove"
              >−</button>
            </div>
          ))}
          <button 
            onClick={() => setFormData({...formData, bullets: [...formData.bullets, ""]})}
            className="btn-add"
          >+ Add Point</button>
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
      <div className="modal" style={{ width: "450px" }}>
        <h3>{education.school ? "Edit Education" : "Add Education"}</h3>
        <Input label="School" value={formData.school} onChange={(e) => setFormData({...formData, school: e.target.value})} placeholder="MIT" />
        <Input label="Degree" value={formData.degree} onChange={(e) => setFormData({...formData, degree: e.target.value})} placeholder="B.S. Computer Science" />
        <Input label="Time Period" value={formData.period} onChange={(e) => setFormData({...formData, period: e.target.value})} placeholder="2018 - 2022" />
        <Input label="GPA (optional)" value={formData.gpa} onChange={(e) => setFormData({...formData, gpa: e.target.value})} placeholder="3.8" />
        <ModalActions onCancel={onClose} onSave={() => onSave(formData)} />
      </div>
    </ModalBackdrop>
  );
}

function SkillsModal({ skills, savedSkillSets, setSavedSkillSets, onSave, onClose }) {
  const [formData, setFormData] = useState(skills);

  const addCategory = () => {
    setFormData({
      ...formData,
      categories: [...formData.categories, { name: "", items: [] }]
    });
  };

  const updateCategory = (index, field, value) => {
    const newCategories = [...formData.categories];
    if (field === 'items') {
      newCategories[index].items = value.split(',').map(s => s.trim()).filter(s => s);
    } else {
      newCategories[index][field] = value;
    }
    setFormData({ ...formData, categories: newCategories });
  };

  const removeCategory = (index) => {
    setFormData({
      ...formData,
      categories: formData.categories.filter((_, i) => i !== index)
    });
  };

  const saveAsSkillSet = () => {
    const name = prompt("Enter a name for this skill set:", `Skill Set ${savedSkillSets.length + 1}`);
    if (!name) return;

    const newSkillSet = {
      ...formData,
      savedId: `skillset-${Date.now()}`,
      name: name
    };

    const updated = [...savedSkillSets, newSkillSet];
    setSavedSkillSets(updated);
    localStorage.setItem("resume_saved_skillsets", JSON.stringify(updated));
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="modal" style={{ width: "550px" }}>
        <h3>Edit Skills</h3>
        
        {formData.categories.map((cat, i) => (
          <div key={i} className="skill-category">
            <div className="skill-category-header">
              <input
                value={cat.name}
                onChange={(e) => updateCategory(i, 'name', e.target.value)}
                placeholder="Category name (e.g., Languages)"
                className="modal-input"
                style={{ flex: 1 }}
              />
              <button onClick={() => removeCategory(i)} className="btn-remove">✕</button>
            </div>
            <input
              value={cat.items.join(', ')}
              onChange={(e) => updateCategory(i, 'items', e.target.value)}
              placeholder="Skills (comma-separated)"
              className="modal-input"
            />
          </div>
        ))}

        <button onClick={addCategory} className="btn-add" style={{ marginTop: '12px' }}>
          + Add Category
        </button>

        <div className="modal-actions">
          <button onClick={saveAsSkillSet} className="btn-secondary">Save to Library</button>
          <button onClick={onClose} className="btn-cancel">Cancel</button>
          <button onClick={() => onSave(formData)} className="btn-save">Save</button>
        </div>
      </div>
    </ModalBackdrop>
  );
}