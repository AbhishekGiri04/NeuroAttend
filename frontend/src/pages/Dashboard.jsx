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
      const response = await fetch('http://localhost:8080/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  // Refresh stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const weeklyChartData = {
    labels: stats.weekly_trend.map(d => d.date),
    datasets: [{
      label: 'Daily Attendance',
      data: stats.weekly_trend.map(d => d.count),
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      tension: 0.4
    }]
  };

  const activeChartData = {
    labels: stats.top_users.map(u => u.name),
    datasets: [{
      label: 'Attendance Count',
      data: stats.top_users.map(u => u.count),
      backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe']
    }]
  };

  return (
    <div className="min-h-screen pt-24 pb-20 mt-20 relative" style={{backgroundImage: 'url(https://c4.wallpaperflare.com/wallpaper/439/992/3/minimalism-clouds-white-blue-wallpaper-preview.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', filter: 'brightness(0.95)'}}>
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

        {/* Recent Absent Students */}
        {stats.recent_absent && stats.recent_absent.length > 0 && (
          <div className="mb-16 max-w-7xl mx-auto">
            <div className="bg-red-500/20 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-red-500/30">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl flex items-center justify-center mr-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white">Recently Marked Absent</h3>
                  <p className="text-red-200">Students who were not detected during live sessions</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {stats.recent_absent.slice(0, 6).map((student, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-red-400/30">
                    <div className="text-white font-bold">{student.name}</div>
                    <div className="text-red-200 text-sm">Roll: {student.roll_id}</div>
                    <div className="text-red-300 text-xs mt-1">{student.date}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <p className="text-red-200 text-sm">💡 Send alerts to these students from the Admin panel</p>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-10 max-w-7xl mx-auto">
          <div className="bg-white p-10 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border">
            <div className="flex items-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mr-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-800">Weekly Attendance Trend</h3>
            </div>
            <div style={{ height: '300px' }}>
              <Line data={weeklyChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
          
          <div className="bg-white p-10 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border">
            <div className="flex items-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mr-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-800">Most Active Students</h3>
            </div>
            <div style={{ height: '300px' }}>
              <Bar data={activeChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;