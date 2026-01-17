import { useState } from "react";
<<<<<<< HEAD
=======
import "../SidebarBase.css";
>>>>>>> 9fe18b287284b74fac47a21fff58681f909ce578
import "./LeftSidebar.css";

export default function LeftSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`left-sidebar ${collapsed ? "collapsed" : ""}`}>
<<<<<<< HEAD
      {/* Header */}
      <div className="sidebar-header">
        {!collapsed && <h2>Sections</h2>}
=======
      <div className="sidebar-header">
        {!collapsed && <h2>Sections</h2>}

>>>>>>> 9fe18b287284b74fac47a21fff58681f909ce578
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

<<<<<<< HEAD
      {/* Content */}
      <div className="sidebar-content">
        <Section title="Profile" collapsed={collapsed} />
        <Section title="Work Experience" collapsed={collapsed} />
        <Section title="Education" collapsed={collapsed} />
      </div>
=======
      {!collapsed && (
        <div className="sidebar-content">
          <Section title="Profile" />
          <Section title="Work Experience" />
          <Section title="Education" />
        </div>
      )}
>>>>>>> 9fe18b287284b74fac47a21fff58681f909ce578
    </aside>
  );
}

<<<<<<< HEAD
function Section({ title, collapsed }) {
  return (
    <div className="sidebar-section">
      {!collapsed && <h3>{title}</h3>}
=======
function Section({ title }) {
  return (
    <div className="sidebar-section">
      <h3>{title}</h3>
>>>>>>> 9fe18b287284b74fac47a21fff58681f909ce578
      <button className="add-btn">+</button>
    </div>
  );
}
