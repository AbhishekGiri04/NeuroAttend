import React, { useState } from 'react';

const Admin = () => {
  const [alertDate, setAlertDate] = useState(new Date().toISOString().split('T')[0]);
  const [exportDate, setExportDate] = useState(new Date().toISOString().split('T')[0]);

  const showProfessionalNotification = (notification) => {
    const notificationDiv = document.createElement('div');
    const bgColor = notification.type === 'success' ? 'bg-green-50 border-green-200' : 
                   notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200' : 
                   'bg-red-50 border-red-200';
    const iconColor = notification.type === 'success' ? 'text-green-500' : 
                     notification.type === 'warning' ? 'text-yellow-500' : 
                     'text-red-500';
    const textColor = notification.type === 'success' ? 'text-green-800' : 
                     notification.type === 'warning' ? 'text-yellow-800' : 
                     'text-red-800';
    
    notificationDiv.className = `fixed top-4 right-4 ${bgColor} border rounded-lg shadow-lg p-6 max-w-md z-50`;
    notificationDiv.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-6 w-6 ${iconColor}" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-semibold ${textColor}">${notification.title}</h3>
          <p class="text-sm ${textColor.replace('800', '700')} mt-1">${notification.message}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 ${textColor.replace('800', '400')}">
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(notificationDiv);
    
    setTimeout(() => {
      if (notificationDiv.parentNode) {
        notificationDiv.remove();
      }
    }, notification.duration);
  };

  const sendEmailAlerts = async () => {
    if (!alertDate) return alert('Please select a date');
    
    try {
      const formData = new FormData();
      formData.append('date', alertDate);
      
      const response = await fetch('http://localhost:8080/send-email-alerts', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        // Open Gmail for each absent student individually
        if (result.email_sent > 0) {
          // Gmail will open automatically from backend
          console.log(`Gmail opened for ${result.email_sent} students`);
        } else {
          showProfessionalNotification({
            title: 'No Absent Students',
            message: 'All students were present on the selected date.',
            type: 'info',
            duration: 3000
          });
        }
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to send email alerts');
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    }
  };
  
  const sendWhatsAppAlerts = async () => {
    if (!alertDate) return alert('Please select a date');
    
    try {
      const formData = new FormData();
      formData.append('date', alertDate);
      
      const response = await fetch('http://localhost:8080/send-whatsapp-alerts', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        // Show professional notification instead of alert
        showProfessionalNotification({
          title: 'WhatsApp Alerts Initiated', 
          message: `WhatsApp opened for ${result.whatsapp_sent} absent students. Professional messages pre-filled and ready to send.`,
          type: 'success',
          duration: 5000
        });
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to send WhatsApp alerts');
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    }
  };

  const exportAttendance = async (type) => {
    if (!exportDate) return alert('Please select a date');
    
    try {
      const response = await fetch(`http://localhost:8080/export-attendance-csv?date=${exportDate}&type=${type}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_${type}_${exportDate}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Show professional notification instead of alert
        showProfessionalNotification({
          title: 'Export Completed Successfully',
          message: `${type.charAt(0).toUpperCase() + type.slice(1)} attendance data exported for ${exportDate}. File downloaded to Downloads folder.`,
          type: 'success',
          duration: 5000
        });
      } else {
        const error = await response.json();
        alert(error.detail || 'Export failed');
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 mt-20 relative" style={{backgroundImage: 'url(https://img.freepik.com/free-photo/yellow-paper-cutout-light-bulb-blank-blackboard_23-2147873862.jpg?semt=ais_hybrid&w=740&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative z-10 container mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-20 bg-gradient-to-br from-white/25 via-white/20 to-white/15 backdrop-blur-xl rounded-[2rem] p-16 mx-auto max-w-5xl shadow-[0_25px_50px_rgba(0,0,0,0.3)] border border-white/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full text-sm font-bold mb-8 shadow-lg">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
              </svg>
              ADMIN CONTROL CENTER
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-white mb-6 tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-2xl text-white/90 font-medium">Manage attendance alerts and generate comprehensive reports</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">

          
          {/* WhatsApp Alerts */}
          <div className="bg-white/20 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/30 hover:bg-white/25 transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">WhatsApp Alerts</h3>
            </div>
            <div className="space-y-4">
              <input 
                type="date" 
                value={alertDate}
                onChange={(e) => setAlertDate(e.target.value)}
                className="w-full p-3 bg-white/20 border border-white/40 rounded-lg text-white" 
              />
              <button 
                onClick={sendWhatsAppAlerts}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all"
              >
                Send WhatsApp Alerts
              </button>
            </div>
          </div>
          
          {/* Export Reports */}
          <div className="bg-white/20 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/30 hover:bg-white/25 transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Export CSV</h3>
            </div>
            <div className="space-y-4">
              <input 
                type="date" 
                value={exportDate}
                onChange={(e) => setExportDate(e.target.value)}
                className="w-full p-3 bg-white/20 border border-white/40 rounded-lg text-white" 
              />
              <div className="space-y-2">
                <button 
                  onClick={() => exportAttendance('present')}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 px-4 rounded-lg font-medium text-sm"
                >
                  Export Present
                </button>
                <button 
                  onClick={() => exportAttendance('absent')}
                  className="w-full bg-gradient-to-r from-red-500 to-rose-500 text-white py-2 px-4 rounded-lg font-medium text-sm"
                >
                  Export Absent
                </button>
                <button 
                  onClick={() => exportAttendance('all')}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg font-medium text-sm"
                >
                  Export All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;