import { useState } from "react";
import "../SidebarBase.css";
import "./RightSidebar.css";

export default function RightSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`right-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "←" : "→"}
        </button>

        {!collapsed && <h2>Library</h2>}
      </div>

      {!collapsed && (
        <div className="sidebar-content">
          <Section title="Saved Resume" />
          <Section title="Saved Blocks" />
        </div>
      )}
    </aside>
  );
}

function Section({ title }) {
  return (
    <div className="sidebar-section">
      <h3>{title}</h3>
      <div className="thumbnail" />
      <div className="thumbnail" />
    </div>
  );
}
