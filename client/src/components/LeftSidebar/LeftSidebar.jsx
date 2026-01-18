import { useState } from "react";
import "../SidebarBase.css";
import "./LeftSidebar.css";

export default function LeftSidebar({
  profile,
  onAddProfile,
  workExperiences,
  onAddWorkExperience,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showWorkModal, setShowWorkModal] = useState(false);

  return (
    <>
      <aside className={`left-sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          {!collapsed && <h2>Sections</h2>}
          <button
            className="collapse-btn"
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {!collapsed && (
          <div className="sidebar-content">
            {/* PROFILE */}
            <Section
              title="Profile"
              hideAdd={!!profile}
              onAdd={() => {
                setEditingProfile(false);
                setShowProfileModal(true);
              }}
            >
              {profile && (
                <ProfileItem
                  profile={profile}
                  onEdit={() => {
                    setEditingProfile(true);
                    setShowProfileModal(true);
                  }}
                />
              )}
            </Section>

            {/* WORK EXPERIENCE */}
            <Section
              title="Work Experience"
              onAdd={() => setShowWorkModal(true)}
            >
              {workExperiences.map((exp, index) => (
                <SidebarItem
                  key={index}
                  title={exp.company}
                  subtitle={exp.role}
                />
              ))}
            </Section>

            {/* EDUCATION (stub) */}
            <Section title="Education" />
          </div>
        )}
      </aside>

      {/* ================= MODALS ================= */}

      {showProfileModal && (
        <ProfileModal
          initialData={editingProfile ? profile : null}
          onClose={() => setShowProfileModal(false)}
          onSave={(data) => {
            onAddProfile(data);
            setShowProfileModal(false);
          }}
        />
      )}

      {showWorkModal && (
        <WorkExperienceModal
          onClose={() => setShowWorkModal(false)}
          onSave={onAddWorkExperience}
        />
      )}
    </>
  );
}

/* =========================
   SECTION
   ========================= */

function Section({ title, onAdd, children, hideAdd = false }) {
  return (
    <div className="sidebar-section">
      <h3>{title}</h3>
      {children}
      {!hideAdd && (
        <button className="add-btn" onClick={onAdd}>
          +
        </button>
      )}
    </div>
  );
}

/* =========================
   PROFILE ITEM
   ========================= */

function ProfileItem({ profile, onEdit }) {
  return (
    <div className="sidebar-item profile-item">
      <DragHandle />

      <div className="profile-text">
        <span className="profile-name">{profile.name}</span>
        <small>
          {profile.phone} · {profile.email}
        </small>
      </div>

      <button className="edit-btn" onClick={onEdit} title="Edit profile">
        ✏️
      </button>
    </div>
  );
}

/* =========================
   GENERIC SIDEBAR ITEM
   ========================= */

function SidebarItem({ title, subtitle }) {
  return (
    <div className="sidebar-item profile-item">
      <DragHandle />

      <div className="profile-text">
        <span className="profile-name">{title}</span>
        <small>{subtitle}</small>
      </div>
    </div>
  );
}

/* =========================
   DRAG HANDLE
   ========================= */

function DragHandle() {
  return (
    <div className="drag-handle" aria-hidden>
      <svg width="12" height="16" viewBox="0 0 12 16">
        <circle cx="3" cy="3" r="1.5" />
        <circle cx="9" cy="3" r="1.5" />
        <circle cx="3" cy="8" r="1.5" />
        <circle cx="9" cy="8" r="1.5" />
        <circle cx="3" cy="13" r="1.5" />
        <circle cx="9" cy="13" r="1.5" />
      </svg>
    </div>
  );
}

/* =========================
   PROFILE MODAL
   ========================= */

function ProfileModal({ onClose, onSave, initialData }) {
  const [name, setName] = useState(initialData?.name || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [email, setEmail] = useState(initialData?.email || "");

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{initialData ? "Edit Profile" : "Add Profile"}</h3>

        <input
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={() => onSave({ name, phone, email })}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   WORK EXPERIENCE MODAL
   ========================= */

function WorkExperienceModal({ onClose, onSave }) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Add Work Experience</h3>

        <input
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <input
          placeholder="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
        <input
          placeholder="Start date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <input
          placeholder="End date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
        <textarea
          placeholder="Description (one bullet per line)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={() => {
              onSave({ company, role, start, end, description });
              onClose();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
