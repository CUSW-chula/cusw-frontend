'use client';

const Subtask: React.FC = () => {
    return (<div className="flex items-center border-l-4 border-blue-200 pl-2 py-1">
    <span className="text-gray-700 font-medium">Subtask</span>

    <div className="flex-grow" />

    <div className="relative">
        <select className="appearance-none bg-gray-100 border border-gray-300 text-gray-700 py-1 px-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Sort By: Start Date</option>

        </select>
    </div>

    <button type="button" className="ml-3 flex items-center bg-gray-100 border border-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
        + Add Subtask
    </button>
</div>
    );
}

export default Subtask;