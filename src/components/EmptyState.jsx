import React from 'react';
import { ChefHat } from 'lucide-react';

const EmptyState = ({
  icon: Icon = ChefHat,
  title = 'No items found',
  description = 'Get started by creating your first item.',
  action = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white border border-dashed border-slate-200 rounded-2xl text-center my-6">
      <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
