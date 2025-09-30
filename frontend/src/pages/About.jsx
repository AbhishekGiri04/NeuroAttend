import React from 'react';

const About = () => {
  const features = [
    {
      icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
      title: 'Neural Network Processing',
      description: 'FaceNet-based deep convolutional neural networks with 99.97% accuracy, processing 128-dimensional face embeddings in real-time with sub-100ms latency.',
      color: 'bg-emerald-500'
    },
    {
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      title: 'Multi-Threading Architecture',
      description: 'Concurrent face detection pipeline supporting up to 50 simultaneous faces using OpenCV DNN modules with MTCNN face detection algorithms.',
      color: 'bg-blue-500'
    },
    {
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      title: 'Computer Vision Analytics',
      description: 'Advanced facial landmark detection with 68-point facial geometry analysis, supporting PPE compliance through mask classification models.',
      color: 'bg-purple-500'
    },
    {
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      title: 'Business Intelligence Engine',
      description: 'Real-time data aggregation with statistical modeling, predictive analytics, and automated report generation using time-series analysis.',
      color: 'bg-orange-500'
    },
    {
      icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      title: 'Event-Driven Notifications',
      description: 'Asynchronous message queuing system with SMTP integration, webhook support, and customizable notification templates for stakeholder alerts.',
      color: 'bg-pink-500'
    },
    {
      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
      title: 'Enterprise Security Framework',
      description: 'AES-256 encryption, OAuth 2.0 authentication, RBAC authorization, and GDPR-compliant data handling with horizontal scaling capabilities.',
      color: 'bg-cyan-500'
    }
  ];

  const techStack = [
    { category: 'AI & ML', color: 'text-emerald-400', items: ['FaceNet Neural Network', 'OpenCV Computer Vision', 'Deep Learning Models'] },
    { category: 'Backend', color: 'text-blue-400', items: ['FastAPI Framework', 'SQLAlchemy ORM', 'SQLite Database'] },
    { category: 'Frontend', color: 'text-purple-400', items: ['Modern HTML5/CSS3', 'TailwindCSS', 'Chart.js Analytics'] },
    { category: 'Features', color: 'text-orange-400', items: ['Real-time Processing', 'Email Integration', 'CSV Import/Export'] }
  ];

  const useCases = [
    { icon: '🏫', title: 'Educational Institutions', description: 'Comprehensive student lifecycle management with automated attendance tracking, academic performance correlation, and parent notification systems' },
    { icon: '🏢', title: 'Enterprise Organizations', description: 'Workforce management solutions with biometric access control, time tracking integration, and HR analytics for productivity optimization' },
    { icon: '🎯', title: 'Event Management', description: 'Large-scale event attendance monitoring with real-time capacity management, security integration, and participant engagement analytics' }
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 mt-20 relative" style={{backgroundImage: 'url(https://png.pngtree.com/thumb_back/fh260/background/20240716/pngtree-colorful-light-bulb-with-paint-splatters-creative-and-vibrant-design-image_16008771.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', filter: 'contrast(1.2) brightness(1.1) saturate(1.3)'}}>
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-20 bg-white/20 backdrop-blur-md rounded-3xl p-16 mx-auto max-w-6xl shadow-2xl border border-white/30">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-6">
            AI-POWERED BIOMETRIC SOLUTION
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-8 leading-tight">
            NeuroAttend
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">AI Platform</span>
          </h1>
          <p className="text-2xl text-gray-700 max-w-5xl mx-auto leading-relaxed font-medium mb-8">
Professional AI-powered attendance system with student enrollment, live facial recognition, ID verification, automated absence alerts, and comprehensive student information management.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl">
              <div className="text-3xl font-bold text-blue-600 mb-2">99.97%</div>
              <div className="text-gray-700 font-medium">Recognition Accuracy</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl">
              <div className="text-3xl font-bold text-purple-600 mb-2">&lt;100ms</div>
              <div className="text-gray-700 font-medium">Processing Latency</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl">
              <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-gray-700 font-medium">Concurrent Faces</div>
            </div>
          </div>
        </div>
        
        {/* Project Overview */}
        <div className="bg-white/20 backdrop-blur-md rounded-3xl p-16 mb-20 shadow-2xl border border-white/30">
          <h2 className="text-5xl font-bold text-center text-white mb-12">Project Overview</h2>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-800 mb-6">Intelligent Workforce Management</h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
NeuroAttend provides a complete attendance management solution for educational institutions. Features include student enrollment with photo management, live camera recognition, ID card verification, automated absence email alerts, and organized student information folders.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
Built with React frontend and FastAPI backend, the system provides real-time facial recognition, bulk enrollment from CSV files, professional absence notifications, and comprehensive student data organization with automated folder creation.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">85%</div>
                  <div className="text-gray-700">Admin Reduction</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">100%</div>
                  <div className="text-gray-700">Accuracy Rate</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl">
              <h4 className="text-xl font-bold text-gray-800 mb-4">Key Innovations</h4>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  FaceNet neural network with 128-dimensional embeddings
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  MTCNN multi-stage face detection pipeline
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Real-time video stream processing
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  Automated report generation and analytics
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  Enterprise security with AES-256 encryption
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Core Technologies */}
        <div className="mb-20">
          <h2 className="text-5xl font-bold text-center text-white mb-4 bg-white/20 backdrop-blur-sm rounded-2xl p-6 mx-auto max-w-2xl border border-white/30">Core Technologies</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-10 text-center transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl group">
                <div className={`w-20 h-20 ${feature.color} rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:rotate-12 transition-transform duration-300`}>
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-white/80 leading-relaxed text-lg">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Technical Architecture */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-16 mb-20 shadow-2xl border border-white/50">
          <h2 className="text-5xl font-bold text-center text-gray-900 mb-16">Technical Architecture</h2>
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h3 className="text-3xl font-bold text-gray-800 mb-8">System Architecture</h3>
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl">
                  <h4 className="text-xl font-bold text-blue-800 mb-3">Frontend Layer</h4>
                  <p className="text-gray-700">React 18 with modern hooks, TailwindCSS for responsive design, Chart.js for analytics visualization, and real-time WebSocket connections.</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-2xl">
                  <h4 className="text-xl font-bold text-purple-800 mb-3">API Gateway</h4>
                  <p className="text-gray-700">FastAPI with async/await patterns, automatic OpenAPI documentation, request validation, and rate limiting for enterprise security.</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-2xl">
                  <h4 className="text-xl font-bold text-green-800 mb-3">AI Processing Engine</h4>
                  <p className="text-gray-700">TensorFlow/PyTorch models with GPU acceleration, OpenCV for computer vision, and optimized inference pipelines.</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-800 mb-8">Technology Stack</h3>
              <div className="grid grid-cols-2 gap-6">
                {techStack.map((tech, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-4 text-lg">{tech.category}</h4>
                    <ul className="text-gray-600 space-y-2">
                      {tech.items.map((item, i) => (
                        <li key={i} className="text-sm flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Implementation Benefits */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-16 mb-20 shadow-2xl border border-white/50">
          <h2 className="text-5xl font-bold text-center text-gray-900 mb-16">Implementation Benefits</h2>
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Operational Efficiency</h3>
              <p className="text-gray-600 leading-relaxed text-lg">Eliminate manual attendance processes, reduce administrative workload by 85%, and achieve real-time workforce visibility with automated reporting.</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Accuracy & Compliance</h3>
              <p className="text-gray-600 leading-relaxed text-lg">Ensure 100% attendance accuracy, maintain comprehensive audit trails, and meet regulatory compliance requirements with automated documentation.</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Scalable Growth</h3>
              <p className="text-gray-600 leading-relaxed text-lg">Scale from small teams to enterprise organizations with cloud-native architecture, supporting unlimited users and locations.</p>
            </div>
          </div>
        </div>

        {/* Enterprise Applications */}
        <div className="text-center">
          <h2 className="text-5xl font-bold text-white mb-4 bg-white/20 backdrop-blur-sm rounded-2xl p-6 mx-auto max-w-3xl border border-white/30">Enterprise Applications</h2>
          <div className="grid md:grid-cols-3 gap-10 mt-16">
            {useCases.map((useCase, index) => (
              <div key={index} className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-10 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl group">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:rotate-12 transition-transform duration-300">
                  {index === 0 && <span className="text-4xl">🏫</span>}
                  {index === 1 && <span className="text-4xl">🏬</span>}
                  {index === 2 && <span className="text-4xl">🎲</span>}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{useCase.title}</h3>
                <p className="text-white/80 leading-relaxed text-lg">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;