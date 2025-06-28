import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

// Import Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AnalyzerTool from './components/AnalyzerTool';
import Footer from './components/Footer';

// A component to render the beautiful results
const ResultsDisplay = ({ data }) => (
  <div className="results-container">
    <h2>Analysis Report</h2>
    <div className="main-metrics">
      <div className="score-card">
        <h3>ATS Score</h3>
        <p className="score">{data.ats_score}%</p>
        <p className="score-subtitle">Match Rate</p>
      </div>
      <div className="summary-card">
        <h3>Executive Summary</h3>
        <p>{data.summary}</p>
      </div>
    </div>
    <div className="skills-grid">
      <div className="skills-card">
        <h3>✅ Found Keywords</h3>
        <ul>
          {data.present_keywords.map((skill, index) => (
            <li key={`present-${index}`} className="skill-present">{skill}</li>
          ))}
        </ul>
      </div>
      <div className="skills-card">
        <h3>❌ Missing Keywords</h3>
        <ul>
          {data.missing_keywords.map((skill, index) => (
            <li key={`missing-${index}`} className="skill-missing">{skill}</li>
          ))}
        </ul>
      </div>
    </div>
    <div className="suggestions-card">
      <h3>💡 Actionable Suggestions</h3>
      <ul>
        {data.suggestions.map((suggestion, index) => (
          <li key={`suggestion-${index}`} className="suggestion">
            <p><strong>Original:</strong> "{suggestion.original_text}"</p>
            <p><strong>Suggestion:</strong> {suggestion.suggested_improvement}</p>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

function App() {
  // State is "lifted" to the parent component
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  // Handlers are defined in the parent
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setResumeFile(file);
      setFileName(file.name);
    }
  };
  
  const handleJobDescriptionChange = (event) => {
    setJobDescriptionText(event.target.value);
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!resumeFile || !jobDescriptionText) {
      setError('Please upload a resume and paste the job description.');
      return;
    }

    setLoading(true);
    setAnalysisResult(null);
    setError('');

    const formData = new FormData();
    formData.append('resume_file', resumeFile);
    formData.append('job_description', jobDescriptionText);

    try {
      const response = await axios.post('http://localhost:8000/analyze_resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAnalysisResult(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'An unknown error occurred. Is the backend server running?';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <Navbar />
      <Hero />
      <AnalyzerTool
        // Pass all state and handlers down as props
        loading={loading}
        error={error}
        analysisResult={analysisResult}
        fileName={fileName}
        jobDescriptionText={jobDescriptionText}
        handleFileChange={handleFileChange}
        handleJobDescriptionChange={handleJobDescriptionChange}
        handleSubmit={handleSubmit}
      />
      <Footer />
    </div>
  );
}

export default App;
