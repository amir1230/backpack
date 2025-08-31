import React from 'react';

export default function IngestionDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">🔄 Ingestion Dashboard</h1>
      <p className="text-gray-600 mb-6">Monitor and manage data ingestion processes for TripWise</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Jobs</h3>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="text-2xl font-bold text-green-600">3</div>
          <p className="text-gray-600 text-sm">Currently running</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Completed</h3>
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          </div>
          <div className="text-2xl font-bold text-blue-600">127</div>
          <p className="text-gray-600 text-sm">Total processed</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Failed</h3>
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
          <div className="text-2xl font-bold text-red-600">2</div>
          <p className="text-gray-600 text-sm">Need attention</p>
        </div>
      </div>
      
      <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Machu Picchu - Attractions</div>
              <div className="text-sm text-gray-600">Processing 45 locations</div>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Running</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Rio de Janeiro - Restaurants</div>
              <div className="text-sm text-gray-600">Completed 123 locations</div>
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Complete</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Buenos Aires - Hotels</div>
              <div className="text-sm text-gray-600">Processing 67 locations</div>
            </div>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">Queued</span>
          </div>
        </div>
      </div>
    </div>
  );
}