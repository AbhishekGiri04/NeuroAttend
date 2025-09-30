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
    <div className="min-h-screen">
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main>
        {renderSection()}
      </main>
      <Footer />
    </div>
  );
}

export default App;