import { useState } from "react";
import "./RightSidebar.css";

export default function RightSidebar({ 
  collapsed, 
  setCollapsed, 
  onSave, 
  onLoad, 
  onDelete, 
  savedVersions,
  getTimeAgo 
}) {
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
          <div className="sidebar-section">
            <div className="version-header">
              <h3>Saved Versions</h3>
              <button className="add-version-btn" onClick={onSave}>+</button>
            </div>

            {savedVersions.length === 0 ? (
              <div className="empty-state">No saved versions yet.</div>
            ) : (
              savedVersions.map((version) => (
                <div 
                  key={version.id} 
                  className="version-card" 
                  onClick={() => onLoad(version)}
                >
                  <div className="version-info">
                    <span className="version-name">{version.name}</span>
                    <span className="version-time">Saved {getTimeAgo(version.timestamp)}</span>
                  </div>
                  <button 
                    className="delete-version-btn" 
                    onClick={(e) => onDelete(e, version.id)}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </aside>
  );
}