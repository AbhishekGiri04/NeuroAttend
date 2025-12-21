import React, { useEffect, useRef } from 'react';

const Footer = () => {
  const footerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.unobserve(entry.target);
        }
      });
    });
    
    if (footerRef.current) {
      observer.observe(footerRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  const animateCounters = () => {
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-target'));
      const increment = target / 100;
      let current = 0;
      
      const updateCounter = () => {
        if (current < target) {
          current += increment;
          counter.textContent = current.toFixed(1);
          setTimeout(updateCounter, 20);
        } else {
          counter.textContent = target;
        }
      };
      
      updateCounter();
    });
  };

  return (
    <footer ref={footerRef} className="relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="absolute inset-0 opacity-20">
          <div className="floating-shapes">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`shape shape-${i}`}></div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer Content */}
      <div className="relative z-10 container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-8 text-white">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-2xl">
                🧠
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  NeuroAttend
                </h3>
                <p className="text-sm text-gray-300">Real-Time AI-Powered Attendance</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Professional AI-powered attendance system with student enrollment, live facial recognition, 
              ID verification, automated absence alerts, and comprehensive student information management.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.linkedin.com/in/abhishek-giri04/" target="_blank" rel="noopener noreferrer" className="social-icon">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="https://github.com/abhishekgiri04" target="_blank" rel="noopener noreferrer" className="social-icon">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="https://t.me/AbhishekGiri7" target="_blank" rel="noopener noreferrer" className="social-icon">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Features */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-emerald-300">Features</h4>
            <ul className="space-y-3">
              {[
                'Easy Student Registration',
                'Live Face Detection',
                'ID Card Verification',
                'Smart Absence Alerts',
                'Student Records Manager',
                'Bulk Import System'
              ].map((feature, i) => (
                <li key={i} className="footer-link">{feature}</li>
              ))}
            </ul>
          </div>
          
          {/* Technology */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-orange-300">Technology</h4>
            <ul className="space-y-3">
              {[
                'AI Face Recognition',
                'Fast API Backend',
                'Modern React Interface',
                'Secure Data Storage',
                'Smart Image Processing',
                'Instant Notifications'
              ].map((tech, i) => (
                <li key={i} className="footer-link">{tech}</li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="stat-card bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-400/30">
              <div className="text-3xl font-bold text-blue-400 counter" data-target="99.97">0</div>
              <div className="text-sm text-blue-300">Recognition Accuracy %</div>
            </div>
            <div className="stat-card bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-400/30">
              <div className="text-3xl font-bold text-purple-400 counter" data-target="100">0</div>
              <div className="text-sm text-purple-300">Processing Latency (ms)</div>
            </div>
            <div className="stat-card bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-400/30">
              <div className="text-3xl font-bold text-green-400 counter" data-target="50">0</div>
              <div className="text-sm text-green-300">Concurrent Faces</div>
            </div>
            <div className="stat-card bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-400/30">
              <div className="text-3xl font-bold text-orange-400 counter" data-target="1000">0</div>
              <div className="text-sm text-orange-300">Students Enrolled</div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2025 NeuroAttend AI System. Built by Abhishek Giri for intelligent attendance management.
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Support</a>
            <div className="flex items-center space-x-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>System Online</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .floating-shapes {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        
        .shape {
          position: absolute;
          background: linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3));
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
        }
        
        .shape-1 { width: 80px; height: 80px; top: 20%; left: 10%; animation-delay: 0s; }
        .shape-2 { width: 60px; height: 60px; top: 60%; right: 20%; animation-delay: 2s; }
        .shape-3 { width: 100px; height: 100px; bottom: 30%; left: 60%; animation-delay: 4s; }
        .shape-4 { width: 40px; height: 40px; top: 10%; right: 10%; animation-delay: 1s; }
        .shape-5 { width: 70px; height: 70px; bottom: 10%; left: 20%; animation-delay: 3s; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
        }
        
        .social-icon {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        
        .social-icon:hover {
          background: rgba(16, 185, 129, 0.3);
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
        }
        
        .footer-link {
          color: #d1d5db;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .footer-link:hover {
          color: #10b981;
          transform: translateX(5px);
        }
        
        .stat-card {
          padding: 24px;
          border-radius: 20px;
          backdrop-filter: blur(15px);
          border: 2px solid;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        
        .stat-card:hover::before {
          left: 100%;
        }
        
        .stat-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
        }
        
        .counter {
          font-family: 'Courier New', monospace;
        }
      `}</style>
    </footer>
  );
};

export default Footer;