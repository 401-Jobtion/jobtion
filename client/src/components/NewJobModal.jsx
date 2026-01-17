// src/components/NewJobModal.jsx
import { useEffect, useState } from "react";
import "./newJobModal.css";

export default function NewJobModal({ open, onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");              // ✅ NEW
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [jobType, setJobType] = useState("");

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle("");
      setLink("");                                  // ✅ NEW
      setDescription("");
      setDueDate("");
      setJobType("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreate({
      title: title.trim(),
      link: link.trim(),                            // ✅ NEW (optional)
      description: description.trim(),
      dueDate,
      type: jobType,
      typeColor: jobType === "SWE" ? "red" : jobType === "Data" ? "green" : "",
    });

    onClose();
  };

  return (
    <div className="njm-backdrop" onMouseDown={onClose}>
      <div className="njm-card" onMouseDown={(e) => e.stopPropagation()}>
        <div className="njm-header">
          <h2>Add a new job</h2>
          <button className="njm-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="njm-form">
          <label className="njm-label">
            Title
            <input
              className="njm-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Google SWE"
            />
          </label>

          {/* ✅ NEW OPTIONAL LINK FIELD (right below Title) */}
          <label className="njm-label">
            Link 
            <input
              className="njm-input"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="link"
              inputMode="url"
            />
          </label>

          <label className="njm-label">
            Job Description
            <textarea
              className="njm-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste the job description or notes..."
            />
          </label>

          <label className="njm-label">
            Job Type
            <div className="njm-type-row">
              <button
                type="button"
                className={`type-tag red ${jobType === "SWE" ? "selected" : ""}`}
                onClick={() => setJobType(jobType === "SWE" ? "" : "SWE")}
              >
                SWE
              </button>

              <button
                type="button"
                className={`type-tag green ${jobType === "Data" ? "selected" : ""}`}
                onClick={() => setJobType(jobType === "Data" ? "" : "Data")}
              >
                Data
              </button>
            </div>
          </label>

          <label className="njm-label">
            Due Date
            <input
              className="njm-input"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </label>

          <button className="njm-primary" type="submit">
            Add Job
          </button>
        </form>
      </div>
    </div>
  );
}
