'use client';

import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from '../../layout/Sidebar';
import ResponseViewer from '../response/ResponseViewer';
import { HttpRequest, HttpResponse } from '../../types/request';
import './MainLayout.scss';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [currentResponse, setCurrentResponse] = useState<HttpResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Handle sending requests from the modal
  const handleSendRequest = async (request: HttpRequest): Promise<void> => {
    setIsLoading(true);
    setError(undefined);
    const startTime = Date.now();

    try {
      // Prepare request configuration
      const config = {
        method: request.method,
        url: request.url,
        timeout: 30000, // 30 second timeout
        headers: {} as Record<string, string>,
        params: {} as Record<string, string>,
        data: undefined as unknown
      };

      // Add headers if present
      if (request.headers && request.headers.length > 0) {
        request.headers.forEach(header => {
          if (header.key && header.enabled) {
            config.headers[header.key] = header.value;
          }
        });
      }

      // Add query parameters if present
      if (request.params && request.params.length > 0) {
        request.params.forEach(param => {
          if (param.key && param.enabled) {
            config.params[param.key] = param.value;
          }
        });
      }

      // Add body if present
      if (request.body && request.body.type === 'raw' && request.body.raw) {
        try {
          config.data = JSON.parse(request.body.raw);
          if (!config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json';
          }
        } catch {
          config.data = request.body.raw;
        }
      }

      // Send the request
      const response = await axios(config);
      const endTime = Date.now();

      // Calculate response size (approximate)
      const responseSize = JSON.stringify(response.data).length * 2; // rough estimate in bytes

      // Convert axios headers to Record<string, string>
      const responseHeaders: Record<string, string> = {};
      Object.entries(response.headers).forEach(([key, value]) => {
        responseHeaders[key] = String(value || '');
      });

      // Create HttpResponse object
      const httpResponse: HttpResponse = {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: response.data,
        responseTime: endTime - startTime,
        size: responseSize,
        timestamp: new Date().toISOString()
      };

      setCurrentResponse(httpResponse);
      
      // Save to history (you can implement this later)
      console.log('Request sent successfully:', request);
      console.log('Response received:', httpResponse);

    } catch (err: unknown) {
      const endTime = Date.now();
      
      if (axios.isAxiosError(err) && err.response) {
        // Server responded with error status
        const responseSize = err.response.data ? JSON.stringify(err.response.data).length * 2 : 0;
        
        // Convert axios headers to Record<string, string>
        const responseHeaders: Record<string, string> = {};
        Object.entries(err.response.headers).forEach(([key, value]) => {
          responseHeaders[key] = String(value || '');
        });
        
        const httpResponse: HttpResponse = {
          status: err.response.status,
          statusText: err.response.statusText,
          headers: responseHeaders,
          data: err.response.data,
          responseTime: endTime - startTime,
          size: responseSize,
          timestamp: new Date().toISOString()
        };
        
        setCurrentResponse(httpResponse);
      } else if (axios.isAxiosError(err) && err.request) {
        // Request was made but no response received
        setError('No response received from server. Please check the URL and try again.');
      } else {
        // Something else happened
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
      }
      
      console.error('Request failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-layout">
      {/* Sidebar */}
      <Sidebar onSendRequest={handleSendRequest} />
      
      {/* Main Content Area */}
      <main className="main-content">
        <div className="content-sections">
          {/* Request Section */}
          <div className="request-section">
            {children}
          </div>
          
          {/* Response Section */}
          <div className="response-section">
            <ResponseViewer 
              response={currentResponse}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
