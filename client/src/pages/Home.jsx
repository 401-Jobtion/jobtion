import { useState, useEffect } from 'react';
import { getJobs, addJob, updateJob, deleteJob } from '../lib/storage';
import NewJobModal from "../components/NewJobModal";
import EditJobModal from "../components/EditJobModal";
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Applied');
  const [showNewJob, setShowNewJob] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedJobs = getJobs();
    if (storedJobs.length > 0) {
      setJobs(storedJobs);
    } else {
      setJobs([
        { id: 'job-1', title: 'Google SWE', url: '', description: '', requirements: [], type: 'SWE', typeColor: 'red', dueDate: 'February 28, 2025', status: 'applied', company: 'Google', location: '', salary: '', notes: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'job-2', title: 'Data Analyst TD', url: '', description: '', requirements: [], type: 'Data', typeColor: 'green', dueDate: 'March 1, 2025', status: 'applied', company: 'TD Bank', location: '', salary: '', notes: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ]);
    }
    setIsLoaded(true);
  }, []);

  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'Applied') return job.status === 'saved' || job.status === 'applied';
    if (activeTab === 'Interview') return job.status === 'interviewing';
    if (activeTab === 'Accepted') return job.status === 'offer';
    return true;
  });

  function handleCreateJob(newJob) {
    setJobs(addJob(newJob));
  }

  function handleUpdateJob(updatedJob) {
    setJobs(updateJob(updatedJob));
  }

  function handleDeleteJob(id) {
    setJobs(deleteJob(id));
  }

  function handleEditClick(job) {
    setEditingJob(job);
  }

  if (!isLoaded) {
    return <div className="home-container">Loading...</div>;
  }


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
                <th className="actions-header">Actions</th>
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

      <NewJobModal
        open={showNewJob}
        onClose={() => setShowNewJob(false)}
        onCreate={handleCreateJob}
      />

      <EditJobModal
        open={!!editingJob}
        job={editingJob}
        onClose={() => setEditingJob(null)}
        onUpdate={handleUpdateJob}
        onDelete={handleDeleteJob}
      />
    </div>
  );
}

export default Home;