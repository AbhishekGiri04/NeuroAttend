import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LiveFeed from './pages/LiveFeed';
import Enrollment from './pages/Enrollment';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Admin from './pages/Admin';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [activeSection, setActiveSection] = useState('live');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 6000);
    
    return () => clearTimeout(timer);
  }, []);

  const renderSection = () => {
    switch(activeSection) {
      case 'live': return <LiveFeed />;
      case 'enrollment': return <Enrollment />;
      case 'dashboard': return <Dashboard />;
      case 'about': return <About />;
      case 'admin': return <Admin />;
      default: return <LiveFeed />;
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Creative Background */}
      <div 
        className="absolute inset-0 bg-cover bg-top bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1532073145718-62df48eaa35e?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c3R1ZHklMjBhZXN0aGV0aWN8ZW58MHx8MHx8fDA%3D)'
        }}
      >
        <div className="absolute inset-0 bg-black/0"></div>
      </div>

      
      <div className="relative z-10">
        <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main>
          {renderSection()}
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;