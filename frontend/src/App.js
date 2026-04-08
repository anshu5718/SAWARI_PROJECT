import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import ForgotPassword from './pages/ForgetPassword';
import OtpConfirmation from './pages/OtpConfirmation';
import SetNewPassword from './pages/SetNewPassword';
import ViewerHomePage from './pages/users/ViewerHomePage';
import BookingCancel from './pages/users/BookingCancel';
import RegisterVehicle from './pages/vehicles/RegisterVehicle';
import DriverHomePage from './pages/vehicles/DriverHomePage';
import PaymentSuccess from './pages/reservations/PaymentSuccess';
import Layout from './pages/Layout';
import UserBookings from './pages/reservations/UserBookings';
import RejectBooking from './pages/reservations/RejectBooking';
import BookingStatus from './pages/reservations/BookingStatus';
import DriverBookings from './pages/reservations/DriverBookings';
import BookVehicle from './pages/reservations/BookVehicle';
import EditVehicle from './pages/vehicles/EditVehicle'; 
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVehicles from './pages/admin/AdminVehicles';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminVehicleDetail from './pages/admin/AdminVehicleDetail';
import DeleteVehicle from './pages/vehicles/DeleteVehicle';
import AdminBookingDetails from './pages/admin/AdminBookingDetails';
import ProtectedLayout from './component/ProtectedLayout';
import ProfileEdit from './pages/users/ProfileEdit';
import BookingDetails from './pages/reservations/BookingDetails';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  return (
    <Router>
      <Routes>
        {/* Home — no Layout */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp-confirmation" element={<OtpConfirmation />} />
        <Route path="/set-new-password" element={<SetNewPassword />} />
        {/* All other routes — wrapped in Layout */}
        <Route element ={<ProtectedLayout />}>
          <Route path ="/booking-details/:id" element={<Layout user={user}><BookingDetails /></Layout>} />
          <Route path="/profile/edit" element={<Layout user={user}><ProfileEdit /></Layout>} />
          <Route path="/viewer-homepage" element={<Layout user={user}><ViewerHomePage /></Layout>} />
          <Route path="/booking-cancel" element={<Layout user={user}><BookingCancel /></Layout>} />
          <Route path="/register-vehicle" element={<Layout user={user}><RegisterVehicle /></Layout>} />
          <Route path="/driver-homepage" element={<Layout user={user}><DriverHomePage /></Layout>} />
          <Route path="/payment-success" element={<Layout user={user}><PaymentSuccess /></Layout>} />
          <Route path="/booking-status" element={<Layout user={user}><BookingStatus /></Layout>} />
          <Route path="/my-bookings" element={<Layout user={user}><UserBookings /></Layout>} />
          <Route path="/reject-booking/:reservationId" element={<Layout user={user}><RejectBooking /></Layout>} />
          <Route path="/driver-bookings" element={<Layout user={user}><DriverBookings /></Layout>} />
          <Route path="/book/:id" element={<Layout user={user}><BookVehicle /></Layout>} />
          <Route path="/edit-vehicle/:id" element={<Layout user={user}><EditVehicle /></Layout>} />
          <Route path="/admin" element={<Layout user={user}><AdminDashboard /></Layout>} />
          <Route path="/admin/vehicles" element={<Layout user={user}><AdminVehicles /></Layout>} />
          <Route path="/admin/users" element={<Layout user={user}><AdminUsers /></Layout>} />
          <Route path="/admin/bookings" element={<Layout user={user}><AdminBookings /></Layout>} />
          <Route path="/admin/users/:id" element={<Layout user={user}><AdminUserDetail /></Layout>} />
          <Route path="/admin/vehicles/:id" element={<Layout user={user}><AdminVehicleDetail /></Layout>} />
          <Route path="/admin/bookings/:id" element={<Layout user={user}><AdminBookingDetails /></Layout>} />
          <Route path="/delete-vehicle/:id" element={<Layout user={user}><DeleteVehicle /></Layout>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
