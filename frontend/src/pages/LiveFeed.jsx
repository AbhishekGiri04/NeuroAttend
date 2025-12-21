import React, { useState, useRef, useEffect } from 'react';

const LiveFeed = () => {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [results, setResults] = useState([]);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStudents, setSessionStudents] = useState(new Set());
  const [unknownDetections, setUnknownDetections] = useState(0);
  const [securityAlert, setSecurityAlert] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);

  const startRecognition = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      videoRef.current.srcObject = stream;
      setIsRecognizing(true);
      setSessionActive(true);
      setSessionStudents(new Set());
      setResults([]);
      setUnknownDetections(0);
      setSecurityAlert(false);
      console.log('📹 Attendance session started...');
      
      // Start real-time recognition
      startFrameProcessing();
    } catch (err) {
      console.error('❌ Camera error:', err);
      alert('Camera access denied or not available');
    }
  };

  const startFrameProcessing = () => {
    const processFrame = async () => {
      if (!isRecognizing || !videoRef.current) return;
      
      try {
        // Capture frame from video
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        // Convert to base64 with higher quality
        const frameData = canvas.toDataURL('image/jpeg', 0.95);
        
        // Send to backend for recognition
        const response = await fetch('https://neuroattend-dev.onrender.com/recognize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ frame: frameData })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            console.log('✅ Recognition results:', data.results);
            
            // Check for unknown persons
            const unknownPersons = data.results.filter(r => 
              r.type === 'unknown' || 
              r.type === 'unknown_masked' || 
              !r.roll_number || 
              r.name === 'Unknown Person'
            );
            
            if (unknownPersons.length > 0) {
              setUnknownDetections(prev => {
                const newCount = prev + unknownPersons.length;
                
                // Auto-shutdown after 3 unknown detections
                if (newCount >= 3) {
                  setSecurityAlert(true);
                  setTimeout(() => {
                    stopRecognition();
                    showSecurityAlert({
                      title: 'Security Alert - Camera Stopped',
                      message: 'Unknown person detected 3 times. Camera automatically stopped for fraud prevention. Please verify authorized personnel only.',
                      type: 'error',
                      duration: 8000
                    });
                  }, 1000);
                }
                
                return newCount;
              });
            }
            
            setResults(prev => {
              const newResults = [...prev];
              data.results.forEach(result => {
                // Track students in current session
                if (result.roll_number) {
                  setSessionStudents(prev => new Set([...prev, result.roll_number]));
                }
                
                // Show each person only once per session
                const exists = newResults.find(r => r.name === result.name);
                if (!exists) {
                  newResults.push({...result, timestamp: new Date().toLocaleTimeString()});
                }
              });
              return newResults;
            });
          } else {
            console.log('🔍 No faces recognized in this frame');
          }
        } else {
          console.error('❌ Recognition API error:', response.status);
        }
      } catch (error) {
        console.error('❌ Recognition error:', error);
        // Continue processing even if one frame fails
      }
      
      // Process next frame
      if (isRecognizing) {
        setTimeout(processFrame, 2000); // Process every 2 seconds for better accuracy
      }
    };
    
    // Start processing after video is ready
    setTimeout(processFrame, 3000);
  };

  const stopRecognition = async () => {
    setIsRecognizing(false);
    setSessionActive(false);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    
    // Record session attendance
    await markAbsentStudents();
  };
  
  const markAbsentStudents = async () => {
    try {
      const sessionTime = new Date().toISOString();
      const presentStudents = Array.from(sessionStudents);
      
      const response = await fetch('https://neuroattend-dev.onrender.com/mark-class-attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          class_time: sessionTime,
          present_students: presentStudents,
          class_type: 'Live Recognition Session'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Class attendance recorded:', result);
        
        // Professional class completion notification
        const notification = {
          title: 'Class Session Completed',
          message: `Attendance recorded for ${result.present_count} students. ${result.absent_count} students were not detected.`,
          type: 'success',
          duration: 5000
        };
        
        // Show professional notification instead of alert
        showClassNotification(notification);
      }
    } catch (error) {
      console.error('❌ Error recording class attendance:', error);
    }
  };
  
  const showClassNotification = (notification) => {
    // Create professional notification element
    const notificationDiv = document.createElement('div');
    notificationDiv.className = 'fixed top-4 right-4 bg-white border-l-4 border-green-500 rounded-lg shadow-lg p-4 max-w-md z-50';
    notificationDiv.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-gray-900">${notification.title}</p>
          <p class="text-sm text-gray-500 mt-1">${notification.message}</p>
        </div>
        <div class="ml-auto pl-3">
          <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(notificationDiv);
    
    // Auto remove after duration
    setTimeout(() => {
      if (notificationDiv.parentNode) {
        notificationDiv.remove();
      }
    }, notification.duration);
  };
  
  const showSecurityAlert = (alert) => {
    // Create professional security alert
    const alertDiv = document.createElement('div');
    alertDiv.className = 'fixed top-4 right-4 bg-white border-l-4 border-red-500 rounded-lg shadow-xl p-6 max-w-md z-50 animate-pulse';
    alertDiv.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-bold text-red-800">${alert.title}</p>
          <p class="text-sm text-red-600 mt-2 leading-relaxed">${alert.message}</p>
          <div class="mt-3 flex items-center text-xs text-red-500">
            <svg class="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>
            Security Protocol Activated
          </div>
        </div>
        <div class="ml-auto pl-3">
          <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-red-400 hover:text-red-600">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after duration
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.remove();
      }
    }, alert.duration);
  };

  // Update recognition processing when state changes
  useEffect(() => {
    if (isRecognizing) {
      startFrameProcessing();
    }
  }, [isRecognizing]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Remove individual page background to use App.jsx background */}
      <div className="absolute inset-0">
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
        {/* Animated Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-bounce" style={{animationDuration: '6s'}}></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-bounce" style={{animationDuration: '8s', animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-spin" style={{animationDuration: '20s'}}></div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '50px 50px'}}></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 mt-20">
        {/* Hero Section */}
        <div className="relative mb-16 bg-gradient-to-br from-indigo-900/80 via-violet-900/80 to-fuchsia-900/80 backdrop-blur-xl rounded-3xl p-12 mx-auto max-w-5xl shadow-2xl border border-violet-500/30 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-rose-400/20 to-pink-500/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 text-center">
            {/* Status Badge */}
            <div className="inline-flex items-center bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white px-6 py-3 rounded-full text-sm font-bold mb-8 shadow-xl border border-amber-400/50">
              <div className="flex items-center mr-3">
                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                <div className="w-2 h-2 bg-white rounded-full absolute"></div>
              </div>
              NEURAL VISION AI SYSTEM
            </div>
            
            {/* Title with Gradient */}
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 bg-clip-text text-transparent">
                NeuroAttend
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-lg text-violet-100 max-w-3xl mx-auto leading-relaxed mb-10 font-medium">
              Advanced AI-powered facial recognition system with real-time multi-face detection and attendance tracking
            </p>
            
            {/* Stats with New Design */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="group relative bg-gradient-to-br from-amber-500/15 to-orange-500/15 backdrop-blur-sm p-8 rounded-2xl border border-amber-400/30 hover:border-amber-300/50 transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-amber-300 mb-2">99.9%</div>
                  <div className="text-amber-200 font-semibold">Accuracy</div>
                </div>
              </div>
              
              <div className="group relative bg-gradient-to-br from-rose-500/15 to-pink-500/15 backdrop-blur-sm p-8 rounded-2xl border border-rose-400/30 hover:border-rose-300/50 transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-rose-300 mb-2">&lt;100ms</div>
                  <div className="text-rose-200 font-semibold">Processing</div>
                </div>
              </div>
              
              <div className="group relative bg-gradient-to-br from-violet-500/15 to-fuchsia-500/15 backdrop-blur-sm p-8 rounded-2xl border border-violet-400/30 hover:border-violet-300/50 transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-violet-300 mb-2">50+</div>
                  <div className="text-violet-200 font-semibold">Multi-Face</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Camera Feed */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">Live Camera Feed</h2>
                    <p className="text-slate-400 text-sm">Real-time facial recognition processing</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 bg-slate-900/80 px-6 py-3 rounded-2xl border border-slate-600/50">
                  <div className={`w-3 h-3 rounded-full ${
                    securityAlert ? 'bg-red-500 animate-pulse' :
                    isRecognizing ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                  }`}></div>
                  <span className="text-white font-bold text-sm">
                    {securityAlert ? 'SECURITY ALERT' : isRecognizing ? 'LIVE' : 'OFFLINE'}
                  </span>
                  {isRecognizing && unknownDetections > 0 && (
                    <span className="text-red-400 text-xs font-medium">
                      Unknown: {unknownDetections}/3
                    </span>
                  )}
                </div>
              </div>
              
              <div className="relative bg-gradient-to-br from-slate-900 to-black rounded-2xl overflow-hidden mb-8 border border-slate-700/50">
                <video 
                  ref={videoRef}
                  autoPlay 
                  className="w-full h-96 object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
                <canvas 
                  ref={overlayRef}
                  className="absolute top-0 left-0 pointer-events-none"
                />
                {!isRecognizing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900/80 to-black/80 backdrop-blur-sm">
                    <div className="text-center text-white">
                      <div className="w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                        <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-xl font-semibold text-slate-300">Camera Ready</p>
                      <p className="text-sm text-slate-500 mt-2">Click start to begin recognition</p>
                    </div>
                  </div>
                )}
              </div>
              
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              <div className="flex space-x-6">
                <button
                  onClick={startRecognition}
                  disabled={isRecognizing}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Start Recognition
                </button>
                <button
                  onClick={stopRecognition}
                  disabled={!isRecognizing}
                  className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:from-slate-700 hover:to-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                  </svg>
                  Stop Recognition
                </button>
              </div>
            </div>
          </div>
          
          {/* Results Panel */}
          <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Recognition Results</h3>
                <p className="text-slate-400 text-sm">Live detection analytics</p>
              </div>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {results.length === 0 ? (
                <div className="text-center text-slate-400 py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-600/30">
                    <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-slate-300">Start camera to see live recognition</p>
                  <p className="text-sm text-slate-500 mt-2">Results will appear here in real-time</p>
                </div>
              ) : (
                results.map((result, index) => (
                  <div key={index} className={`p-5 rounded-2xl border transition-all duration-300 ${
                    result.type === 'present' ? 'bg-emerald-500/20 border-emerald-500/30 shadow-lg' :
                    result.type === 'masked' ? 'bg-amber-500/20 border-amber-500/30 shadow-lg' :
                    result.type === 'unknown_masked' ? 'bg-orange-500/20 border-orange-500/30 shadow-lg' :
                    result.type === 'unknown' ? 'bg-red-500/20 border-red-500/30 shadow-lg' :
                    'bg-slate-500/20 border-slate-500/30 shadow-lg'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-bold text-white text-lg">{result.name}</div>
                      <div className={`w-4 h-4 rounded-full animate-pulse ${
                        result.type === 'present' ? 'bg-emerald-400' :
                        result.type === 'masked' ? 'bg-amber-400' :
                        result.type === 'unknown_masked' ? 'bg-orange-400' :
                        result.type === 'unknown' ? 'bg-red-400' :
                        'bg-slate-400'
                      }`}></div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className={`text-sm font-semibold ${
                        result.type === 'present' ? 'text-emerald-300' :
                        result.type === 'masked' ? 'text-amber-300' :
                        result.type === 'unknown_masked' ? 'text-orange-300' :
                        result.type === 'unknown' ? 'text-red-300' :
                        'text-slate-300'
                      }`}>{result.status}</div>
                      
                      {result.roll_number && (
                        <div className="text-sm text-white/80">
                          <span className="font-medium">Roll:</span> {result.roll_number}
                        </div>
                      )}
                      
                      {result.confidence && (
                        <div className="text-sm text-white/80">
                          <span className="font-medium">Confidence:</span> {result.confidence}%
                        </div>
                      )}
                      

                      
                      {result.attendance_marked !== undefined && result.type !== 'unknown' && (
                        <div className={`text-xs font-medium ${
                          result.attendance_marked ? 'text-emerald-300' : 'text-amber-300'
                        }`}>
                          {result.attendance_marked ? '✅ Attendance Marked' : '⚠️ Already Present Today'}
                        </div>
                      )}
                      
                      <div className="text-xs text-slate-400 mt-2">{result.timestamp}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Legend */}
            <div className="mt-8 p-6 bg-slate-900/60 rounded-2xl border border-slate-600/30">
              <h4 className="font-bold text-white mb-4 text-lg">Status Legend</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full mr-3 shadow-lg"></div>
                    <span className="text-emerald-300 font-medium">Recognized & Present</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-amber-500 rounded-full mr-3 shadow-lg"></div>
                    <span className="text-amber-300 font-medium">Masked/Partial Face</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-orange-500 rounded-full mr-3 shadow-lg"></div>
                    <span className="text-orange-300 font-medium">Unknown with Mask</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-3 shadow-lg"></div>
                    <span className="text-red-300 font-medium">Unknown Person</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="group bg-gradient-to-br from-teal-900/60 to-cyan-900/60 backdrop-blur-xl p-10 rounded-3xl border border-teal-400/30 hover:border-teal-300/50 transition-all duration-500 hover:transform hover:scale-105">
            <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:rotate-12 transition-transform duration-300 shadow-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-teal-200 mb-6 text-center">Multi-Face Detection</h3>
            <p className="text-teal-100 text-center leading-relaxed text-lg">Recognize multiple faces simultaneously in crowded environments</p>
          </div>
          
          <div className="group bg-gradient-to-br from-amber-900/60 to-orange-900/60 backdrop-blur-xl p-10 rounded-3xl border border-amber-400/30 hover:border-amber-300/50 transition-all duration-500 hover:transform hover:scale-105">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-400 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:rotate-12 transition-transform duration-300 shadow-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-amber-200 mb-6 text-center">Mask Detection</h3>
            <p className="text-amber-100 text-center leading-relaxed text-lg">Advanced mask detection for health protocol compliance</p>
          </div>
          
          <div className="group bg-gradient-to-br from-rose-900/60 to-pink-900/60 backdrop-blur-xl p-10 rounded-3xl border border-rose-400/30 hover:border-rose-300/50 transition-all duration-500 hover:transform hover:scale-105">
            <div className="w-24 h-24 bg-gradient-to-br from-rose-400 to-pink-400 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:rotate-12 transition-transform duration-300 shadow-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-rose-200 mb-6 text-center">Real-Time Processing</h3>
            <p className="text-rose-100 text-center leading-relaxed text-lg">Instant recognition with 99.9% accuracy using advanced AI</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveFeed;