import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
import PatientsList from './pages/PatientsList';
import PatientProfile from './pages/PatientProfile';
import DoctorsList from './pages/DoctorsList';
import DoctorProfile from './pages/DoctorProfile';
import UsersList from './pages/UsersList';
import StaffList from './pages/StaffList';
import BillingList from './pages/BillingList';
import ReportsList from './pages/ReportsList';
import BedManagement from './pages/BedManagement';
import FaceAttendance from './pages/FaceAttendance';
import ConsultationRoom from './pages/ConsultationRoom';
import WalkInConsultation from './pages/WalkInConsultation';
import PaymentPage from './pages/PaymentPage';
import VisitorManagement from './pages/VisitorManagement';
import InsuranceClaims from './pages/InsuranceClaims';
import DocumentManager from './pages/DocumentManager';
import DonationManagement from './pages/DonationManagement';
import DiseasePrediction from './pages/DiseasePrediction';
import XRayAnalysis from './pages/XRayAnalysis';
import ChatBot from './components/ChatBot';
import MagicLoginVerify from './pages/MagicLoginVerify';
import AttendanceLogs from './pages/AttendanceLogs';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes without Layout */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/magic-login" element={<MagicLoginVerify />} />

          {/* Protected Routes wrapped in Layout */}
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['all']}>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/book-appointment"
                    element={
                      <ProtectedRoute allowedRoles={['patient', 'receptionist', 'admin']}>
                        <BookAppointment />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/appointments"
                    element={
                      <ProtectedRoute allowedRoles={['patient', 'doctor', 'receptionist', 'admin']}>
                        <MyAppointments />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/patients"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'doctor', 'receptionist']}>
                        <PatientsList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/patients/:id"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'doctor', 'receptionist']}>
                        <PatientProfile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <UsersList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/staff"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <StaffList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/billing"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'receptionist', 'patient']}>
                        <BillingList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/reports"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'doctor', 'patient']}>
                        <ReportsList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/ward-management"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'doctor', 'receptionist', 'staff']}>
                        <BedManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/face-attendance"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'staff']}>
                        <FaceAttendance />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/attendance-logs"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'staff']}>
                        <AttendanceLogs />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/visitors"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'receptionist', 'staff']}>
                        <VisitorManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/insurance"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'receptionist', 'patient']}>
                        <InsuranceClaims />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/documents"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'doctor', 'receptionist', 'patient']}>
                        <DocumentManager />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/donations"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'patient']}>
                        <DonationManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/ai-prediction"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                        <DiseasePrediction />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/xray-analysis"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                        <XRayAnalysis />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/consultation/:meetingCode"
                    element={
                      <ProtectedRoute>
                        <ConsultationRoom />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/walk-in-consultation/:id"
                    element={
                      <ProtectedRoute>
                        <WalkInConsultation />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/pay/:billId"
                    element={
                      <ProtectedRoute>
                        <PaymentPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute allowedRoles={['all']}>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/doctors"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'receptionist', 'doctor']}>
                        <DoctorsList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/doctors/:id"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'receptionist', 'doctor']}>
                        <DoctorProfile />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Layout>
            }
          />
        </Routes>
        <ChatBot />
      </Router>
    </AuthProvider>
  );
}

export default App;
