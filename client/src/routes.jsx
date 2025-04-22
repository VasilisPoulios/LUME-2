import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise, stripeOptions } from './config/stripe';

// Pages
import HomePage from './pages/HomePage';
import DiscoverPage from './pages/DiscoverPage';
import CategoriesPage from './pages/CategoriesPage';
import EventDetailPage from './pages/EventDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import Tickets from './pages/Tickets';
import TicketDetails from './pages/TicketDetails';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboardPage from './pages/UserDashboardPage';
import OrganizerDashboardPage from './pages/OrganizerDashboardPage';
import CreateEventPage from './pages/CreateEventPage';
import NotFound from './pages/NotFound';
import AdminDashboardPage from './pages/AdminDashboardPage';

// Components
import Layout from './components/layout/index.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedRouteAdmin from './components/ProtectedRouteAdmin';
import ThemeTest from './components/ThemeTest';

const AppRoutes = () => {
  return (
    <Elements stripe={stripePromise} options={stripeOptions}>
      <Routes>
        {/* Routes using the shared layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="discover" element={<DiscoverPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="events/:id" element={<EventDetailPage />} />
          <Route path="checkout/:eventId" element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          } />
          <Route path="checkout/event/:eventId" element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          } />
          <Route path="tickets" element={
            <ProtectedRoute>
              <Tickets />
            </ProtectedRoute>
          } />
          <Route path="tickets/:ticketId" element={
            <ProtectedRoute>
              <TicketDetails />
            </ProtectedRoute>
          } />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          
          {/* User routes */}
          <Route path="dashboard" element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <UserDashboardPage />
            </ProtectedRoute>
          } />
          
          {/* Organizer routes */}
          <Route path="organizer" element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <OrganizerDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="create-event" element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <CreateEventPage />
            </ProtectedRoute>
          } />
          <Route path="edit-event/:id" element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <CreateEventPage />
            </ProtectedRoute>
          } />
          
          {/* Admin routes */}
          <Route path="admin" element={
            <ProtectedRouteAdmin>
              <AdminDashboardPage />
            </ProtectedRouteAdmin>
          } />
          
          <Route path="theme-test" element={<ThemeTest />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Elements>
  );
};

export default AppRoutes; 