

'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Folder, 
  Clock, 
  Send,
  ChevronDown,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { Collection, RequestHistory, HttpRequest, HttpResponse } from '../types/request';
import RequestBuilderModal from '../components/modals/RequestBuilderModal';
import './Sidebar.scss';

interface SidebarProps {
  onSendRequest: (request: HttpRequest) => Promise<void>;
}

const Sidebar: React.FC<SidebarProps> = ({ onSendRequest }) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [history, setHistory] = useState<RequestHistory[]>([]);
  const [expandedCollections, setExpandedCollections] = useState<string[]>([]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Generate unique ID
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add request to history
  const addToHistory = (request: HttpRequest, response?: HttpResponse) => {
    const historyItem: RequestHistory = {
      id: generateId(),
      request,
      response,
      timestamp: new Date().toISOString()
    };
    setHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10 items
  };

  // Handle sending request from modal
  const handleSendRequest = async (request: HttpRequest) => {
    try {
      // Use the onSendRequest prop passed from MainLayout
      await onSendRequest(request);
      
      // Add to history (successful requests will be added by MainLayout)
      addToHistory(request);
    } catch (error) {
      console.error('Error:', error);
      // Add to history even if failed
      addToHistory(request);
    }
  };

  // Open request builder modal
  const openRequestBuilder = () => {
    setIsModalOpen(true);
  };

  // Close request builder modal
  const closeRequestBuilder = () => {
    setIsModalOpen(false);
  };

  // Create new collection
  const createCollection = () => {
    const newCollection: Collection = {
      id: generateId(),
      name: `Collection ${collections.length + 1}`,
      description: 'New collection',
      requests: [],
      folders: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCollections(prev => [...prev, newCollection]);
  };

  // Toggle collection expansion
  const toggleCollection = (collectionId: string) => {
    setExpandedCollections(prev => 
      prev.includes(collectionId) 
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  // Delete collection
  const deleteCollection = (collectionId: string) => {
    setCollections(prev => prev.filter(c => c.id !== collectionId));
    setExpandedCollections(prev => prev.filter(id => id !== collectionId));
  };

  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      <aside className="sidebar">
        {/* Header */}
        <div className="sidebar-header">
          <h1>API Tester</h1>
        </div>

        {/* New Request Button */}
        <div className="sidebar-section">
          <button 
            className="btn btn--primary new-request-btn"
            onClick={openRequestBuilder}
          >
            <Send size={16} />
            New Request
          </button>
        </div>

        {/* Collections */}
        <div className="sidebar-section">
          <h3>
            <Folder size={16} />
            Collections
          </h3>
          <div className="sidebar-content">
            {collections.length === 0 ? (
              <p className="empty-state">No collections yet</p>
            ) : (
              <div className="collections-list">
                {collections.map(collection => (
                  <div key={collection.id} className="collection-item">
                    <div className="collection-header">
                      <button 
                        onClick={() => toggleCollection(collection.id)}
                        className="collection-toggle"
                      >
                        {expandedCollections.includes(collection.id) ? 
                          <ChevronDown size={14} /> : 
                          <ChevronRight size={14} />
                        }
                        <Folder size={14} />
                        <span>{collection.name}</span>
                      </button>
                      <div className="collection-actions">
                        <button 
                          onClick={() => deleteCollection(collection.id)}
                          className="btn--icon"
                          title="Delete collection"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    {expandedCollections.includes(collection.id) && (
                      <div className="collection-content">
                        {collection.requests.length === 0 ? (
                          <p className="empty-state-small">No requests</p>
                        ) : (
                          collection.requests.map(request => (
                            <div key={request.id} className="request-item">
                              <span className={`method-badge method-${request.method.toLowerCase()}`}>
                                {request.method}
                              </span>
                              <span className="request-name">{request.name}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <button 
              className="btn btn--secondary btn--small"
              onClick={createCollection}
            >
              <Plus size={14} />
              Create Collection
            </button>
          </div>
        </div>

        {/* History */}
        <div className="sidebar-section">
          <h3>
            <Clock size={16} />
            History
          </h3>
          <div className="sidebar-content">
            {history.length === 0 ? (
              <p className="empty-state">No requests yet</p>
            ) : (
              <div className="history-list">
                {history.slice(0, 5).map(item => (
                  <div key={item.id} className="history-item">
                    <div className="history-method">
                      <span className={`method-badge method-${item.request.method.toLowerCase()}`}>
                        {item.request.method}
                      </span>
                    </div>
                    <div className="history-details">
                      <div className="history-url">{item.request.url}</div>
                      <div className="history-meta">
                        <span className="history-time">{formatTime(item.timestamp)}</span>
                        {item.response && (
                          <span className={`status-badge status-${Math.floor(item.response.status / 100)}xx`}>
                            {item.response.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
      
      {/* Request Builder Modal */}
      <RequestBuilderModal
        isOpen={isModalOpen}
        onClose={closeRequestBuilder}
        onSend={handleSendRequest}
      />
    </>
  );
};

export default Sidebar;
