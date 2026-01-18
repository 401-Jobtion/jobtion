import { useState, useEffect, useRef } from 'react';
import { getJobs, addJob, updateJob, deleteJob } from '../lib/storage';
import NewJobModal from "../components/NewJobModal";
import EditJobModal from "../components/EditJobModal";
import { useNavigate } from 'react-router-dom';
import './Home.css';

// Polygon Network Background Component
function PolygonBackground({ isDark }) {
  const canvasRef = useRef(null);
  const dotsRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize random dots
    const numDots = 80;
    dotsRef.current = Array.from({ length: numDots }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2 + 1,
    }));

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouseInfluenceRadius = 150;
      const connectionDistance = 120;

      // Update and draw dots
      dotsRef.current.forEach((dot) => {
        // Calculate distance from mouse
        const dx = mouseRef.current.x - dot.x;
        const dy = mouseRef.current.y - dot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Move away from mouse
        if (dist < mouseInfluenceRadius) {
          const angle = Math.atan2(dy, dx);
          const force = (mouseInfluenceRadius - dist) / mouseInfluenceRadius;
          dot.vx -= Math.cos(angle) * force * 0.8;
          dot.vy -= Math.sin(angle) * force * 0.8;
        }

        // Apply velocity
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Damping
        dot.vx *= 0.95;
        dot.vy *= 0.95;

        // Bounce off edges
        if (dot.x < 0 || dot.x > canvas.width) {
          dot.vx *= -1;
          dot.x = Math.max(0, Math.min(canvas.width, dot.x));
        }
        if (dot.y < 0 || dot.y > canvas.height) {
          dot.vy *= -1;
          dot.y = Math.max(0, Math.min(canvas.height, dot.y));
        }

        // Draw dot
        ctx.fillStyle = isDark ? 'rgba(96, 165, 250, 0.6)' : 'rgba(59, 130, 246, 0.6)';
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connections between nearby dots
      ctx.strokeStyle = isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(59, 130, 246, 0.15)';
      ctx.lineWidth = 1;

      for (let i = 0; i < dotsRef.current.length; i++) {
        for (let j = i + 1; j < dotsRef.current.length; j++) {
          const dot1 = dotsRef.current[i];
          const dot2 = dotsRef.current[j];
          const dx = dot2.x - dot1.x;
          const dy = dot2.y - dot1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const opacity = 1 - dist / connectionDistance;
            ctx.strokeStyle = isDark 
              ? `rgba(96, 165, 250, ${opacity * 0.3})` 
              : `rgba(59, 130, 246, ${opacity * 0.3})`;
            ctx.beginPath();
            ctx.moveTo(dot1.x, dot1.y);
            ctx.lineTo(dot2.x, dot2.y);
            ctx.stroke();
          }
        }
      }

      // Create polygons when mouse is near dots
      const nearbyDots = dotsRef.current.filter(dot => {
        const dx = mouseRef.current.x - dot.x;
        const dy = mouseRef.current.y - dot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < 100;
      });

      if (nearbyDots.length >= 3) {
        ctx.fillStyle = isDark ? 'rgba(96, 165, 250, 0.05)' : 'rgba(59, 130, 246, 0.05)';
        ctx.strokeStyle = isDark ? 'rgba(96, 165, 250, 0.3)' : 'rgba(59, 130, 246, 0.3)';
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        ctx.moveTo(nearbyDots[0].x, nearbyDots[0].y);
        for (let i = 1; i < nearbyDots.length; i++) {
          ctx.lineTo(nearbyDots[i].x, nearbyDots[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

// Theme Toggle Component
function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="theme-toggle"
      aria-label="Toggle theme"
    >
      <div className={`toggle-slider ${isDark ? 'dark' : 'light'}`}>
        {isDark ? '🌙' : '☀️'}
      </div>
    </button>
  );
}

function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Applied');
  const [showNewJob, setShowNewJob] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('jobtion-theme');
    return saved === 'dark';
  });

  useEffect(() => {
    const storedJobs = getJobs();
    if (storedJobs.length > 0) {
      setJobs(storedJobs);
    } else {
      setJobs([
        { id: 'job-1', title: 'Google SWE', url: '', description: '', requirements: [], type: 'SWE', typeColor: 'red', dueDate: 'February 28, 2025', status: 'Applied', company: 'Google', location: '', salary: '', notes: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'job-2', title: 'Data Analyst TD', url: '', description: '', requirements: [], type: 'Data', typeColor: 'green', dueDate: 'March 1, 2025', status: 'Applied', company: 'TD Bank', location: '', salary: '', notes: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('jobtion-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // Mood slider logic - track jobs applied today
  const jobsAppliedToday = jobs.filter(job => {
    if (!job.createdAt) return false;
    const today = new Date().toDateString();
    return new Date(job.createdAt).toDateString() === today;
  }).length;

  const getMoodData = (count) => {
    let emoji = '☹️';
    if (count >= 8) emoji = '😊';
    else if (count >= 5) emoji = '😐';
    
    const position = Math.min((count / 8) * 100, 100);
    return { emoji, position };
  };

  const { emoji, position } = getMoodData(jobsAppliedToday);

  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'Applied') return job.status === 'Applied';
    if (activeTab === 'Interview') return job.status === 'Interview' || job.status === 'Accepted';
    if (activeTab === 'Accepted') return job.status === 'Accepted';
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

  function handleStatusChange(id, newStatus, isChecked) {
    const updatedJobs = jobs.map(job => {
      if (job.id === id) {
        const updatedStatus = isChecked ? newStatus : 'Applied';
        const updatedJob = { ...job, status: updatedStatus, updatedAt: new Date().toISOString() };
        updateJob(updatedJob);
        return updatedJob;
      }
      return job;
    });
    setJobs(updatedJobs);
  }

  if (!isLoaded) {
    return <div className="home-container">Loading...</div>;
  }

  return (
    <div className={`home-container ${isDark ? 'dark' : 'light'}`}>
      <PolygonBackground isDark={isDark} />
      <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
      
      <main className="main-content">
        <h1 className="page-title">Jobtion</h1>

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
                    {job.url ? (
                      <a href={job.url} target="_blank" rel="noreferrer" className="job-link">
                        {job.title}
                      </a>
                    ) : (
                      job.title
                    )}
                  </td>
                  <td className="job-type">
                    {job.type && <span className={`type-tag ${job.typeColor}`}>{job.type}</span>}
                  </td>
                  <td className="job-due-date">{job.dueDate}</td>
                  <td className="job-actions">
                    <button className="edit-btn" onClick={() => handleEditClick(job)}>Edit</button>
                  </td>
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

        {/* Mood Slider Section */}
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