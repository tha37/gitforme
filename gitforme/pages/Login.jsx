import React from 'react';
import { GitHubIcon } from '../src/components/icons';

const Login = () => {
  const handleGitHubLogin = () => {
    window.location.href = 'http://localhost:3000/api/auth/github';
  };

  return (
    <div className="form_container text-center max-w-md mx-auto">
      <h2>Login to Your Account</h2>
      <p className="my-4">Please log in using your GitHub account to continue.</p>
      <button 
        type="button" 
        className="github-btn flex items-center gap-2"
        onClick={handleGitHubLogin}
      >
        <GitHubIcon />
        Login with GitHub
      </button>
    </div>
  );
};

export default Login;
