import React, { useState } from 'react';

const Admin = () => {
  const [alertDate, setAlertDate] = useState(new Date().toISOString().split('T')[0]);
  const [exportDate, setExportDate] = useState(new Date().toISOString().split('T')[0]);

  const sendAbsenceAlerts = async () => {
    if (!alertDate) return alert('Please select a date');
    
    try {
      const formData = new FormData();
      formData.append('date', alertDate);
      
      const response = await fetch('http://localhost:8080/send-alerts', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        
        let message = `📧📱 Absence Alerts Sent!\n\n`;
        message += `📅 Date: ${result.date}\n`;
        message += `✅ Email & WhatsApp Sent: ${result.alerts_sent?.length || 0}\n`;
        message += `❌ Failed: ${result.alerts_failed?.length || 0}\n`;
        message += `📈 Total Absent: ${result.total_absent || 0}\n\n`;
        
        if (result.alerts_sent && result.alerts_sent.length > 0) {
          message += `Alerts sent via Email & WhatsApp to:\n`;
          result.alerts_sent.slice(0, 5).forEach(alert => {
            message += `• ${alert.name} (${alert.roll_id})\n`;
          });
          if (result.alerts_sent.length > 5) {
            message += `... and ${result.alerts_sent.length - 5} more`;
          }
        }
        
        alert(message);
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to send alerts');
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    }
  };

  const exportAbsentees = async () => {
    if (!exportDate) return alert('Please select a date');
    
    try {
      const response = await fetch(`http://localhost:8080/export-absentees?date=${exportDate}`);
      
      if (response.ok) {
        // Download CSV file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_report_${exportDate}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert(`✅ Attendance report exported successfully!\n\nFile: attendance_report_${exportDate}.csv\nDate: ${exportDate}`);
      } else {
        const error = await response.json();
        alert(error.detail || 'Export failed');
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 mt-20 relative" style={{backgroundImage: 'url(https://wallpapers.com/images/hd/innovation-1920-x-1080-wallpaper-1msvdmkmknwxc5fo.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative z-10 container mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-16 bg-white/20 backdrop-blur-md rounded-3xl p-12 mx-auto max-w-4xl shadow-2xl border border-white/30">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Admin Dashboard
          </h1>
          <p className="text-xl text-white/80">Manage attendance alerts and generate comprehensive reports</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="bg-white/20 backdrop-blur-md p-10 rounded-3xl shadow-2xl border border-white/30 hover:bg-white/25 transition-all duration-300">
            <div className="flex items-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Send Absence Alerts</h2>
                <p className="text-sm text-pink-200 mt-1">Email + WhatsApp Notifications</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-white/90 font-medium mb-2">Select Date</label>
                <input 
                  type="date" 
                  value={alertDate}
                  onChange={(e) => setAlertDate(e.target.value)}
                  className="w-full p-4 bg-white/20 border border-white/40 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/25 transition-all" 
                  required 
                />
              </div>
              <button 
                onClick={sendAbsenceAlerts}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Email & WhatsApp Alerts
              </button>
            </div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-md p-10 rounded-3xl shadow-2xl border border-white/30 hover:bg-white/25 transition-all duration-300">
            <div className="flex items-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mr-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white">Export Reports</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-white/90 font-medium mb-2">Select Date</label>
                <input 
                  type="date" 
                  value={exportDate}
                  onChange={(e) => setExportDate(e.target.value)}
                  className="w-full p-4 bg-white/20 border border-white/40 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/25 transition-all" 
                  required 
                />
              </div>
              <button 
                onClick={exportAbsentees}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Absentees CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;