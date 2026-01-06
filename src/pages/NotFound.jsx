import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <p className="text-2xl font-semibold text-gray-700">Page Not Found</p>
        </div>
        
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Sorry, the page you are looking for does not exist. Please check the URL and try again.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Button 
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="go-home-button"
          >
            Go to Home
          </Button>
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            data-testid="go-back-button"
          >
            Go Back
          </Button>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>Current URL: <span className="font-mono text-gray-700">{window.location.pathname}</span></p>
        </div>
      </div>
    </div>
  );
}
