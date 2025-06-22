import { useEffect, useRef, useState } from 'react';

interface EditableUsernameProps {
  username: string;
  onUsernameChange: (newUsername: string) => void;
}

export function EditableUsername({
  username,
  onUsernameChange,
}: EditableUsernameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(username);
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(username);
  }, [username]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== username) {
      onUsernameChange(trimmedValue);
    } else if (!trimmedValue) {
      setEditValue(username); // 空の場合は元の値に戻す
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(username);
    setIsEditing(false);
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isComposing) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape' && !isComposing) {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type='text'
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        className='bg-gray-700 text-white text-sm px-2 py-1 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-24 max-w-32'
        placeholder='Your name'
      />
    );
  }

  return (
    <button
      type='button'
      onClick={handleStartEdit}
      className='text-sm text-gray-400 hover:text-gray-300 transition-colors cursor-pointer'
      title='Click to edit username'
    >
      as {username}
    </button>
  );
}
