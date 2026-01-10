import { useState } from 'react';
import './KeywordInput.css';

export default function KeywordInput({ keywords, onChange, placeholder = "Add keyword..." }) {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            if (!keywords.includes(inputValue.trim())) {
                onChange([...keywords, inputValue.trim()]);
            }
            setInputValue('');
        } else if (e.key === 'Backspace' && !inputValue && keywords.length > 0) {
            onChange(keywords.slice(0, -1));
        }
    };

    const removeKeyword = (keywordToRemove) => {
        onChange(keywords.filter(k => k !== keywordToRemove));
    };

    return (
        <div className="keyword-input-container">
            <div className="keyword-chips">
                {keywords.map((keyword) => (
                    <span key={keyword} className="keyword-chip">
                        {keyword}
                        <button
                            className="keyword-remove"
                            onClick={() => removeKeyword(keyword)}
                            aria-label={`Remove ${keyword}`}
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    className="keyword-input"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={keywords.length === 0 ? placeholder : ''}
                />
            </div>
        </div>
    );
}
