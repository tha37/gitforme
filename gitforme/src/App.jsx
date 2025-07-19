import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SpeedInsights } from "@vercel/speed-insights/react"; 
import GitformeUi from './components/gitformeUi';
import Login from '../pages/Login';
import RepoPage from '../pages/gitpage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<GitformeUi />} />
        <Route path="/:username/:reponame" element={<GitformeUi />} /> 
        <Route path="/login" element={<Login />} />
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
        <SpeedInsights /> 
    </>
  );
}

export default App;
