import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Login";
import OtpLogin from "./pages/OtpLogin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import SiteSettings from "./pages/cms/SiteSettings";
import Banners from "./pages/cms/Banners";
import Packages from "./pages/cms/Packages";
import Leads from "./pages/cms/Leads";
import Bookings from "./pages/cms/Bookings";
import Albums from "./pages/cms/Albums";
import Khatabook from "./pages/cms/Khatabook";
import Team from "./pages/cms/Team";
import ExpenseSystem from "./pages/cms/ExpenseSystem";
import Categories from "./pages/cms/Categories";
import Galleries from "./pages/cms/Galleries";
import Stories from "./pages/cms/Stories";
import Testimonials from "./pages/cms/Testimonials";
import Home from "./pages/public/Home";
import PublicLayout from "./components/layout/PublicLayout";
import About from "./pages/public/About";
import PublicPackages from "./pages/public/Packages";
import Portfolio from "./pages/public/Portfolio";
import PublicStories from "./pages/public/PublicStories";
import StoryDetails from "./pages/public/StoryDetails";
import Contact from "./pages/public/Contact";

import CalendarDashboard from "./pages/cms/CalendarDashboard";

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          {/* <Route element={<PublicLayout />}>

            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/stories" element={<PublicStories />} />
            <Route path="/story/:slug" element={<StoryDetails />} />
            <Route path="/packages" element={<PublicPackages />} />
            <Route path="/contact" element={<Contact />} />
          </Route> */}

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/otp-login" element={<OtpLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Admin Routes inside Layout */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="settings/site" element={<SiteSettings />} />
            <Route path="banners" element={<Banners />} />
            <Route path="packages" element={<Packages />} />
            <Route path="leads" element={<Leads />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="albums" element={<Albums />} />
            <Route path="khata" element={<Khatabook />} />
            <Route path="expenses" element={<ExpenseSystem />} />
            <Route path="calendar" element={<CalendarDashboard />} />
            <Route path="team" element={<Team />} />
            <Route path="settings" element={<SiteSettings />} />
            <Route path="categories" element={<Categories />} />
            <Route path="gallery" element={<Galleries />} />
            <Route path="stories" element={<Stories />} />
            <Route path="testimonials" element={<Testimonials />} />
            {/* Additional routes will be placed here (e.g., /pipeline) */}
            <Route path="*" element={<div className="flex items-center justify-center h-[50vh] text-gray-400 font-medium">Page under construction...</div>} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
