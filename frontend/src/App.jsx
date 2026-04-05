import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'

import Login           from './pages/auth/Login'
import Register        from './pages/auth/Register'
import AdminDashboard  from './pages/admin/AdminDashboard'
import ManageStudents  from './pages/admin/ManageStudents'
import ManageDrives    from './pages/admin/ManageDrives'
import ManageFeedback  from './pages/admin/ManageFeedback'
import StudentDashboard from './pages/student/StudentDashboard'
import MyProfile       from './pages/student/MyProfile'
import BrowseDrives    from './pages/student/BrowseDrives'
import MyApplications  from './pages/student/MyApplications'
import PlacementPrediction from './pages/student/PlacementPrediction'
import RecruiterDashboard  from './pages/recruiter/RecruiterDashboard'
import RecruiterDrives     from './pages/recruiter/RecruiterDrives'
import DriveApplicants     from './pages/recruiter/DriveApplicants'
import FeedbackForm    from './pages/shared/FeedbackForm'
import AnalyticsDashboard from './pages/shared/AnalyticsDashboard'
import Notifications   from './pages/shared/Notifications'
import CoordinatorStudents  from './pages/coordinator/CoordinatorStudents'
import CoordinatorCompanies from './pages/coordinator/CoordinatorCompanies'
import AdminCompanies       from './pages/coordinator/CoordinatorCompanies'
import Layout          from './components/common/Layout'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/"         element={<Navigate to="/login" replace />} />

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['ADMIN']}>
              <Layout role="ADMIN" />
            </ProtectedRoute>
          }>
            <Route index                 element={<AdminDashboard />} />
            <Route path="students"       element={<ManageStudents />} />
            <Route path="drives"         element={<ManageDrives />} />
            <Route path="feedback"       element={<ManageFeedback />} />
            <Route path="companies"      element={<AdminCompanies />} />
            <Route path="analytics"      element={<AnalyticsDashboard />} />
            <Route path="notifications"  element={<Notifications />} />
          </Route>

          {/* Student */}
          <Route path="/student" element={
            <ProtectedRoute roles={['STUDENT']}>
              <Layout role="STUDENT" />
            </ProtectedRoute>
          }>
            <Route index                 element={<StudentDashboard />} />
            <Route path="profile"        element={<MyProfile />} />
            <Route path="drives"         element={<BrowseDrives />} />
            <Route path="applications"   element={<MyApplications />} />
            <Route path="prediction"     element={<PlacementPrediction />} />
            <Route path="feedback"       element={<FeedbackForm />} />
            <Route path="notifications"  element={<Notifications />} />
          </Route>

          {/* Recruiter */}
          <Route path="/recruiter" element={
            <ProtectedRoute roles={['RECRUITER']}>
              <Layout role="RECRUITER" />
            </ProtectedRoute>
          }>
            <Route index                     element={<RecruiterDashboard />} />
            <Route path="drives"             element={<RecruiterDrives />} />
            <Route path="drives/:id/applicants" element={<DriveApplicants />} />
            <Route path="students"           element={<ManageStudents viewOnly />} />
            <Route path="notifications"      element={<Notifications />} />
          </Route>

          {/* Coordinator — dedicated student + company pages */}
          <Route path="/coordinator" element={
            <ProtectedRoute roles={['COORDINATOR']}>
              <Layout role="COORDINATOR" />
            </ProtectedRoute>
          }>
            <Route index              element={<AdminDashboard />} />
            <Route path="students"    element={<CoordinatorStudents />} />
            <Route path="companies"   element={<CoordinatorCompanies />} />
            <Route path="drives"      element={<ManageDrives />} />
            <Route path="analytics"   element={<AnalyticsDashboard />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
