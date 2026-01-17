// In client/src/pages/Home.jsx, the imports should be:
import { getJobs, addJob, updateJob, deleteJob, getStoredResume } from '../lib/storage';
import JobForm from '../components/JobForm';
import JobList from '../components/JobList';
import ResumeUpload from '../components/ResumeUpload';
import { useState } from 'react';
import NewJobModal from '../components/NewJobModal';
import { useNavigate } from 'react-router-dom';
import './Home.css';




function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Applied');
  const [showNewJob, setShowNewJob] = useState(false);

  // ✅ jobs (now include optional link + description on seed data too if you want)
  const [jobs, setJobs] = useState([
    { id: 1, title: 'Google SWE', link: '', description: '', type: 'SWE', typeColor: 'red', dueDate: 'February 28, 2025', status: 'Applied' },
    { id: 2, title: 'Data Analyst TD', link: '', description: '', type: 'Data', typeColor: 'green', dueDate: 'March 1, 2025', status: 'Applied' },
    { id: 3, title: 'Pinterest SWE', link: '', description: '', type: 'SWE', typeColor: 'red', dueDate: 'March 14, 2025', status: 'Applied' },
    { id: 4, title: 'NVIDIA Data Science', link: '', description: '', type: 'Data', typeColor: 'green', dueDate: 'March 14, 2025', status: 'Applied' },
    { id: 5, title: 'UofA RA', link: '', description: '', type: '', typeColor: '', dueDate: 'March 14, 2025', status: 'Applied' },
    { id: 6, title: 'McDonald cashier', link: '', description: '', type: '', typeColor: '', dueDate: 'April 1, 2025', status: 'Applied' }
  ]);

  const filteredJobs = jobs.filter(job => job.status === activeTab);
  // helper: convert yyyy-mm-dd to "March 14, 2025"
  function formatHumanDate(yyyyMmDd) {
    if (!yyyyMmDd) return '';
    const d = new Date(yyyyMmDd + 'T00:00:00');
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // ✅ called when modal submits
  function handleCreateJob(newJob) {
    const nextId = Math.max(0, ...jobs.map(j => j.id)) + 1;

    setJobs(prev => [
      {
        id: nextId,
        title: newJob.title,
        link: (newJob.link || '').trim(), // ✅ NEW
        description: newJob.description,
        dueDate: formatHumanDate(newJob.dueDate),
        status: 'Applied',
        type: newJob.type || '',
        typeColor: newJob.typeColor || ''
      },
      ...prev
    ]);
  }

  return (
    <div className="home-container">
      <main className="main-content">
        <h1 className="page-title">Jobs</h1>

        <div className="tabs-container">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'Applied' ? 'active' : ''}`}
              onClick={() => setActiveTab('Applied')}
            >
              <span className="tab-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                </svg>
              </span>
              Applied
            </button>

            <button
              className={`tab ${activeTab === 'Interview' ? 'active' : ''}`}
              onClick={() => setActiveTab('Interview')}
            >
              <span className="tab-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              Interview
            </button>

            <button
              className={`tab ${activeTab === 'Accepted' ? 'active' : ''}`}
              onClick={() => setActiveTab('Accepted')}
            >
              <span className="tab-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </span>
              Accepted
            </button>
          </div>

          <div className="actions">
            <button className="icon-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
            <button className="new-button" onClick={() => setShowNewJob(true)}>New</button>
            <button
              className="resume-button"
              onClick={() => navigate("/resume")}
            >Resume</button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="jobs-table">
            <thead>
              <tr>
                <th className="job-title-header">
                  <span className="header-icon" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                  </span>
                  Job Title
                </th>

                <th className="type-header">
                  <span className="header-icon" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </span>
                  Type
                </th>

                <th className="due-date-header">
                  <div className="due-date-header-content">
                    <span className="header-icon" style={{ verticalAlign: 'middle' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    </span>
                    Due Date
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredJobs.map(job => (
                <tr key={job.id}>
                  <td className="job-title">
                    {job.link ? (
                      <a
                        href={job.link}
                        target="_blank"
                        rel="noreferrer"
                        className="job-link"
                      >
                        {job.title}
                      </a>
                    ) : (
                      job.title
                    )}
                  </td>

                  <td className="job-type">
                    {job.type && (
                      <span className={`type-tag ${job.typeColor}`}>
                        {job.type}
                      </span>
                    )}
                  </td>

                  <td className="job-due-date">{job.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="urgency-bar"></div>

        {/* ✅ MODAL */}
        <NewJobModal
          open={showNewJob}
          onClose={() => setShowNewJob(false)}
          onCreate={handleCreateJob}
        />
      </main>
    </div>
  );
}

export default Home;
