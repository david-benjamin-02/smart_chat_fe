import React, { useState, useRef, useEffect } from 'react';
import './LanguageSelector.css';

const languages = {
  en: { label: 'English', icon: 'A' },
  ta: { label: 'Tamil', icon: 'த' },
  hi: { label: 'Hindi', icon: 'हि' },
};

export default function LanguageSelector({
  currentLang,
  onLangChange,
  onHighlightChange,
  clearHighlight,
  disabled = false,
  onPendingConfirmChange, // ✅ add this
}) {

  const [internalLang, setInternalLang] = useState(currentLang || 'en');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const longPressTimeout = useRef(null);
  const containerRef = useRef(null);
  const longPressTriggered = useRef(false);
  const [pendingConfirm, setPendingConfirm] = useState(false);

  // Sync internal state with external currentLang prop
  useEffect(() => {
    setInternalLang(currentLang);
  }, [currentLang]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Expose method to clear highlight to parent
  useEffect(() => {
    if (clearHighlight) {
      clearHighlight(() => setIsHighlighted(false));
    }
  }, [clearHighlight]);

  useEffect(() => {
    if (typeof onPendingConfirmChange === 'function') {
      onPendingConfirmChange(pendingConfirm);
    }
  }, [pendingConfirm]);

  const handleSelect = (langCode) => {
    setInternalLang(langCode);
    setShowDropdown(false);
    setIsHighlighted(true);
    setPendingConfirm(true); // ✅ block mic/send until confirmed
    if (onLangChange) onLangChange(langCode); // still notify parent
    if (onHighlightChange) onHighlightChange(true);
  };


  const handleClick = () => {
    if (!longPressTriggered.current) {
      const nextHighlight = !isHighlighted;
      setIsHighlighted(nextHighlight);
      setShowDropdown(false);
      if (onHighlightChange) onHighlightChange(nextHighlight);

      // ✅ Disable mic on highlight (language "active" state)
      setPendingConfirm(true);
    }
    longPressTriggered.current = false;
  };


  const handleMouseDown = () => {
    longPressTriggered.current = false;
    longPressTimeout.current = setTimeout(() => {
      longPressTriggered.current = true;
      setShowDropdown(true);
    }, 500);
  };

  const handleMouseUp = () => {
    clearTimeout(longPressTimeout.current);
  };

  return (
    <div
      ref={containerRef}
      className={`position-relative me-2 language-selector ${isHighlighted && showDropdown === false ? 'highlighted' : ''
        }`}
    >
      <button
        className="btn p-0 border-0 bg-transparent"
        onClick={disabled ? undefined : handleClick}
        onMouseDown={disabled ? undefined : handleMouseDown}
        onMouseUp={disabled ? undefined : handleMouseUp}
        onTouchStart={disabled ? undefined : handleMouseDown}
        onTouchEnd={disabled ? undefined : handleMouseUp}
        disabled={disabled}
        style={{ opacity: disabled ? 0.5 : 1 }}
        onDoubleClick={() => setShowDropdown(true)}
      >

        <span className="language-icon">{languages[internalLang].icon}</span>
      </button>
      {!disabled && showDropdown && (
        <ul className="dropdown-menu show position-absolute bottom-100 mb-1 shadow">
          {Object.entries(languages).map(([code, { label, icon }]) => (
            <li key={code}>
              <button
                className={`dropdown-item d-flex align-items-center ${code === internalLang ? 'highlighted' : ''
                  }`}
                onClick={() => handleSelect(code)}
              >
                <span className="language-icon me-2">{icon}</span>
                {label}
              </button>
            </li>
          ))}
        </ul>

      )}
    </div>
  );
}
