import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles.css';

const API_URL = 'http://localhost:3500/api';

const ApiTest: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [responseData, setResponseData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        setApiStatus('loading');
        const response = await axios.get(`${API_URL}/categories`);
        setResponseData(response.data);
        setApiStatus('online');
        setError(null);
      } catch (err) {
        setApiStatus('offline');
        if (axios.isAxiosError(err)) {
          if (err.code === 'ECONNREFUSED') {
            setError(`API server is not running or not accessible at ${API_URL}`);
          } else {
            setError(`Error: ${err.message}`);
          }
        } else {
          setError('Unknown error occurred');
        }
      }
    };

    checkApiStatus();
  }, []);

  return (
    <div className="api-test-container">
      <h2>API Connection Test</h2>
      
      <div className="api-status">
        <span>API Status:</span>
        {apiStatus === 'loading' && <span className="status loading">Checking...</span>}
        {apiStatus === 'online' && <span className="status online">Online</span>}
        {apiStatus === 'offline' && <span className="status offline">Offline</span>}
      </div>

      {error && (
        <div className="api-error">
          <h3>Error:</h3>
          <p>{error}</p>
          <div className="troubleshooting">
            <h4>Troubleshooting Steps:</h4>
            <ol>
              <li>Make sure your API server is running at <code>{API_URL}</code></li>
              <li>Check if CORS is properly configured on your server</li>
              <li>Verify network connectivity between client and server</li>
              <li>Check browser console for additional errors</li>
            </ol>
          </div>
        </div>
      )}

      {apiStatus === 'online' && responseData && (
        <div className="api-response">
          <h3>Response Data:</h3>
          <pre>{JSON.stringify(responseData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ApiTest; 