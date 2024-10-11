import React from 'react';

// Reusable component for each activity log item
const ActivityLogItem = ({ name, action, exStatus, newStatus, timeAgo }) => (
  <div className="text-m text-gray-800">
    <span className="font-medium">{name}</span> {action}
    <span className='text-gray-800 font-medium ml-1'>{exStatus}</span>
    {/* <span className='ml-1'>to</span>  */}
    <span className='text-gray-800 font-medium ml-1'>{newStatus}</span>
    <span className="text-gray-500 ml-2">{timeAgo}</span>
  </div>
);

// Main ActivityLogs component
const ActivityLogs = () => {
  return (
    <div className="bg-white p-6 space-y-2">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Activity</h3>
      <ActivityLogItem
        name="Banyaphon"
        action="changed status from"
        exStatus="under review"
        newStatus="to done"
        timeAgo="5 min ago"
      />
      <ActivityLogItem
        name="Banyaphon"
        action="changed status from"
        exStatus="under review"
        newStatus="to recheck"
        timeAgo="5 min ago"
      />
      <ActivityLogItem
        name="Banyaphon"
        action="changed status from"
        exStatus="assigned"
        newStatus="to under review"
        timeAgo="5 min ago"
      />
      <ActivityLogItem
        name="Banyaphon"
        action="changed status from"
        exStatus="unassigned"
        newStatus="to assigned"
        timeAgo="5 min ago"
      />
      <ActivityLogItem
        name="Banyaphon"
        action="assigned"
        newStatus="Thanapat"
        exStatus={undefined}
        timeAgo="5 min ago"
        />
      <ActivityLogItem
        name="Banyaphon"
        action="assigned"
        exStatus={undefined}
        newStatus="Pongsakorn"
        timeAgo="5 min ago"
      />
      <ActivityLogItem
        name="Banyaphon"
        action="added tag to task"
        exStatus={undefined}
        newStatus={undefined}
        timeAgo="16 h ago"
      />
      <ActivityLogItem
        name="Banyaphon"
        action="added tag to task"
        exStatus={undefined}
        newStatus={undefined}
        timeAgo="16 h ago"
      />
      <ActivityLogItem
        name="Banyaphon"
        action="created task"
        exStatus={undefined}
        newStatus={undefined}
        timeAgo="5 d ago"
      />
    </div>
  );
};

export default ActivityLogs;
