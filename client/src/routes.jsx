import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from './config/stripe';

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
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedRouteAdmin from './components/ProtectedRouteAdmin';
import ThemeTest from './components/ThemeTest';
import PlaceholderPage from './components/PlaceholderPage';

const AppRoutes = () => {
  return (
    <Elements stripe={stripePromise}>
      <Routes>
        {/* Routes using the shared layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="discover" element={<DiscoverPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="events/:id" element={<EventDetailPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          {/* Placeholder routes for footer links */}
          <Route path="faq" element={<PlaceholderPage title="Frequently Asked Questions" />} />
          <Route path="privacy-policy" element={<PlaceholderPage title="Privacy Policy" />} />
          <Route path="promote-event" element={<PlaceholderPage title="Promote Your Event" />} />
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
          <Route path="organizer/events" element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <OrganizerDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="organizer/events/create" element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <CreateEventPage />
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
          <Route path="admin/users" element={
            <ProtectedRouteAdmin>
              <AdminDashboardPage tab="users" />
            </ProtectedRouteAdmin>
          } />
          <Route path="admin/events" element={
            <ProtectedRouteAdmin>
              <AdminDashboardPage tab="events" />
            </ProtectedRouteAdmin>
          } />
          <Route path="admin/categories" element={
            <ProtectedRouteAdmin>
              <AdminDashboardPage tab="categories" />
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