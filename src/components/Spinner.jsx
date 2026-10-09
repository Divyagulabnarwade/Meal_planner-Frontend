import React from 'react';

const Spinner = ({ size = 'md', text = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className={`${sizeClasses[size]} border-slate-200 border-t-brand-600 rounded-full animate-spin`}
        role="status"
        aria-label="loading"
      />
      {text && <p className="mt-3 text-sm text-slate-500 font-medium">{text}</p>}
    </div>
  );
};

export default Spinner;
