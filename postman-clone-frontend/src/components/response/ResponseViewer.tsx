'use client';

import React, { useState } from 'react';
import { Clock, FileText, Hash, Eye, Code, Download } from 'lucide-react';
import { HttpResponse } from '../../types/request';
import './ResponseViewer.scss';

interface ResponseViewerProps {
  response: HttpResponse | null;
  isLoading: boolean;
  error?: string;
}

const ResponseViewer: React.FC<ResponseViewerProps> = ({
  response,
  isLoading,
  error
}) => {
  const [activeTab, setActiveTab] = useState<'body' | 'headers' | 'raw'>('body');
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');

  // Format JSON with syntax highlighting
  const formatJson = (data: unknown): string => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  // Get status color based on status code
  const getStatusColor = (status: number): string => {
    if (status >= 200 && status < 300) return 'success';
    if (status >= 300 && status < 400) return 'warning';
    if (status >= 400 && status < 500) return 'error';
    if (status >= 500) return 'error';
    return 'default';
  };

  // Format response time
  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Format response size
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Download response as file
  const downloadResponse = () => {
    if (!response) return;
    
    const blob = new Blob([formatJson(response.data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="response-viewer">
        <div className="response-header">
          <h3>Response</h3>
        </div>
        <div className="response-loading">
          <div className="loading-spinner"></div>
          <p>Sending request...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="response-viewer">
        <div className="response-header">
          <h3>Response</h3>
        </div>
        <div className="response-error">
          <div className="error-icon">⚠️</div>
          <h4>Request Failed</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!response) {
    return (
      <div className="response-viewer">
        <div className="response-header">
          <h3>Response</h3>
        </div>
        <div className="response-empty">
          <div className="empty-icon">📤</div>
          <h4>No Response Yet</h4>
          <p>Send a request to see the response here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="response-viewer">
      {/* Response Header */}
      <div className="response-header">
        <h3>Response</h3>
        <div className="response-actions">
          <button onClick={downloadResponse} className="btn-action" title="Download Response">
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Response Status Bar */}
      <div className="response-status">
        <div className="status-info">
          <span className={`status-code ${getStatusColor(response.status)}`}>
            {response.status} {response.statusText}
          </span>
          <div className="response-meta">
            <span className="meta-item">
              <Clock size={14} />
              {formatTime(response.responseTime)}
            </span>
            <span className="meta-item">
              <FileText size={14} />
              {formatSize(response.size)}
            </span>
            <span className="meta-item">
              <Hash size={14} />
              {Object.keys(response.headers).length} headers
            </span>
          </div>
        </div>
      </div>

      {/* Response Tabs */}
      <div className="response-tabs">
        <button 
          className={`tab ${activeTab === 'body' ? 'active' : ''}`}
          onClick={() => setActiveTab('body')}
        >
          <FileText size={16} />
          Body
        </button>
        <button 
          className={`tab ${activeTab === 'headers' ? 'active' : ''}`}
          onClick={() => setActiveTab('headers')}
        >
          <Hash size={16} />
          Headers ({Object.keys(response.headers).length})
        </button>
        <button 
          className={`tab ${activeTab === 'raw' ? 'active' : ''}`}
          onClick={() => setActiveTab('raw')}
        >
          <Code size={16} />
          Raw
        </button>
      </div>

      {/* Response Content */}
      <div className="response-content">
        {activeTab === 'body' && (
          <div className="body-content">
            <div className="body-toolbar">
              <div className="view-mode-selector">
                <button 
                  className={`mode-btn ${viewMode === 'formatted' ? 'active' : ''}`}
                  onClick={() => setViewMode('formatted')}
                >
                  <Eye size={14} />
                  Formatted
                </button>
                <button 
                  className={`mode-btn ${viewMode === 'raw' ? 'active' : ''}`}
                  onClick={() => setViewMode('raw')}
                >
                  <Code size={14} />
                  Raw
                </button>
              </div>
            </div>
            
            <div className="body-viewer">
              {viewMode === 'formatted' ? (
                <pre className="json-formatted">
                  <code>{formatJson(response.data)}</code>
                </pre>
              ) : (
                <div className="raw-content">
                  {typeof response.data === 'string' ? response.data : JSON.stringify(response.data)}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'headers' && (
          <div className="headers-content">
            <div className="headers-list">
              {Object.entries(response.headers).map(([key, value]) => (
                <div key={key} className="header-row">
                  <div className="header-key">{key}</div>
                  <div className="header-value">{String(value)}</div>
                </div>
              ))}
            </div>
            {Object.keys(response.headers).length === 0 && (
              <div className="empty-state">
                <p>No headers in response</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'raw' && (
          <div className="raw-content">
            <div className="raw-header">
              <p><strong>Status:</strong> {response.status} {response.statusText}</p>
              <p><strong>Time:</strong> {formatTime(response.responseTime)}</p>
              <p><strong>Size:</strong> {formatSize(response.size)}</p>
            </div>
            <hr />
            <div className="raw-headers">
              <h4>Headers:</h4>
              {Object.entries(response.headers).map(([key, value]) => (
                <p key={key}><strong>{key}:</strong> {String(value)}</p>
              ))}
            </div>
            <hr />
            <div className="raw-body">
              <h4>Body:</h4>
              <pre>{formatJson(response.data)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponseViewer;
