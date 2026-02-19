import { useState, useCallback } from 'react';
import { Form, InputGroup, Badge, Button } from 'react-bootstrap';

/**
 * Chips/tags input: type and press Enter to add; click chip to remove.
 * value/onChange: array of strings.
 */
export function ChipsInput({
  value = [],
  onChange,
  placeholder = 'Add item and press Enter',
  ariaLabel = 'Chips input',
  disabled,
  className = '',
  size,
}) {
  const [inputVal, setInputVal] = useState('');

  const chips = Array.isArray(value) ? value : [];

  const addChip = useCallback(
    (text) => {
      const t = String(text).trim();
      if (!t || chips.includes(t)) return;
      onChange([...chips, t]);
      setInputVal('');
    },
    [chips, onChange]
  );

  const removeChip = useCallback(
    (index) => {
      const next = chips.filter((_, i) => i !== index);
      onChange(next);
    },
    [chips, onChange]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addChip(inputVal);
    }
  };

  return (
    <div className={className}>
      <div className="d-flex flex-wrap gap-2 mb-2">
        {chips.map((chip, i) => (
          <Badge
            key={`${chip}-${i}`}
            bg="primary"
            className="d-inline-flex align-items-center gap-1 px-2 py-2"
            style={{ fontSize: '0.875rem' }}
          >
            {chip}
            <button
              type="button"
              className="btn btn-link p-0 border-0 bg-transparent text-white text-decoration-none ms-1"
              style={{ fontSize: '1rem', lineHeight: 1 }}
              onClick={() => removeChip(i)}
              aria-label={`Remove ${chip}`}
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
      <InputGroup size={size}>
        <Form.Control
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={ariaLabel}
          className="ds-focus-ring"
        />
        <Button
          variant="outline-secondary"
          type="button"
          onClick={() => addChip(inputVal)}
          disabled={disabled}
        >
          Add
        </Button>
      </InputGroup>
    </div>
  );
}
