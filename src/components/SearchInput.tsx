import { useRef, useEffect } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder, className }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isUserTyping = useRef(false);

  // Solo actualizar el input si NO está siendo editado por el usuario
  useEffect(() => {
    if (!isUserTyping.current && inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isUserTyping.current = true;
    onChange(e.target.value);
    
    // Marcar que dejó de escribir después de un momento
    setTimeout(() => {
      isUserTyping.current = false;
    }, 100);
  };

  return (
    <input
      ref={inputRef}
      defaultValue={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      autoComplete="off"
    />
  );
}