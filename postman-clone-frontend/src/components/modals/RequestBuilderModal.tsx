'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Send } from 'lucide-react';
import { HttpRequest, HttpMethod, KeyValuePair } from '../../types/request';
import './RequestBuilderModal.scss';

interface RequestBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (request: HttpRequest) => Promise<void>;
  initialRequest?: HttpRequest;
}

const RequestBuilderModal: React.FC<RequestBuilderModalProps> = ({
  isOpen,
  onClose,
  onSend,
  initialRequest
}) => {
  // Form state
  const [requestName, setRequestName] = useState('New Request');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body'>('params');
  
  // Dynamic arrays
  const [params, setParams] = useState<KeyValuePair[]>([]);
  const [headers, setHeaders] = useState<KeyValuePair[]>([]);
  const [bodyContent, setBodyContent] = useState('');
  const [bodyType, setBodyType] = useState<'none' | 'raw'>('none');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Generate unique ID
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Initialize form with existing request
  useEffect(() => {
    if (initialRequest) {
      setRequestName(initialRequest.name);
      setMethod(initialRequest.method);
      setUrl(initialRequest.url);
      setParams(initialRequest.params || []);
      setHeaders(initialRequest.headers || []);
      setBodyContent(initialRequest.body?.raw || '');
      setBodyType(initialRequest.body?.type === 'raw' ? 'raw' : 'none');
    }
  }, [initialRequest]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && !initialRequest) {
      setRequestName('New Request');
      setMethod('GET');
      setUrl('');
      setParams([]);
      setHeaders([]);
      setBodyContent('');
      setBodyType('none');
      setErrors({});
    }
  }, [isOpen, initialRequest]);

  // Add new key-value pair
  const addKeyValuePair = (type: 'params' | 'headers') => {
    const newPair: KeyValuePair = {
      key: '',
      value: '',
      enabled: true,
      description: ''
    };
    
    if (type === 'params') {
      setParams(prev => [...prev, newPair]);
    } else {
      setHeaders(prev => [...prev, newPair]);
    }
  };

  // Remove key-value pair
  const removeKeyValuePair = (index: number, type: 'params' | 'headers') => {
    if (type === 'params') {
      setParams(prev => prev.filter((_, i) => i !== index));
    } else {
      setHeaders(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Update key-value pair
  const updateKeyValuePair = (
    index: number, 
    field: 'key' | 'value' | 'enabled', 
    value: string | boolean, 
    type: 'params' | 'headers'
  ) => {
    const updateArray = type === 'params' ? setParams : setHeaders;
    updateArray(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!requestName.trim()) {
      newErrors.name = 'Request name is required';
    }
    
    if (!url.trim()) {
      newErrors.url = 'URL is required';
    } else if (!isValidUrl(url)) {
      newErrors.url = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Submit handler
  const handleSend = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    const request: HttpRequest = {
      id: initialRequest?.id || generateId(),
      name: requestName,
      method,
      url,
      headers: headers.filter(h => h.key && h.enabled),
      params: params.filter(p => p.key && p.enabled),
      body: bodyType === 'raw' && bodyContent ? {
        type: 'raw',
        raw: bodyContent
      } : undefined,
      createdAt: initialRequest?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      await onSend(request);
      onClose();
    } catch (error) {
      console.error('Failed to send request:', error);
    }
    
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2>Request Builder</h2>
          <button onClick={onClose} className="btn-close">
            <X size={20} />
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="modal-body">
          {/* Request Name & URL Section */}
          <div className="request-info">
            <div className="form-group">
              <label>Request Name</label>
              <input 
                type="text"
                placeholder="Enter request name"
                value={requestName}
                onChange={(e) => setRequestName(e.target.value)}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
            
            <div className="url-section">
              <div className="method-selector">
                <select 
                  value={method} 
                  onChange={(e) => setMethod(e.target.value as HttpMethod)}
                  className="method-dropdown"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                  <option value="HEAD">HEAD</option>
                  <option value="OPTIONS">OPTIONS</option>
                </select>
              </div>
              
              <div className="url-input">
                <input 
                  type="text"
                  placeholder="Enter request URL (e.g., https://api.example.com/users)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className={errors.url ? 'error' : ''}
                />
                {errors.url && <span className="error-text">{errors.url}</span>}
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'params' ? 'active' : ''}`}
              onClick={() => setActiveTab('params')}
            >
              Params ({params.filter(p => p.key).length})
            </button>
            <button 
              className={`tab ${activeTab === 'headers' ? 'active' : ''}`}
              onClick={() => setActiveTab('headers')}
            >
              Headers ({headers.filter(h => h.key).length})
            </button>
            <button 
              className={`tab ${activeTab === 'body' ? 'active' : ''}`}
              onClick={() => setActiveTab('body')}
            >
              Body
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'params' && (
              <div className="key-value-editor">
                <div className="section-header">
                  <h3>Query Parameters</h3>
                  <button onClick={() => addKeyValuePair('params')} className="btn-add">
                    <Plus size={16} /> Add Parameter
                  </button>
                </div>
                
                {params.length === 0 ? (
                  <div className="empty-state">
                    <p>No parameters yet. Add your first parameter above.</p>
                  </div>
                ) : (
                  <div className="key-value-list">
                    {params.map((param, index) => (
                      <div key={index} className="key-value-row">
                        <input 
                          type="checkbox"
                          checked={param.enabled}
                          onChange={(e) => updateKeyValuePair(index, 'enabled', e.target.checked, 'params')}
                          className="checkbox"
                        />
                        <input 
                          type="text"
                          placeholder="Parameter name"
                          value={param.key}
                          onChange={(e) => updateKeyValuePair(index, 'key', e.target.value, 'params')}
                          className="key-input"
                        />
                        <input 
                          type="text"
                          placeholder="Parameter value"
                          value={param.value}
                          onChange={(e) => updateKeyValuePair(index, 'value', e.target.value, 'params')}
                          className="value-input"
                        />
                        <button 
                          onClick={() => removeKeyValuePair(index, 'params')}
                          className="btn-remove"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'headers' && (
              <div className="key-value-editor">
                <div className="section-header">
                  <h3>Request Headers</h3>
                  <button onClick={() => addKeyValuePair('headers')} className="btn-add">
                    <Plus size={16} /> Add Header
                  </button>
                </div>
                
                {headers.length === 0 ? (
                  <div className="empty-state">
                    <p>No headers yet. Add your first header above.</p>
                  </div>
                ) : (
                  <div className="key-value-list">
                    {headers.map((header, index) => (
                      <div key={index} className="key-value-row">
                        <input 
                          type="checkbox"
                          checked={header.enabled}
                          onChange={(e) => updateKeyValuePair(index, 'enabled', e.target.checked, 'headers')}
                          className="checkbox"
                        />
                        <input 
                          type="text"
                          placeholder="Header name (e.g., Content-Type)"
                          value={header.key}
                          onChange={(e) => updateKeyValuePair(index, 'key', e.target.value, 'headers')}
                          className="key-input"
                        />
                        <input 
                          type="text"
                          placeholder="Header value (e.g., application/json)"
                          value={header.value}
                          onChange={(e) => updateKeyValuePair(index, 'value', e.target.value, 'headers')}
                          className="value-input"
                        />
                        <button 
                          onClick={() => removeKeyValuePair(index, 'headers')}
                          className="btn-remove"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'body' && (
              <div className="body-editor">
                <div className="body-type-selector">
                  <h3>Request Body</h3>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input 
                        type="radio" 
                        name="bodyType"
                        checked={bodyType === 'none'} 
                        onChange={() => setBodyType('none')} 
                      />
                      <span>None</span>
                    </label>
                    <label className="radio-option">
                      <input 
                        type="radio" 
                        name="bodyType"
                        checked={bodyType === 'raw'} 
                        onChange={() => setBodyType('raw')} 
                      />
                      <span>Raw (JSON)</span>
                    </label>
                  </div>
                </div>
                
                {bodyType === 'raw' && (
                  <div className="body-content">
                    <textarea 
                      placeholder='Enter JSON data here, e.g.:\n{\n  "name": "John Doe",\n  "email": "john@example.com"\n}'
                      value={bodyContent}
                      onChange={(e) => setBodyContent(e.target.value)}
                      rows={12}
                      className="body-textarea"
                    />
                  </div>
                )}
                
                {bodyType === 'none' && (
                  <div className="empty-state">
                    <p>No body content for this request.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button 
            onClick={handleSend} 
            disabled={loading || !url.trim()}
            className="btn btn-primary"
          >
            <Send size={16} />
            {loading ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestBuilderModal;