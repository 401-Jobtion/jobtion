// src/components/EditJobModal.jsx
import { useEffect, useState, useRef } from "react";
import { getStoredResume, saveResume } from "../lib/storage";
import "./EditJobModal.css";

export default function EditJobModal({ open, job, onClose, onUpdate, onDelete }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [salary, setSalary] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [jobType, setJobType] = useState("");
  const [status, setStatus] = useState("saved");
  const [notes, setNotes] = useState("");

  const [storedResume, setStoredResume] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Load job data when modal opens
  useEffect(() => {
    if (open && job) {
      setUrl(job.url || "");
      setTitle(job.title || "");
      setCompany(job.company || "");
      setLocation(job.location || "");
      setDescription(job.description || "");
      setRequirements(job.requirements?.join("\n") || "");
      setSalary(job.salary || "");
      setDueDate(job.dueDate || "");
      setJobType(job.type || "");
      setStatus(job.status || "saved");
      setNotes(job.notes || "");
      setStoredResume(getStoredResume());
      setError("");
    }
  }, [open, job]);

  // Escape key to close
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const handleUploadResume = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse resume");
      }

      const resume = {
        fileName: data.fileName,
        text: data.text,
        uploadedAt: new Date().toISOString(),
      };

      saveResume(resume);
      setStoredResume(resume);
    } catch (err) {
      setError(err.message || "Failed to upload resume");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleGenerateResume = async () => {
    if (!storedResume) {
      setError("Please upload a resume first");
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/tailor-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: storedResume.text,
          job: {
            title,
            company,
            description,
            requirements: requirements.split("\n").filter((r) => r.trim()),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate resume");
      }

      // Download the file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `Resume_${company.replace(/\s+/g, "_")}_${title.replace(/\s+/g, "_")}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      a.remove();
    } catch (err) {
      setError(err.message || "Failed to generate resume");
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    onUpdate({
      ...job,
      url,
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      description: description.trim(),
      requirements: requirements.split("\n").filter((r) => r.trim()),
      salary: salary.trim(),
      dueDate,
      type: jobType,
      typeColor: jobType === "SWE" ? "red" : jobType === "Data" ? "green" : "",
      status,
      notes: notes.trim(),
      updatedAt: new Date().toISOString(),
    });

    onClose();
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this job?")) {
      onDelete(job.id);
      onClose();
    }
  };

  if (!open || !job) return null;

  return (
    <div className="ejm-fullscreen">
      {/* Header */}
      <div className="ejm-header">
        <h1>Edit Job</h1>
        <button className="ejm-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="ejm-content">
        <form onSubmit={handleUpdate} className="ejm-form">
          {error && <div className="ejm-error">{error}</div>}

          {/* URL */}
          <div className="ejm-section">
            <label className="ejm-label">Job Posting URL</label>
            <input
              className="ejm-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              type="url"
            />
          </div>

          {/* Two column grid */}
          <div className="ejm-grid">
            <div className="ejm-section">
              <label className="ejm-label">Title *</label>
              <input
                className="ejm-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Software Engineer"
              />
            </div>

            <div className="ejm-section">
              <label className="ejm-label">Company</label>
              <input
                className="ejm-input"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Google"
              />
            </div>

            <div className="ejm-section">
              <label className="ejm-label">Location</label>
              <input
                className="ejm-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Remote, NYC, etc."
              />
            </div>

            <div className="ejm-section">
              <label className="ejm-label">Salary</label>
              <input
                className="ejm-input"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="$100k - $150k"
              />
            </div>

            <div className="ejm-section">
              <label className="ejm-label">Job Type</label>
              <div className="ejm-type-row">
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
            </div>

            <div className="ejm-section">
              <label className="ejm-label">Status</label>
              <select
                className="ejm-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="saved">📌 Saved</option>
                <option value="applied">📤 Applied</option>
                <option value="interviewing">💬 Interviewing</option>
                <option value="offer">🎉 Offer</option>
                <option value="rejected">❌ Rejected</option>
                <option value="withdrawn">🚫 Withdrawn</option>
              </select>
            </div>

            <div className="ejm-section">
              <label className="ejm-label">Due Date</label>
              <input
                className="ejm-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Full width sections */}
          <div className="ejm-section">
            <label className="ejm-label">Description</label>
            <textarea
              className="ejm-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Job description summary..."
              rows={3}
            />
          </div>

          <div className="ejm-section">
            <label className="ejm-label">Requirements (one per line)</label>
            <textarea
              className="ejm-textarea"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder={"5+ years experience\nPython proficiency\n..."}
              rows={4}
            />
          </div>

          <div className="ejm-section">
            <label className="ejm-label">Notes</label>
            <textarea
              className="ejm-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Interview dates, contacts, thoughts..."
              rows={3}
            />
          </div>

          {/* Resume Section */}
          <div className="ejm-resume-section">
            <h3>Resume</h3>
            <div className="ejm-resume-content">
              <div className="ejm-resume-info">
                {storedResume ? (
                  <p>
                    📄 {storedResume.fileName}
                    <span className="ejm-resume-date">
                      (uploaded {new Date(storedResume.uploadedAt).toLocaleDateString()})
                    </span>
                  </p>
                ) : (
                  <p className="ejm-no-resume">No resume uploaded</p>
                )}
              </div>
              <div className="ejm-resume-actions">
                <label className="ejm-upload-btn">
                  {uploading ? "Uploading..." : storedResume ? "Replace Resume" : "Upload Resume"}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleUploadResume}
                    disabled={uploading}
                    hidden
                  />
                </label>
                <button
                  type="button"
                  className="ejm-generate-btn"
                  onClick={handleGenerateResume}
                  disabled={generating || !storedResume}
                >
                  {generating ? "✨ Generating..." : "✨ Generate Tailored Resume"}
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="ejm-actions">
            <button type="button" className="ejm-delete" onClick={handleDelete}>
              Delete Job
            </button>
            <div className="ejm-actions-right">
              <button type="button" className="ejm-cancel" onClick={onClose}>
                Cancel
              </button>
              <button className="ejm-primary" type="submit">
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}