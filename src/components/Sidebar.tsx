// components/Sidebar.jsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HiChartBar, 
  HiViewGrid, 
  HiDocumentReport, 
  HiUpload,
  HiChevronDown,
  HiChevronUp 
} from 'react-icons/hi';

const Sidebar = () => {
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const location = useLocation();

  const toggleReports = () => {
    setIsReportsOpen(!isReportsOpen);
  };

  const isActiveLink = (path: any) => {
    return location.pathname === path ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50';
  };

  return (
    <div className="w-64 bg-white h-screen shadow-lg fixed left-0 top-0 overflow-y-auto">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <HiChartBar className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800">Real Estate App</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {/* Dashboard Link */}
          <li>
            <Link
              to="/dashboard"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActiveLink('/dashboard')}`}
            >
              <HiViewGrid className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
          </li>

          {/* Real Estate Reports Dropdown */}
          <li>
            <button
              onClick={toggleReports}
              className="flex items-center justify-between w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <HiDocumentReport className="w-5 h-5" />
                <span className="font-medium">Real Estate Reports</span>
              </div>
              {isReportsOpen ? (
                <HiChevronUp className="w-4 h-4" />
              ) : (
                <HiChevronDown className="w-4 h-4" />
              )}
            </button>

            {/* Dropdown Menu */}
            {isReportsOpen && (
              <ul className="mt-2 ml-8 space-y-1">
                <li>
                  <Link
                    to="/reports/view"
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${isActiveLink('/reports/view')}`}
                  >
                    <HiViewGrid className="w-4 h-4" />
                    <span>View Reports</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/reports/upload"
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${isActiveLink('/reports/upload')}`}
                  >
                    <HiUpload className="w-4 h-4" />
                    <span>Upload With Excel</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;