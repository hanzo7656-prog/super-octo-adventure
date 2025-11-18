import React from 'react'

const Suggestions = ({ suggestions, onSuggestionClick }) => {
  if (suggestions.length === 0) return null

  return (
    <div className="suggestions-container">
      <div className="suggestions-grid">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="suggestion-card"
            onClick={() => onSuggestionClick(suggestion)}
          >
            <span className="suggestion-text">{suggestion}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}

export default Suggestions
