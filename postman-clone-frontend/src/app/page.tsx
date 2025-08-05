
import MainLayout from '../components/layout/MainLayout';

export default function Home() {
  return (
    <MainLayout>
      <div className="request-workspace">
        <div className="workspace-header">
          <h2>API Tester</h2>
          <p>Build and test your API requests with ease</p>
        </div>
        
        <div className="workspace-content">
          <div className="welcome-section">
            <h3>🚀 Getting Started</h3>
            <ul>
              <li>Click "New Request" to create your first API request</li>
              <li>Organize requests into collections</li>
              <li>View response data in the panel on the right</li>
              <li>All requests are saved to your history</li>
            </ul>
          </div>
          
          <div className="features-section">
            <h3>✨ Features</h3>
            <ul>
              <li>Support for all HTTP methods (GET, POST, PUT, DELETE, etc.)</li>
              <li>Custom headers and query parameters</li>
              <li>JSON request body editor</li>
              <li>Formatted response viewer</li>
              <li>Request history tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
