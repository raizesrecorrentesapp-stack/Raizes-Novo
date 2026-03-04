
import React from 'react';

export const Logo: React.FC<{ className?: string; size?: number }> = ({ className = "", size = 32 }) => {
  return (
    <div
      className={`flex items-center justify-center bg-simplefy-primary rounded-xl shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <span className="text-white font-black text-xs">S</span>
    </div>
  );
};

export const LogoText: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <span className="font-normal text-xl tracking-tight text-white">
      Agenda<span className="font-bold">Simples</span>
    </span>
  </div>
);
