import React from 'react';

const Navbar = ({ step }) => {
  const steps = [
    'Unit Information',
    'Results'
  ];

  return (
    <nav className="w-full">
      <ul className="flex justify-between">
        {steps.map((label, index) => (
          <li
            key={index}
            className={`flex-1 text-center py-2 cursor-pointer ${
              step === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
            }`}
          >
            {label}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
