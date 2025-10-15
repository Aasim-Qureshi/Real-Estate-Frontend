import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import UploadWithExcel from './components/UploadWithExcel';
import ViewReports from './components/ViewReports';
import { SocketProvider } from './contexts/SocketContext';
import { ProgressProvider } from './contexts/ProgressContext';

// Placeholder components for your pages
const Dashboard = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
    <p className="text-gray-600">Welcome to your Real Estate Dashboard</p>
  </div>
);

function App() {
  return (
    <SocketProvider>
      <ProgressProvider>
        <Router>
          <div className="flex">
            <Sidebar />
            <main className="ml-64 flex-1 min-h-screen bg-gray-50">
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/reports/view" element={<ViewReports />} />
                <Route path="/reports/upload" element={<UploadWithExcel />} />
                <Route path="/" element={<Dashboard />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ProgressProvider>
    </SocketProvider>
  );
}

export default App;