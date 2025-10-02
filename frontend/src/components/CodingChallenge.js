import React from 'react';

const CodingChallenge = ({ problem, onCodeRun, onCodeSubmit }) => {
  return (
    <div className="coding-challenge-view">
      <div className="problem-description">
        <h2>{problem.title}</h2>
        <p>{problem.description}</p>
      </div>
      <div className="coding-area">
        <div className="code-editor-container">
          <textarea
            id="code-editor"
            spellCheck="false"
            defaultValue={problem.starterCode || ''}
          ></textarea>
        </div>
        <div className="coding-actions">
          <button onClick={onCodeRun} className="btn btn-secondary">
            <i data-lucide="play"></i> Run Code
          </button>
          <button onClick={onCodeSubmit} className="btn btn-primary">
            <i data-lucide="check-circle"></i> Submit Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodingChallenge;