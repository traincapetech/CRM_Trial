import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaVoteYea, FaClock, FaUsers, FaCheckCircle } from 'react-icons/fa';
import './LeadPolling.css';

const LeadPolling = () => {
  const { user, token } = useAuth();
  const [activePolls, setActivePolls] = useState([]);
  const [myVotes, setMyVotes] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivePolls();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchActivePolls, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActivePolls = async () => {
    try {
      const serverUrl = import.meta.env?.VITE_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const response = await fetch(`${serverUrl}/api/lead-polling/active`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setActivePolls(data.data || []);
        
        // Get user's votes
        const votesResponse = await fetch(`${serverUrl}/api/lead-polling/my-votes`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (votesResponse.ok) {
          const votesData = await votesResponse.json();
          setMyVotes(votesData.data || {});
        }
      }
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitVote = async (pollId, interested) => {
    try {
      const serverUrl = import.meta.env?.VITE_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const response = await fetch(`${serverUrl}/api/lead-polling/vote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pollId,
          interested
        })
      });

      if (response.ok) {
        // Update local state
        setMyVotes(prev => ({
          ...prev,
          [pollId]: interested
        }));
        
        // Refresh polls to get updated vote counts
        fetchActivePolls();
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
    }
  };

  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  if (isLoading) {
    return (
      <div className="lead-polling-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading active polls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lead-polling-container">
      <div className="polling-header">
        <h2>
          <FaVoteYea className="header-icon" />
          Lead Assignment Polls
        </h2>
        <p>Vote on leads you're interested in taking</p>
      </div>

      {activePolls.length === 0 ? (
        <div className="no-polls">
          <FaVoteYea className="no-polls-icon" />
          <h3>No Active Polls</h3>
          <p>There are currently no leads available for polling.</p>
        </div>
      ) : (
        <div className="polls-grid">
          {activePolls.map(poll => (
            <div key={poll._id} className="poll-card">
              <div className="poll-header">
                <div className="lead-info">
                  <h3>{poll.leadData.name}</h3>
                  <p className="lead-details">
                    {poll.leadData.email} • {poll.leadData.phone}
                  </p>
                  <div className="lead-meta">
                    <span className="lead-source">{poll.leadData.source}</span>
                    <span className="lead-budget">Budget: {poll.leadData.budget}</span>
                  </div>
                </div>
                <div className="poll-status">
                  <div className="time-remaining">
                    <FaClock className="clock-icon" />
                    {getTimeRemaining(poll.expiresAt)}
                  </div>
                </div>
              </div>

              <div className="poll-description">
                <h4>Lead Requirements:</h4>
                <p>{poll.leadData.requirements || 'No specific requirements mentioned.'}</p>
              </div>

              <div className="poll-stats">
                <div className="vote-counts">
                  <div className="interested-count">
                    <FaCheckCircle className="vote-icon interested" />
                    <span>{poll.interestedCount} Interested</span>
                  </div>
                  <div className="not-interested-count">
                    <FaUsers className="vote-icon not-interested" />
                    <span>{poll.notInterestedCount} Not Interested</span>
                  </div>
                </div>
                <div className="total-votes">
                  Total Votes: {poll.totalVotes}
                </div>
              </div>

              <div className="voting-section">
                {myVotes[poll._id] !== undefined ? (
                  <div className="vote-submitted">
                    <FaCheckCircle className="submitted-icon" />
                    <span>
                      You voted: {myVotes[poll._id] ? 'Interested' : 'Not Interested'}
                    </span>
                  </div>
                ) : (
                  <div className="vote-buttons">
                    <button
                      className="vote-btn interested"
                      onClick={() => submitVote(poll._id, true)}
                    >
                      <FaCheckCircle />
                      I'm Interested
                    </button>
                    <button
                      className="vote-btn not-interested"
                      onClick={() => submitVote(poll._id, false)}
                    >
                      <FaUsers />
                      Not for Me
                    </button>
                  </div>
                )}
              </div>

              {poll.assignedTo && (
                <div className="assignment-result">
                  <div className="assigned-banner">
                    <FaCheckCircle className="assigned-icon" />
                    <span>Assigned to: {poll.assignedTo.fullName}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeadPolling; 