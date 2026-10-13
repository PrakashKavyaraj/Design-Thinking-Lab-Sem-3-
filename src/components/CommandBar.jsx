import React, { useState } from 'react';

export function CommandBar({ onExecuteCommand }) {
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const result = onExecuteCommand(input);
    setFeedback(result);
    setInput('');

    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  const handleChipClick = (cmd) => {
    const result = onExecuteCommand(cmd);
    setFeedback(result);
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  return (
    <div className="command-bar-wrapper">
      <form className="command-form" onSubmit={handleSubmit}>
        <div className="command-input-container">
          <span className="command-icon">💬</span>
          <input
            type="text"
            className="command-input"
            placeholder="Type command, e.g. 'make it rain', 'spawn 15 rabbits', 'start drought', 'night mode'..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-command">Execute</button>
      </form>

      <div className="command-chips">
        <span className="chips-label">Try:</span>
        <button className="chip" onClick={() => handleChipClick('make it rain')}>🌧️ Rain</button>
        <button className="chip" onClick={() => handleChipClick('start drought')}>🌵 Drought</button>
        <button className="chip" onClick={() => handleChipClick('spawn 10 rabbits')}>🐇 +10</button>
      </div>

      {feedback && (
        <div className={`command-feedback ${feedback.success ? 'feedback-success' : 'feedback-error'}`}>
          {feedback.message}
        </div>
      )}
    </div>
  );
}
