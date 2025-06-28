import React from 'react';
import './AnalyzerTool.css';

// This is the same results display component from our previous App.js
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

// This is the main tool component
const AnalyzerTool = ({
  loading,
  error,
  analysisResult,
  fileName,
  jobDescriptionText,
  handleFileChange,
  handleJobDescriptionChange,
  handleSubmit
}) => {
  return (
    <div id="analyzer" className="analyzer-section">
        <h2>Let's Get Started</h2>
        <p className="analyzer-subtitle">Upload your resume and the job description to see the magic happen.</p>
        <main className="analyzer-main">
            <form onSubmit={handleSubmit} className="analyzer-form">
            <div className="inputs-grid">
                <div className="file-input-container">
                <label htmlFor="resume-upload" className="file-label">
                    {fileName || "1. Upload Your Resume"}
                </label>
                <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    disabled={loading}
                />
                </div>
                <textarea
                placeholder="2. Paste the full job description here..."
                value={jobDescriptionText}
                onChange={handleJobDescriptionChange}
                disabled={loading}
                />
            </div>
            <button type="submit" disabled={loading}>
                {loading ? (
                <>
                    <span className="loader"></span>
                    Analyzing...
                </>
                ) : 'Generate Analysis'}
            </button>
            </form>

            {error && <div className="error-message">{error}</div>}
            
            {analysisResult && <ResultsDisplay data={analysisResult} />}
        </main>
    </div>
  );
};

export default AnalyzerTool; 