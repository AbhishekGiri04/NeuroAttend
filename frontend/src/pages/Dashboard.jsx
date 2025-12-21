import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState({
    today_present: 0,
    absent_count: 0,
    total_users: 0,
    attendance_rate: 0,
    weekly_trend: [],
    top_users: [],
    recent_absent: []
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await fetch('https://neuroattend-dev.onrender.com/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        console.log('📊 Dashboard stats loaded:', data);
      } else {
        console.error('Failed to load stats:', response.status);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  // Refresh stats every 10 seconds for faster updates
  useEffect(() => {
    const interval = setInterval(loadDashboard, 10000);
    return () => clearInterval(interval);
  }, []);

  const weeklyChartData = {
    labels: stats.weekly_trend?.length > 0 ? stats.weekly_trend.map(d => d.date) : ['No Data'],
    datasets: [{
      label: 'Daily Attendance',
      data: stats.weekly_trend?.length > 0 ? stats.weekly_trend.map(d => d.attendance || 0) : [0],
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      tension: 0.4
    }]
  };

  const activeChartData = {
    labels: stats.top_users?.length > 0 ? stats.top_users.map(u => u.name) : ['No Students'],
    datasets: [{
      label: 'Attendance Count',
      data: stats.top_users?.length > 0 ? stats.top_users.map(u => u.attendance_count || 0) : [0],
      backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe']
    }]
  };

  return (
    <div className="min-h-screen pt-24 pb-20 mt-20 relative" style={{backgroundImage: 'url(https://wallpapers.com/images/hd/cloud-background-ghu4yqszlggj4f7d.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', filter: 'brightness(0.95)'}}>
      <div className="container mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-16 bg-white/20 backdrop-blur-md rounded-3xl p-12 mx-auto max-w-5xl shadow-2xl border border-white/30">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-6">
            REAL-TIME ANALYTICS PLATFORM
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Analytics Dashboard
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Advanced business intelligence platform providing real-time attendance insights and comprehensive analytics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-8 mb-16 max-w-7xl mx-auto">
          <div className="bg-white/20 backdrop-blur-md p-8 rounded-3xl text-center shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 group border border-white/30">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="text-5xl font-bold text-white mb-3">{stats.today_present}</div>
            <div className="text-white/80 font-semibold text-lg">Present Today</div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-md p-8 rounded-3xl text-center shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 group border border-white/30">
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18 21l-2.121-2.121M6 6l2.121 2.121m0 0L21 21" />
              </svg>
            </div>
            <div className="text-5xl font-bold text-white mb-3">{stats.absent_count}</div>
            <div className="text-white/80 font-semibold text-lg">Absent Today</div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-md p-8 rounded-3xl text-center shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 group border border-white/30">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="text-5xl font-bold text-white mb-3">{stats.total_users}</div>
            <div className="text-white/80 font-semibold text-lg">Total Students</div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-md p-8 rounded-3xl text-center shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 group border border-white/30">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-5xl font-bold text-white mb-3">{stats.attendance_rate}%</div>
            <div className="text-white/80 font-semibold text-lg">Attendance Rate</div>
          </div>
        </div>

        {/* Analytics Information */}
        {stats.total_users === 0 && (
          <div className="mb-16 max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl border border-slate-600/30">
              <div className="flex items-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mr-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h3>
                  <p className="text-slate-300 text-lg">Real-time attendance insights and performance metrics</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-indigo-400/20">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 className="text-white font-bold text-lg">Weekly Trends</h4>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">Comprehensive 7-day attendance patterns with daily breakdowns and percentage calculations.</p>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-purple-400/20">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <h4 className="text-white font-bold text-lg">Top Performers</h4>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">Ranking of most consistent students based on attendance frequency and participation rates.</p>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-emerald-400/20">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="text-white font-bold text-lg">Live Updates</h4>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">Real-time data synchronization with automatic refresh every 30 seconds for current metrics.</p>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-400/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-bold text-lg mb-2">Getting Started</h4>
                    <p className="text-slate-300 text-sm">Begin by enrolling students and conducting live recognition sessions to populate analytics</p>
                  </div>
                  <div className="flex space-x-4">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mb-1">1</div>
                      <p className="text-xs text-slate-400">Enroll</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mb-1">2</div>
                      <p className="text-xs text-slate-400">Recognize</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm mb-1">3</div>
                      <p className="text-xs text-slate-400">Analyze</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-10 max-w-7xl mx-auto">
          <div className="bg-white p-10 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mr-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-800">Weekly Attendance Analytics</h3>
                  <p className="text-gray-500 text-sm mt-1">7-day attendance pattern analysis</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{stats.attendance_rate}%</div>
                <div className="text-xs text-gray-500">Average Rate</div>
              </div>
            </div>
            <div style={{ height: '350px' }}>
              <Line data={weeklyChartData} options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Students Present'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Date'
                    }
                  }
                }
              }} />
            </div>
          </div>
          
          <div className="bg-white p-10 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mr-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-800">Top Performing Students</h3>
                  <p className="text-gray-500 text-sm mt-1">Ranked by attendance consistency</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">{stats.top_users?.length || 0}</div>
                <div className="text-xs text-gray-500">Active Students</div>
              </div>
            </div>
            <div style={{ height: '350px' }}>
              <Bar data={activeChartData} options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Attendance Count'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Students'
                    }
                  }
                }
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;