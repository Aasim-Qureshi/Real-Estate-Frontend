import React from 'react';
import { useProgress } from '../contexts/ProgressContext';

const TabProgressMonitor: React.FC = () => {
  const { progress } = useProgress();

  if (!progress.isProcessing || !progress.numTabs || progress.numTabs <= 1) {
    return null;
  }

  const tabIds = Object.keys(progress.tabProgresses).map(Number).sort((a, b) => a - b);

  if (tabIds.length === 0) {
    return null;
  }

  const getTabStatusColor = (status: string) => {
    switch (status) {
      case 'TAB_STARTED':
      case 'RECORD_STARTED':
      case 'STEP_STARTED':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'COMPLETED':
      case 'TAB_COMPLETED':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'FAILED':
      case 'TAB_FAILED':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getTabIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'TAB_COMPLETED':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'FAILED':
      case 'TAB_FAILED':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          Tab Progress ({progress.numTabs} tabs)
        </h4>
        <span className="text-xs text-gray-500">
          Active tabs: {tabIds.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {tabIds.map(tabId => {
          const tabProgress = progress.tabProgresses[tabId];
          if (!tabProgress) return null;

          return (
            <div
              key={tabId}
              className={`p-3 rounded-lg border-2 ${getTabStatusColor(tabProgress.status)} transition-all`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getTabIcon(tabProgress.status)}
                  <span className="text-sm font-semibold">
                    Tab {tabId}
                  </span>
                </div>
                {tabProgress.percentage !== undefined && (
                  <span className="text-xs font-medium">
                    {tabProgress.percentage.toFixed(0)}%
                  </span>
                )}
              </div>

              <p className="text-xs mb-2 line-clamp-2">
                {tabProgress.message}
              </p>

              {tabProgress.status !== 'COMPLETED' && tabProgress.status !== 'FAILED' && tabProgress.percentage !== undefined && (
                <div className="w-full bg-white bg-opacity-50 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-300 bg-current"
                    style={{ width: `${tabProgress.percentage}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TabProgressMonitor;