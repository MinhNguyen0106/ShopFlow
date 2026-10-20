'use client';

import React, { useState } from 'react';
import { X, Minus, Maximize2 } from 'lucide-react';

interface MacTrafficLightsProps {
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  className?: string;
}

export function MacTrafficLights({
  onClose,
  onMinimize,
  onMaximize,
  className = '',
}: MacTrafficLightsProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Red / Close button */}
      <button
        type="button"
        onClick={onClose}
        title="Đóng cửa sổ"
        className="group relative flex h-3 w-3 items-center justify-center rounded-full bg-[#FF5F56] border border-red-500/40 shadow-xs cursor-pointer hover:opacity-90 transition-opacity focus:outline-none"
      >
        {isHovered && (
          <X className="h-2 w-2 text-neutral-800 opacity-70 group-hover:opacity-100" />
        )}
      </button>

      {/* Yellow / Minimize button */}
      <button
        type="button"
        onClick={onMinimize}
        title="Thu nhỏ"
        className="group relative flex h-3 w-3 items-center justify-center rounded-full bg-[#FFBD2E] border border-amber-500/40 shadow-xs cursor-pointer hover:opacity-90 transition-opacity focus:outline-none"
      >
        {isHovered && (
          <Minus className="h-2 w-2 text-neutral-800 opacity-70 group-hover:opacity-100" />
        )}
      </button>

      {/* Green / Maximize button */}
      <button
        type="button"
        onClick={onMaximize}
        title="Mở rộng toàn màn hình"
        className="group relative flex h-3 w-3 items-center justify-center rounded-full bg-[#27C93F] border border-emerald-500/40 shadow-xs cursor-pointer hover:opacity-90 transition-opacity focus:outline-none"
      >
        {isHovered && (
          <Maximize2 className="h-1.5 w-1.5 text-neutral-800 opacity-70 group-hover:opacity-100" />
        )}
      </button>
    </div>
  );
}
