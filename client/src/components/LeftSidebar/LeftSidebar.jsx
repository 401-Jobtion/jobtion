import { useState } from "react";
import "./LeftSidebar.css";

export default function LeftSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`left-sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Header */}
      <div className="sidebar-header">
        {!collapsed && <h2>Sections</h2>}
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Content */}
      <div className="sidebar-content">
        <Section title="Profile" collapsed={collapsed} />
        <Section title="Work Experience" collapsed={collapsed} />
        <Section title="Education" collapsed={collapsed} />
      </div>
    </aside>
  );
}

function Section({ title, collapsed }) {
  return (
    <div className="sidebar-section">
      {!collapsed && <h3>{title}</h3>}
      <button className="add-btn">+</button>
    </div>
  );
}
