import { useState } from "react";
import "../SidebarBase.css";
import "./LeftSidebar.css";

export default function LeftSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`left-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        {!collapsed && <h2>Sections</h2>}

        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {!collapsed && (
        <div className="sidebar-content">
          <Section title="Profile" />
          <Section title="Work Experience" />
          <Section title="Education" />
        </div>
      )}
    </aside>
  );
}

function Section({ title }) {
  return (
    <div className="sidebar-section">
      <h3>{title}</h3>
      <button className="add-btn">+</button>
    </div>
  );
}
