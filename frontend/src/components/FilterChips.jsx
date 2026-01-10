import './FilterChips.css';

export default function FilterChips({ options, activeFilter, onFilterChange }) {
    return (
        <div className="filter-chips">
            {options.map((option) => (
                <button
                    key={option.value}
                    className={`chip ${activeFilter === option.value ? 'active' : ''}`}
                    onClick={() => onFilterChange(option.value)}
                >
                    {option.icon && <span className="chip-icon">{option.icon}</span>}
                    {option.label}
                    {option.hasDropdown && (
                        <svg className="dropdown-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    )}
                </button>
            ))}
        </div>
    );
}
