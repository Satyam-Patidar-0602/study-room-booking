import { Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Chatbot from './components/Chatbot'
import Home from './pages/Home'
import Booking from './pages/Booking'
import Contact from './pages/Contact'
import BookingSuccess from './pages/BookingSuccess'
import News from './pages/News'
import StudentResources from './pages/StudentResources'
import Terms from './pages/Terms';
import RefundPolicy from './pages/RefundPolicy';
import ContactUs from './pages/ContactUs';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ScrollToTop from './components/ScrollToTop';

function App() {
   // hide chatbot on booking-related routes
  const hideChatbotRoutes = ["/booking", "/booking-success"];
  const shouldShowChatbot = !hideChatbotRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <ScrollToTop />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes>
            <Route 
              path="/" 
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Home />
                </motion.div>
              } 
            />
            <Route 
              path="/booking" 
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Booking />
                </motion.div>
              } 
            />
            <Route 
              path="/contact" 
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Contact />
                </motion.div>
              } 
            />
            <Route 
              path="/booking-success" 
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <BookingSuccess />
                </motion.div>
              } 
            />
            <Route 
              path="/news" 
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <News />
                </motion.div>
              } 
            />
            <Route 
              path="/student-resources" 
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <StudentResources />
                </motion.div>
              } 
            />
            <Route 
              path="/terms" 
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Terms />
                </motion.div>
              } 
            />
            <Route 
              path="/refund-policy" 
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <RefundPolicy />
                </motion.div>
              } 
            />
            <Route 
              path="/contact-us" 
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ContactUs />
                </motion.div>
              } 
            />
            <Route 
              path="/admin" 
              element={<AdminLogin />} 
            />
            <Route 
              path="/admin/dashboard" 
              element={<AdminDashboard />} 
            />
            <Route 
              path="/admin/expenses" 
              element={<AdminDashboard initialTab="expenses" />} 
            />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      {shouldShowChatbot && <Chatbot />}
    </div>
  )
}

export default App 