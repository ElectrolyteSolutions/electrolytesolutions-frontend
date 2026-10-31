import React from 'react';

const Button = ({
  buttontype="button",
  onClick = null,
  icon = null,
  label = null,
  type = "light",
  loading=false,
  classname="py-1.5",
  ...props
}) => {
  // Map types to specific Tailwind color classes
  const typeStyles = {
    danger: "bg-red-600 text-white hover:bg-red-700 border-red-600",
    success: "bg-green-600 text-white hover:bg-green-700 border-green-600",
    primary: "bg-blue-600 text-white hover:bg-blue-700 border-blue-600",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 border-gray-600",
    light: "bg-white text-black hover:opacity-80 border-white"
  };

  // Fallback to light or standard style if type doesn't match
  const selectedTypeStyle = typeStyles[type] || typeStyles.light;

  return (
    <button
      {...props}
      type={buttontype}
      onClick={onClick}
      className={`inline-flex ${classname} items-center justify-between gap-1 px-2.5 rounded-md text-xs font-semibold transition-all cursor-pointer shadow-sm border-1 text-nowrap ${selectedTypeStyle}`}
    >
    {loading ? <div className='loader'/>: icon}
      {label}
    </button>
  );
};

export default Button;
