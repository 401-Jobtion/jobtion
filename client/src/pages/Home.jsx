import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import './home.css';
import NewJobModal from '../components/NewJobModal';

function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Applied');
  const [showNewJob, setShowNewJob] = useState(false);

  // Added 'appliedAt' to track daily progress
  const [jobs, setJobs] = useState([
    { id: 1, title: 'Google SWE', type: 'SWE', typeColor: 'red', dueDate: 'February 28, 2025', status: 'Applied', appliedAt: new Date() },
    { id: 2, title: 'Data Analyst TD', type: 'Data', typeColor: 'green', dueDate: 'March 1, 2025', status: 'Applied', appliedAt: new Date() },
    { id: 3, title: 'Pinterest SWE', type: 'SWE', typeColor: 'red', dueDate: 'March 14, 2025', status: 'Applied', appliedAt: new Date() },
    { id: 4, title: 'NVIDIA Data Science', type: 'Data', typeColor: 'green', dueDate: 'March 14, 2025', status: 'Applied', appliedAt: new Date() },
    { id: 5, title: 'UofA RA', type: '', typeColor: '', dueDate: 'March 14, 2025', status: 'Applied', appliedAt: new Date() },
    { id: 6, title: 'McDonald cashier', type: '', typeColor: '', dueDate: 'April 1, 2025', status: 'Applied', appliedAt: new Date() }
  ]);

  // Logic for the Emoji Slider
  const jobsAppliedToday = jobs.filter(job => {
    if (!job.appliedAt) return false;
    const today = new Date().toDateString();
    return new Date(job.appliedAt).toDateString() === today;
  }).length;

  const getMoodData = (count) => {
    let emoji = '☹️';
    if (count >= 8) emoji = '😊';
    else if (count >= 5) emoji = '😐';
    
    // Calculate position (0 to 100%) based on a goal of 8 jobs
    const position = Math.min((count / 8) * 100, 100);
    return { emoji, position };
  };

  const { emoji, position } = getMoodData(jobsAppliedToday);

  const handleStatusChange = (id, newStatus, isChecked) => {
    setJobs(prevJobs =>
      prevJobs.map(job => {
        if (job.id === id) {
          const updatedStatus = isChecked ? newStatus : 'Applied';
          return { ...job, status: updatedStatus };
        }
        return job;
      })
    );
  };

  function formatHumanDate(yyyyMmDd) {
    if (!yyyyMmDd) return '';
    const d = new Date(yyyyMmDd + 'T00:00:00');
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function handleCreateJob(newJob) {
    const nextId = Math.max(0, ...jobs.map(j => j.id)) + 1;
    setJobs(prev => [
      {
        id: nextId,
        title: newJob.title,
        link: (newJob.link || '').trim(),
        description: newJob.description,
        dueDate: formatHumanDate(newJob.dueDate),
        status: 'Applied',
        type: newJob.type || '',
        typeColor: newJob.typeColor || '',
        appliedAt: new Date() // Set timestamp for today
      },
      ...prev
    ]);
  }

  const filteredJobs = jobs.filter(job => job.status === activeTab);

  return (
    <div className="home-container">
      <main className="main-content">
        <h1 className="page-title">Jobs</h1>

        <div className="tabs-container">
          <div className="tabs">
            {['Applied', 'Interview', 'Accepted'].map((tab) => (
              <button
                key={tab}
                className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                <span className="tab-icon">
                  {tab === 'Applied' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="9" y1="3" x2="9" y2="21"></line>
                    </svg>
                  )}
                  {tab === 'Interview' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  )}
                  {tab === 'Accepted' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  )}
                </span>
                {tab}
              </button>
            ))}
          </div>

          <div className="actions">
            <button className="icon-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
            <button className="new-button">New</button>
            <button
              className="resume-button"
              onClick={() => navigate("/resume")}
            >Resume</button>
            <button className="new-button" onClick={() => setShowNewJob(true)}>New</button>
            <button className="resume-button" onClick={() => navigate("/resume")}>Resume</button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="jobs-table">
            <thead>
              <tr>
                <th className="job-title-header">Job Title</th>
                <th className="type-header">Type</th>
                <th className="due-date-header">Due Date</th>
                <th className="checkbox-header">Interview</th>
                <th className="checkbox-header">Accepted</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map(job => (
                <tr key={job.id}>
                  <td className="job-title">
                    {job.link ? (
                      <a href={job.link} target="_blank" rel="noreferrer" className="job-link">{job.title}</a>
                    ) : (
                      job.title
                    )}
                  </td>
                  <td className="job-type">
                    {job.type && <span className={`type-tag ${job.typeColor}`}>{job.type}</span>}
                  </td>
                  <td className="job-due-date">{job.dueDate}</td>
                  
                  <td className="status-checkbox-cell">
                    <input 
                      type="checkbox" 
                      checked={job.status === 'Interview' || job.status === 'Accepted'}
                      onChange={(e) => handleStatusChange(job.id, 'Interview', e.target.checked)}
                    />
                  </td>

                  <td className="status-checkbox-cell">
                    <input 
                      type="checkbox" 
                      checked={job.status === 'Accepted'}
                      onChange={(e) => handleStatusChange(job.id, 'Accepted', e.target.checked)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* New Mood Slider Section */}
        <div className="urgency-container">
          <div className="urgency-bar">
            <div 
              className="emoji-slider" 
              style={{ bottom: `calc(${position}% - 12px)` }}
            >
              {emoji}
            </div>
          </div>
        </div>

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