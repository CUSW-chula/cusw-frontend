'use client';

import type React from 'react';
import { useState } from 'react';

const CounterGrid: React.FC = () => {
  const [count, setCount] = useState(10); // You can adjust the initial count or make it dynamic

  const handleIncrease = () => setCount(count + 1);
  const handleDecrease = () => count > 1 && setCount(count - 1);

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: count }, (_, index) => (
          <div
            key={index.toString()}
            className="bg-blue-500 text-white font-bold p-4 rounded-lg shadow-lg flex items-center justify-center">
            {index + 1}
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-4">
        <button
          type="button"
          onClick={handleDecrease}
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition">
          Decrease
        </button>
        <button
          type="button"
          onClick={handleIncrease}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition">
          Increase
        </button>
      </div>
    </div>
  );
};

export default CounterGrid;
