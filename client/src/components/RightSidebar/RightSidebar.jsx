import { useState } from "react";
import "./RightSidebar.css";

export default function RightSidebar({ 
  collapsed, 
  setCollapsed, 
  onSaveVersion,
  onLoadVersion, 
  onDeleteVersion, 
  savedVersions,
  savedInfo,
  onLoadBlock,
  onDeleteSavedBlock,
  getTimeAgo 
}) {
  const [activeTab, setActiveTab] = useState('versions');

  return (
    <aside className={`right-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? "←" : "→"}
        </button>
        {!collapsed && <h2>AI Tools</h2>}
      </div>

      {!collapsed && (
        <div className="sidebar-content">
          {/* Tab Selector */}
          <div style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
            borderBottom: "1px solid #3a3a3a",
            paddingBottom: "10px"
          }}>
            <button
              onClick={() => setActiveTab('versions')}
              style={{
                flex: 1,
                padding: "8px",
                background: activeTab === 'versions' ? '#4CAF50' : '#3a3a3a',
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: activeTab === 'versions' ? '600' : '400'
              }}
            >
              💾 Versions
            </button>
            <button
              onClick={() => setActiveTab('saved-info')}
              style={{
                flex: 1,
                padding: "8px",
                background: activeTab === 'saved-info' ? '#4CAF50' : '#3a3a3a',
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: activeTab === 'saved-info' ? '600' : '400'
              }}
            >
              📚 Saved Info
            </button>
          </div>

          {/* Saved Versions Tab */}
          {activeTab === 'versions' && (
            <div className="sidebar-section">
              <div className="version-header">
                <h3>Saved Versions</h3>
                <button className="add-version-btn" onClick={onSaveVersion}>+</button>
              </div>

              {savedVersions.length === 0 ? (
                <div className="empty-state">No saved versions yet.</div>
              ) : (
                savedVersions.map((version) => (
                  <div 
                    key={version.id} 
                    className="version-card" 
                    onClick={() => onLoadVersion(version)}
                  >
                    <div className="version-info">
                      <span className="version-name">{version.name}</span>
                      <span className="version-time">Saved {getTimeAgo(version.timestamp)}</span>
                    </div>
                    <button 
                      className="delete-version-btn" 
                      onClick={(e) => onDeleteVersion(e, version.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Saved Info Tab */}
          {activeTab === 'saved-info' && (
            <div className="sidebar-section">
              <h3 style={{ marginTop: 0, marginBottom: "10px" }}>Saved Info Library</h3>
              <p style={{ fontSize: "12px", color: "#aaa", marginBottom: "20px" }}>
                Click to add saved blocks to your resume
              </p>

              {/* Experiences */}
              {savedInfo.experiences.length > 0 && (
                <SavedBlockSection
                  title="Experience"
                  blocks={savedInfo.experiences}
                  type="experience"
                  onLoad={onLoadBlock}
                  onDelete={onDeleteSavedBlock}
                  getTitleSubtitle={(block) => ({
                    title: block.company || "Untitled",
                    subtitle: block.role || "No role"
                  })}
                />
              )}

              {/* Projects */}
              {savedInfo.projects.length > 0 && (
                <SavedBlockSection
                  title="Projects"
                  blocks={savedInfo.projects}
                  type="project"
                  onLoad={onLoadBlock}
                  onDelete={onDeleteSavedBlock}
                  getTitleSubtitle={(block) => ({
                    title: block.name || "Untitled",
                    subtitle: block.tech || "No tech"
                  })}
                />
              )}

              {/* Education */}
              {savedInfo.education.length > 0 && (
                <SavedBlockSection
                  title="Education"
                  blocks={savedInfo.education}
                  type="education"
                  onLoad={onLoadBlock}
                  onDelete={onDeleteSavedBlock}
                  getTitleSubtitle={(block) => ({
                    title: block.school || "Untitled",
                    subtitle: block.degree || "No degree"
                  })}
                />
              )}

              {savedInfo.experiences.length === 0 && 
               savedInfo.projects.length === 0 && 
               savedInfo.education.length === 0 && (
                <div style={{ textAlign: "center", color: "#888", fontSize: "13px", padding: "20px" }}>
                  No saved blocks yet. Click the save icon (💾) on any block in the left sidebar to save it here.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

function SavedBlockSection({ title, blocks, type, onLoad, onDelete, getTitleSubtitle }) {
  return (
    <div style={{ marginBottom: "25px" }}>
      <h4 style={{ fontSize: "14px", color: "#4CAF50", marginBottom: "10px" }}>{title}</h4>
      {blocks.map((block) => {
        const { title: blockTitle, subtitle } = getTitleSubtitle(block);
        return (
          <div
            key={block.savedId}
            onClick={() => onLoad(block, type)}
            className="version-card"
            style={{ cursor: "pointer" }}
          >
            <div className="version-info">
              <span className="version-name">{blockTitle}</span>
              <span className="version-time">{subtitle}</span>
            </div>
            <button
              className="delete-version-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(block.savedId, type);
              }}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}