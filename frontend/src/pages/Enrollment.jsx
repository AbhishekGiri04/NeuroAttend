import React, { useState } from 'react';
import Toast from '../components/Toast';

const Enrollment = () => {
  const [individualForm, setIndividualForm] = useState({
    name: '',
    rollId: '',
    email: '',
    phone: '',
    department: '',
    section: '',
    photo: null
  });
  
  const [bulkForm, setBulkForm] = useState({
    csvFile: null,
    photosZip: null
  });
  
  const [idVerifyForm, setIdVerifyForm] = useState({
    rollId: '',
    idCard: null
  });

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  const handleIndividualSubmit = async (e) => {
    e.preventDefault();
    
    if (!individualForm.photo) {
      showToast('Please select a photo', 'warning');
      return;
    }
    
    const formData = new FormData();
    formData.append('name', individualForm.name);
    formData.append('roll_id', individualForm.rollId);
    formData.append('email', individualForm.email);
    formData.append('phone', individualForm.phone);
    formData.append('department', individualForm.department);
    formData.append('section', individualForm.section);
    formData.append('file', individualForm.photo);
    
    try {
      const response = await fetch('https://neuroattend-dev.onrender.com/enroll', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        showToast('Enrollment Successful! Student registered for attendance tracking.', 'success');
        setIndividualForm({ name: '', rollId: '', email: '', phone: '', department: '', section: '', photo: null });
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      } else {
        const error = await response.json();
        showToast(error.detail || 'Enrollment failed', 'error');
      }
    } catch (err) {
      showToast('Network error: ' + err.message, 'error');
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    
    if (!bulkForm.csvFile || !bulkForm.photosZip || bulkForm.photosZip.length === 0) {
      showToast('Please select CSV file and student photos', 'warning');
      return;
    }
    
    const formData = new FormData();
    formData.append('csv_file', bulkForm.csvFile);
    
    // Append all selected photos
    for (let i = 0; i < bulkForm.photosZip.length; i++) {
      formData.append('photos', bulkForm.photosZip[i]);
    }
    
    try {
      const response = await fetch('https://neuroattend-dev.onrender.com/bulk-enroll', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        
        showToast(`Bulk Enrollment: ${result.enrolled?.length || 0} enrolled, ${result.failed?.length || 0} failed`, result.failed?.length > 0 ? 'warning' : 'success');
        setBulkForm({ csvFile: null, photosZip: null });
        
        // Reset file inputs
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
          if (input.accept === '.csv' || input.multiple) {
            input.value = '';
          }
        });
      } else {
        const error = await response.json();
        showToast(error.detail || 'Bulk enrollment failed', 'error');
      }
    } catch (err) {
      showToast('Network error: ' + err.message, 'error');
    }
  };

  const handleIdVerify = async (e) => {
    e.preventDefault();
    
    if (!idVerifyForm.idCard) {
      showToast('Please select an ID card photo', 'warning');
      return;
    }
    
    const formData = new FormData();
    formData.append('roll_number', idVerifyForm.rollId);
    formData.append('file', idVerifyForm.idCard);
    
    try {
      const response = await fetch('https://neuroattend-dev.onrender.com/verify-id', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.status === 'verified') {
          showToast(`ID Verified: ${result.student_name} (${result.confidence}%)`, 'success');
          showProfessionalNotification({
            title: 'ID Card Verification Successful',
            message: `Student ${result.student_name} (Roll: ${idVerifyForm.rollId}) has been successfully verified with ${result.confidence}% confidence.`,
            type: 'success',
            duration: 6000
          });
        } else if (result.status === 'not_verified') {
          showToast(`ID Not Verified: ${result.student_name} (${result.confidence}%)`, 'warning');
          showProfessionalNotification({
            title: 'ID Card Verification Failed',
            message: `ID card does not match enrolled student ${result.student_name}. Confidence: ${result.confidence}%`,
            type: 'warning',
            duration: 6000
          });
        } else {
          showToast(result.message, 'error');
          showProfessionalNotification({
            title: 'ID Card Verification Error',
            message: result.message || 'Unable to process ID card verification.',
            type: 'error',
            duration: 6000
          });
        }
        
        setIdVerifyForm({ rollId: '', idCard: null });
        // Reset file input
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
          if (input.accept === 'image/*' && input !== document.querySelector('input[accept="image/*"]')) {
            input.value = '';
          }
        });
      } else {
        const error = await response.json();
        showToast(error.detail || 'ID verification failed', 'error');
      }
    } catch (err) {
      showToast('Network error: ' + err.message, 'error');
    }
  };

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

  return (
    <div className="min-h-screen relative overflow-hidden mt-20">
      {/* HD Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://content.presentermedia.com/files/clipart/00031000/31254/creative_burst_background_800_wht.jpg)'
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 bg-white/20 backdrop-blur-md rounded-3xl p-12 mx-auto max-w-5xl shadow-2xl border border-white/30">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-6">
            AI-POWERED ENROLLMENT SYSTEM
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Student Enrollment
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Advanced biometric registration system powered by cutting-edge facial recognition technology for seamless student onboarding
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 max-w-7xl mx-auto">
          {/* Individual Enrollment */}
          <div className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:bg-white/25">
            <div className="flex items-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mr-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white">Individual Enrollment</h2>
            </div>
            
            <form onSubmit={handleIndividualSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-white font-semibold text-base">Full Name</label>
                <input
                  type="text"
                  value={individualForm.name}
                  onChange={(e) => setIndividualForm({...individualForm, name: e.target.value})}
                  className="w-full p-4 bg-white/25 border border-white/50 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/30 transition-all font-medium"
                  placeholder="Enter student's full name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-white font-semibold text-base">University Roll Number</label>
                <input
                  type="text"
                  value={individualForm.rollId}
                  onChange={(e) => setIndividualForm({...individualForm, rollId: e.target.value})}
                  className="w-full p-4 bg-white/25 border border-white/50 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/30 transition-all font-medium"
                  placeholder="Enter university roll number"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-white font-semibold text-base">Email Address</label>
                <input
                  type="email"
                  value={individualForm.email}
                  onChange={(e) => setIndividualForm({...individualForm, email: e.target.value})}
                  className="w-full p-4 bg-white/25 border border-white/50 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/30 transition-all font-medium"
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-white font-semibold text-base">Phone Number</label>
                <input
                  type="tel"
                  value={individualForm.phone}
                  onChange={(e) => setIndividualForm({...individualForm, phone: e.target.value})}
                  className="w-full p-4 bg-white/25 border border-white/50 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/30 transition-all font-medium"
                  placeholder="Enter phone number (+91-XXXXXXXXXX)"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-white font-semibold text-base">Department</label>
                  <input
                    type="text"
                    value={individualForm.department}
                    onChange={(e) => setIndividualForm({...individualForm, department: e.target.value})}
                    className="w-full p-4 bg-white/25 border border-white/50 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/30 transition-all font-medium"
                    placeholder="e.g. Computer Science"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-white font-semibold text-base">Section</label>
                  <input
                    type="text"
                    value={individualForm.section}
                    onChange={(e) => setIndividualForm({...individualForm, section: e.target.value})}
                    className="w-full p-4 bg-white/25 border border-white/50 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/30 transition-all font-medium"
                    placeholder="e.g. A, B, C"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-white font-semibold text-base">Student Photo</label>
                <div className="bg-white/25 border border-white/50 rounded-xl p-4">
                  <input
                    type="file"
                    accept=".jpg,.jpeg"
                    onChange={(e) => setIndividualForm({...individualForm, photo: e.target.files[0]})}
                    className="w-full bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-500 file:text-white hover:file:bg-cyan-600 transition-all font-medium"
                    required
                  />
                  <p className="text-xs text-white/70 mt-2">JPG/JPEG files only</p>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-cyan-600 hover:scale-105 transition-all duration-300 shadow-2xl flex items-center justify-center gap-3 mt-8"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Enroll Student
              </button>
            </form>
          </div>

          {/* Bulk Enrollment & ID Verification */}
          <div className="space-y-10">
            {/* Bulk Enrollment */}
            <div className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:bg-white/25">
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Bulk Enrollment</h2>
              </div>
              
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/40 rounded-xl">
                <h4 className="font-bold text-blue-100 mb-3 text-base flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  CSV File Format
                </h4>
                <div className="bg-black/40 p-3 rounded-lg mb-3">
                  <code className="text-sm text-blue-200 font-mono">name,roll_id,email,phone,department,section,photo</code>
                </div>
                <div className="space-y-2 text-sm text-blue-100">
                  <p className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    Create CSV with student details and photo filenames
                  </p>
                  <p className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    Select multiple photos with exact matching filenames
                  </p>
                  <p className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    Example: john_doe.jpg file matches "john_doe.jpg" in CSV
                  </p>
                </div>
              </div>
              
              <form onSubmit={handleBulkSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-white/95 font-medium text-sm">CSV File</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setBulkForm({...bulkForm, csvFile: e.target.files[0]})}
                    className="w-full p-3 bg-white/20 border border-white/40 rounded-lg text-white file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-white/30 file:text-white hover:file:bg-white/40 transition-all"
                    required
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-white/95 font-medium text-sm">Student Photos</label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    multiple
                    onChange={(e) => setBulkForm({...bulkForm, photosZip: e.target.files})}
                    className="w-full p-3 bg-white/20 border border-white/40 rounded-lg text-white file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-white/30 file:text-white hover:file:bg-white/40 transition-all"
                    required
                  />
                  <p className="text-xs text-white/70 mt-2">Select multiple JPG/JPEG files</p>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Bulk Enroll from CSV
                </button>
              </form>
            </div>

            {/* ID Card Verification */}
            <div className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:bg-white/25">
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mr-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">ID Card Verification</h2>
                  <p className="text-sm text-green-300 font-medium">Optional - Not required for attendance</p>
                </div>
              </div>
              
              <form onSubmit={handleIdVerify} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-white/95 font-medium text-sm">University Roll Number</label>
                  <input
                    type="text"
                    value={idVerifyForm.rollId}
                    onChange={(e) => setIdVerifyForm({...idVerifyForm, rollId: e.target.value})}
                    className="w-full p-3 bg-white/20 border border-white/40 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/25 transition-all"
                    placeholder="Enter university roll number"
                    required
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-white/95 font-medium text-sm">ID Card Photo</label>
                  <div className="bg-white/20 border border-white/40 rounded-lg p-3">
                    <input
                      type="file"
                      accept=".jpg,.jpeg"
                      onChange={(e) => setIdVerifyForm({...idVerifyForm, idCard: e.target.files[0]})}
                      className="w-full bg-transparent text-white file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-white/30 file:text-white hover:file:bg-white/40 transition-all"
                      required
                    />
                    <p className="text-xs text-white/70 mt-2">JPG/JPEG files only</p>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  Verify ID Card
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
};

export default Enrollment;