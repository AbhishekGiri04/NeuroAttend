import React, { useState } from 'react';

const Navbar = ({ activeSection, setActiveSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'live', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'enrollment', label: 'Enrollment', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
    { id: 'dashboard', label: 'Dashboard', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'about', label: 'About', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'admin', label: 'Admin', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-gradient-to-r from-slate-900/90 via-indigo-900/90 to-violet-900/90 border-b border-violet-500/20 shadow-2xl">
      <div className="container mx-auto px-8 py-5">
        <div className="flex justify-between items-center">
          {/* Brand */}
          <div className="flex items-center space-x-4">
            <img 
              src="https://cdn.dribbble.com/userupload/11876147/file/original-d9528b1eaa0da008fab3164ef7b2d003.jpg?format=webp&resize=400x300&vertical=center" 
              alt="NeuroAttend Logo" 
              className="w-12 h-12 rounded-2xl shadow-xl border border-amber-400/30 object-cover"
            />
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">NeuroAttend</h1>
              <p className="text-sm text-violet-300 font-semibold tracking-wide">AI ATTENDANCE SYSTEM</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`group relative flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-200 border border-amber-400/30 shadow-lg'
                    : 'text-violet-200 hover:bg-white/10 hover:text-white hover:scale-105'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  activeSection === item.id 
                    ? 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg' 
                    : 'bg-white/10 group-hover:bg-white/20'
                }`}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <span className="tracking-wide">{item.label}</span>
                {activeSection === item.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden bg-gradient-to-br from-amber-500 to-orange-500 text-white p-3 rounded-2xl shadow-lg border border-amber-400/30"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-6 space-y-3 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-violet-500/20">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center w-full p-4 rounded-2xl transition-all duration-300 ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-200 border border-amber-400/30'
                    : 'text-violet-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-4 ${
                  activeSection === item.id 
                    ? 'bg-gradient-to-br from-amber-500 to-orange-500' 
                    : 'bg-white/10'
                }`}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <span className="font-semibold">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;