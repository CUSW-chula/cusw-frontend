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
            className="bg-gray-300 text-black font-bold p-4 rounded-lg shadow-lg flex items-center justify-center">
            {index + 1}
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-4">
        <button
          type="button"
          onClick={handleDecrease}
          className="bg-red text-black py-2 px-4 rounded hover:bg-orange transition">
          <h4>Decrease</h4>
        </button>
        <button
          type="button"
          onClick={handleIncrease}
          className="bg-green text-black py-2 px-4 rounded hover:bg-greenLight transition">
          <p>Increase เพิ่ม</p>
        </button>
      </div>
    </div>
  );
};

export default CounterGrid;
