import React from 'react';
import { type Report } from '../types/reports';

interface ReportCardProps {
  report: Report;
}

const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSubmissionStatusCapsule = () => {
    if (report.form_id) {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full border border-green-200">
          Submitted
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full border border-red-200">
          Not Submitted
        </span>
      );
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h5 className="font-medium text-gray-800 mb-2">
            {report.report_title || `Report ${report.row_number}`}
          </h5>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
            {report.final_value && (
              <div>
                <span className="font-medium">Final Value:</span> {report.final_value}
              </div>
            )}
            {/* Show form_id if available */}
            {report.form_id && (
              <div>
                <span className="font-medium">Form ID:</span> {report.form_id}
              </div>
            )}
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            Created: {formatDate(report.ts)}
          </p>
        </div>
        
        {/* Submission Status Capsule */}
        <div className="ml-4">
          {getSubmissionStatusCapsule()}
        </div>
      </div>
    </div>
  );
};

export default ReportCard;