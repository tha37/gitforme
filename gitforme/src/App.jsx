import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Component Imports (cleaned up)
import GitformeUi from './components/gitformeUi';
import Login from '../pages/Login';
import RepoPage from '../pages/gitpage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      <Routes>
        {/* Main single-page app */}
        
        <Route path="/" element={<GitformeUi />} />
<Route path="/:username/:reponame" element={<GitformeUi />} />  // Point to same component

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        
        {/* Repository details */}
        <Route path="/:username/:reponame" element={<RepoPage />} />
        
        {/* Protected routes (if needed later) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <div>Dashboard coming soon...</div>
            </ProtectedRoute>
          } 
        />

        {/* 404 fallback */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
      
      <ToastContainer 
        position="bottom-right" 
        autoClose={5000} 
        hideProgressBar={false} 
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;
