import { useEffect, useState } from "react";
import { generateId } from "../lib/storage";
import "./newJobModal.css";

export default function NewJobModal({ open, onClose, onCreate }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [salary, setSalary] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [jobType, setJobType] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setUrl("");
      setTitle("");
      setCompany("");
      setLocation("");
      setDescription("");
      setRequirements("");
      setSalary("");
      setDueDate("");
      setJobType("");
      setError("");
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

  const handleExtract = async () => {
    if (!url) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract job details");
      }

      setTitle(data.title || "");
      setCompany(data.company || "");
      setLocation(data.location || "");
      setDescription(data.description || "");
      setRequirements(data.requirements?.join("\n") || "");
      setSalary(data.salary || "");
    } catch (err) {
      setError(err.message || "Failed to extract job details");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    onCreate({
      id: generateId(),
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
      status: "saved",
      notes: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    onClose();
  };

  return (
    <div className="njm-fullscreen">
      {/* Header */}
      <div className="njm-header">
        <h1>Add New Job</h1>
        <button className="njm-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="njm-content">
        <form onSubmit={submit} className="njm-form">
          {error && <div className="njm-error">{error}</div>}

          {/* URL with Extract button */}
          <div className="njm-section">
            <label className="njm-label">Job Posting URL</label>
            <div className="njm-url-row">
              <input
                className="njm-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                type="url"
              />
              <button
                type="button"
                className="njm-extract-btn"
                onClick={handleExtract}
                disabled={loading || !url}
              >
                {loading ? "Extracting..." : "Extract"}
              </button>
            </div>
          </div>

          {/* Two column grid */}
          <div className="njm-grid">
            <div className="njm-section">
              <label className="njm-label">Title *</label>
              <input
                className="njm-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Software Engineer"
              />
            </div>

            <div className="njm-section">
              <label className="njm-label">Company</label>
              <input
                className="njm-input"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Google"
              />
            </div>

            <div className="njm-section">
              <label className="njm-label">Location</label>
              <input
                className="njm-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Remote, NYC, etc."
              />
            </div>

            <div className="njm-section">
              <label className="njm-label">Salary</label>
              <input
                className="njm-input"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="$100k - $150k"
              />
            </div>

            <div className="njm-section">
              <label className="njm-label">Job Type</label>
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
            </div>

            <div className="njm-section">
              <label className="njm-label">Due Date</label>
              <input
                className="njm-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Full width sections */}
          <div className="njm-section">
            <label className="njm-label">Description</label>
            <textarea
              className="njm-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Job description summary..."
              rows={3}
            />
          </div>

          <div className="njm-section">
            <label className="njm-label">Requirements (one per line)</label>
            <textarea
              className="njm-textarea"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder={"5+ years experience\nPython proficiency\n..."}
              rows={4}
            />
          </div>

          {/* Submit button */}
          <div className="njm-actions">
            <button type="button" className="njm-cancel" onClick={onClose}>
              Cancel
            </button>
            <button className="njm-primary" type="submit">
              Add Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}