import { useState, useMemo, useRef, useCallback, useEffect } from 'react';

/**
 * SearchableCodeSelect — a multi-select searchable dropdown for ICD codes.
 *
 * Props:
 *   codeMap        — object keyed by code string (from dx_map.json or px_map.json)
 *   selectedCodes  — string[] of currently selected codes
 *   onChange        — (codes: string[]) => void
 *   placeholder     — placeholder text for the search input
 *   label           — label text
 *   id              — unique HTML id
 *   noResultsText   — text shown when search yields no results
 *   selectedText    — template like "{count} kod seçildi"
 */
export default function SearchableCodeSelect({
    codeMap,
    selectedCodes,
    onChange,
    placeholder = 'Ara...',
    label,
    id,
    noResultsText = 'Sonuç bulunamadı',
    selectedText = '{count} kod seçildi',
    language = 'tr',
}) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    // Sorted code list (computed once per codeMap)
    const allCodes = useMemo(() => {
        return Object.keys(codeMap).sort((a, b) => a.localeCompare(b));
    }, [codeMap]);

    // Filtered codes based on query
    const filteredCodes = useMemo(() => {
        const selectedSet = new Set(selectedCodes);
        const qParts = query.toUpperCase().replace(/\./g, '').split(/\s+/).filter(Boolean);

        return allCodes
            .filter(code => {
                if (selectedSet.has(code)) return false;
                if (qParts.length === 0) return true;

                const entry = codeMap[code];
                const codeUpper = code.toUpperCase();
                const descText = (language === 'tr' && entry && entry.description_tr) ? entry.description_tr : (entry?.description || '');
                const descUpper = descText.toUpperCase();

                return qParts.every(part => codeUpper.includes(part) || descUpper.includes(part));
            })
            .slice(0, 100); // Limit for performance
    }, [allCodes, query, selectedCodes, codeMap, language]);

    // Select a code
    const handleSelect = useCallback((code) => {
        onChange([...selectedCodes, code]);
        setQuery('');
        inputRef.current?.focus();
    }, [selectedCodes, onChange]);

    // Remove a code
    const handleRemove = useCallback((code) => {
        onChange(selectedCodes.filter(c => c !== code));
    }, [selectedCodes, onChange]);

    // Handle keyboard in the input
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCodes.length > 0) {
                handleSelect(filteredCodes[0]);
            }
        }
        if (e.key === 'Escape') {
            setIsOpen(false);
            inputRef.current?.blur();
        }
        // Backspace when empty removes last selected code
        if (e.key === 'Backspace' && query === '' && selectedCodes.length > 0) {
            handleRemove(selectedCodes[selectedCodes.length - 1]);
        }
    }, [filteredCodes, handleSelect, handleRemove, query, selectedCodes]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="ccc-input-group ccc-code-select" ref={containerRef}>
            {label && (
                <label htmlFor={id} className="ccc-label">
                    {label}
                </label>
            )}

            {/* Selected chips */}
            {selectedCodes.length > 0 && (
                <div className="ccc-code-select__chips">
                    {selectedCodes.map(code => (
                        <span key={code} className="ccc-code-select__chip">
                            <span className="ccc-code-select__chip-code">{code}</span>
                            <button
                                type="button"
                                className="ccc-code-select__chip-remove"
                                onClick={() => handleRemove(code)}
                                aria-label={`Remove ${code}`}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Search input */}
            <div className="ccc-code-select__input-wrapper">
                <input
                    ref={inputRef}
                    id={id}
                    type="text"
                    className="ccc-code-select__input"
                    value={query}
                    onChange={e => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    autoComplete="off"
                    spellCheck={false}
                />
                <span className="ccc-code-select__count">
                    {selectedText.replace('{count}', selectedCodes.length)}
                </span>
            </div>

            {/* Dropdown */}
            {isOpen && query.length > 0 && (
                <div className="ccc-code-select__dropdown">
                    {filteredCodes.length > 0 ? (
                        filteredCodes.map(code => (
                            <button
                                key={code}
                                type="button"
                                className="ccc-code-select__option"
                                onClick={() => handleSelect(code)}
                                title={(language === 'tr' && codeMap[code]?.description_tr) ? codeMap[code].description_tr : (codeMap[code]?.description || '')}
                            >
                                <span className="ccc-code-select__option-code">{code}</span>
                                <span className="ccc-code-select__option-desc">
                                    {(language === 'tr' && codeMap[code]?.description_tr) ? codeMap[code].description_tr : (codeMap[code]?.description || '')}
                                </span>
                            </button>
                        ))
                    ) : (
                        <div className="ccc-code-select__no-results">
                            {noResultsText}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
