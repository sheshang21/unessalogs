import React from 'react';
export function Toast({ message, onClose }: { message: string; onClose?: ()=>void }) {
  if (!message) return null;
  return (
    <div className="fixed right-6 bottom-6 bg-black/90 text-white px-4 py-2 rounded-md z-50">
      <div className="flex items-center gap-3">
        <div>{message}</div>
        <button onClick={onClose} aria-label="close">✕</button>
      </div>
    </div>
  );
}
