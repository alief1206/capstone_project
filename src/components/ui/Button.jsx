import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '' }) => {
  const variantStyles = variant === 'primary' 
    ? "bg-[#14AE5C] text-white" 
    : "bg-transparent text-[#14AE5C] border border-[#14AE5C]";

  return (
    <button
      onClick={onClick}
      className={`w-[358px] h-[59px] font-medium text-[16px] rounded-[20px] flex items-center justify-center transition-all active:scale-95 ${variantStyles} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;