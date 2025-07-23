import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle,
  MessageSquare,
  User,
  Mail as MailIcon,
  ChevronDown,
  ChevronUp,
  Star,
  Heart,
  Zap,
  Wifi,
  Users,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Shield,
  Instagram
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getBaseUrl } from '../config/urls';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [hoveredContact, setHoveredContact] = useState(null)
  const [copiedField, setCopiedField] = useState(null)
  const [currentFeature, setCurrentFeature] = useState(0)
  const [expandedFaqHome, setExpandedFaqHome] = useState(null)

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Address',
      content: 'The Study Point Library, Jiran, Neemuch District, Madhya Pradesh',
      link: 'https://maps.app.goo.gl/6vpaxtKNA4ErmL2b6',
      color: 'from-blue-500 to-blue-600',
      description: 'Visit us at our convenient location in Jiran, Neemuch'
    },
    {
      icon: Phone,
      title: 'Phone',
      content: '+91 7089290615',
      link: 'tel:+15551234567',
      color: 'from-green-500 to-green-600',
      description: 'Call us anytime during business hours'
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'thestudypointlibraryjeeran@gmail.com',
      link: 'mailto:thestudypointlibraryjeeran@gmail.com',
      color: 'from-purple-500 to-purple-600',
      description: 'Send us an email and we\'ll respond within 24 hours'
    },
    {
      icon: Clock,
      title: 'Hours',
              content: 'Monday - Sunday: 6:30 AM - 11:00 AM',
      link: null,
      color: 'from-orange-500 to-orange-600',
      description: 'We\'re open 16.5 hours a day, 7 days a week'
    },
    {
      icon: 'Instagram',
      title: 'Instagram',
      content: '@the_study_point_library_jeeran',
      link: 'https://www.instagram.com/the_study_point_library_jeeran?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
      color: 'from-pink-500 to-pink-600',
      description: 'Follow us on Instagram for updates and photos'
    }
  ]

  const features = [
    {
      icon: <Wifi className="w-8 h-8" />,
      title: "High-Speed WiFi",
      description: "Lightning-fast internet for seamless online learning",
      color: "from-blue-500 to-blue-600"
    },
      {
    icon: <Shield className="w-8 h-8" />,
    title: "Safe Environment",
    description: "Secure and well-lit study spaces for your peace of mind",
    color: "from-orange-500 to-orange-600"
  },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Study Community",
      description: "Join a community of dedicated learners",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
              title: "Established 2023",
      description: "Comfortable and well-equipped study spaces",
      color: "from-purple-500 to-purple-600"
    }
  ]

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [features.length])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate form
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all fields')
      setIsSubmitting(false)
      return
    }

    try {
      // Send to backend
      const res = await fetch(`${getBaseUrl()}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send message')
      }
      toast.success('Message sent! We will respond as soon as possible.')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error(error.message || 'Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success(`${field} copied to clipboard!`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const faqs = [
    {
      question: "How do I book a study seat?",
      answer: "You can book a seat through our online booking system. Simply visit the booking page, select your preferred date, time, and seat, then fill in your details to confirm. The process takes less than 2 minutes!"
    },
    {
      question: "What are your operating hours?",
              answer: "We are open from 6:30 AM to 11:00 AM, seven days a week, including holidays. This gives you 4.5 hours of study time every day to fit your schedule."
    },
    {
      question: "Can I cancel my booking?",
      answer: "Yes, you can cancel your booking up to 2 hours before your scheduled time. Cancellations made after this period may be subject to charges. We understand that sometimes plans change!"
    },
    {
      question: "Do you provide WiFi?",
      answer: "Yes, we provide high-speed WiFi free of charge to all our customers. Our internet connection is optimized for streaming, downloading, and online learning platforms."
    },
    {
      question: "Is there parking available?",
      answer: "Yes, we have free parking available for all our customers in the adjacent parking lot. The parking area is well-lit and secure for your peace of mind."
    },
    {
      question: "Can I bring my own food and drinks?",
      answer: "Yes, you can bring your own food and drinks. We just ask that you keep the study area clean and respect other students."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6"
            >
              <Zap className="w-4 h-4 mr-2" />
              We're here to help!
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-8">
              Have questions about our study rooms? We're here to help! 
              Reach out to us and we'll get back to you as soon as possible.
            </p>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto"
            >
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">365</div>
                <div className="text-sm text-primary-200">Days Open</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">&lt;2h</div>
                <div className="text-sm text-primary-200">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">99%</div>
                <div className="text-sm text-primary-200">Satisfaction</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Grid: Contact Info and Contact Form side by side */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Contact Info Cards */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Contact Information
              </h2>
              
              {contactInfo.filter(info => info.title !== 'Instagram').map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  onHoverStart={() => setHoveredContact(index)}
                  onHoverEnd={() => setHoveredContact(null)}
                  className="card hover:shadow-xl transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-start space-x-4">
                    <motion.div 
                      className={`w-12 h-12 bg-gradient-to-br ${info.color} rounded-lg flex items-center justify-center flex-shrink-0 text-white`}
                      animate={{ 
                        scale: hoveredContact === index ? 1.2 : 1,
                        rotate: hoveredContact === index ? 360 : 0
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {info.icon === 'Instagram' ? (
                        <Instagram className="w-6 h-6" />
                      ) : (
                        <info.icon className="w-6 h-6" />
                      )}
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {info.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {info.link ? (
                          <a
                            href={info.link}
                            className="text-gray-600 hover:text-primary-600 transition-colors duration-200 flex items-center group"
                          >
                            {info.content}
                            <ExternalLink className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ) : (
                          <span className="text-gray-600">{info.content}</span>
                        )}
                        <motion.button
                          onClick={() => handleCopy(info.content, info.title)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {copiedField === info.title ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </motion.button>
                      </div>
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ 
                          opacity: hoveredContact === index ? 1 : 0,
                          height: hoveredContact === index ? 'auto' : 0
                        }}
                        className="text-sm text-gray-500 mt-2"
                      >
                        {info.description}
                      </motion.p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="card bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <MessageSquare className="w-6 h-6 mr-2 text-primary-600" />
                Send us a Message
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Your message will be sent directly to thestudypointlibraryjeeran@gmail.com. We'll respond to your inquiry as soon as possible.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-field focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                      placeholder="Enter your full name"
                      required
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MailIcon className="w-4 h-4 inline mr-2" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input-field focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                      placeholder="Enter your email"
                      required
                    />
                  </motion.div>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="input-field focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                    placeholder="What's this about?"
                    required
                  />
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    className="input-field resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                    placeholder="Tell us more about your inquiry..."
                    required
                  ></textarea>
                </motion.div>
                
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Why Choose Us - full width below grid */}
      <div className="max-w-5xl mx-auto mb-10">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Why Choose Us?
          </h3>
          <div className="relative h-32 overflow-hidden rounded-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFeature}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className={`absolute inset-0 bg-gradient-to-br ${features[currentFeature].color} text-white p-6 flex items-center`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    {features[currentFeature].icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1">
                      {features[currentFeature].title}
                    </h4>
                    <p className="text-white/90 text-sm">
                      {features[currentFeature].description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            {/* Feature indicators */}
            <div className="absolute bottom-4 right-4 flex space-x-2">
              {features.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentFeature(idx)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === currentFeature ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Our Location - full width below Why Choose Us */}
      <div className="max-w-5xl mx-auto mb-16">
        <motion.div 
          className="card"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-primary-600" />
            Our Location
          </h3>
          <a 
            href="https://maps.app.goo.gl/6vpaxtKNA4ErmL2b6" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
          >
            <div className="relative overflow-hidden rounded-lg h-64 group cursor-pointer">
              {/* Location Image */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <div className="text-center text-white relative z-10">
                  <MapPin className="w-16 h-16 mx-auto mb-4 text-white/80" />
                  <h4 className="text-xl font-bold mb-2">The Study Point Library</h4>
                  <p className="text-lg mb-1">Jiran, Neemuch District</p>
                  <p className="text-sm text-white/80">Madhya Pradesh, India</p>
                  <div className="mt-4 flex items-center justify-center space-x-2">
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm">View on Google Maps</span>
                  </div>
                </div>
              </div>
              {/* Hover overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-black/20 flex items-center justify-center"
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                  <p className="font-semibold text-gray-900">Click to open map</p>
                  <p className="text-sm text-gray-600">Get directions to our location</p>
                </div>
              </motion.div>
            </div>
          </a>
          {/* Address Details */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-primary-600" />
              Complete Address
            </h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              The Study Point Library<br />
              Jiran, Neemuch District<br />
              Madhya Pradesh, India<br />
              <span className="text-primary-600 font-medium">Pin Code: 458441</span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Instagram - truly full width below Our Location */}
      <div className="w-full bg-gradient-to-r from-pink-50 to-pink-100 py-8 mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card flex flex-col md:flex-row items-center gap-8 p-8 w-full">
            <div className="flex-1 flex flex-col items-center md:items-start">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <Instagram className="w-5 h-5 mr-2 text-pink-500" />
                Follow Us on Instagram
              </h3>
              <a
                href="https://www.instagram.com/the_study_point_library_jeeran?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-5 py-2 bg-pink-500 text-white rounded-lg font-semibold shadow hover:bg-pink-600 transition-colors text-lg mt-2 mb-4"
              >
                @the_study_point_library_jeeran
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
              <p className="text-gray-600 text-sm max-w-md">
                See our latest updates, photos, and community moments. Join our growing online family!
              </p>
            </div>
            <div className="flex-1 flex justify-center">
              <a
                href="https://www.instagram.com/the_study_point_library_jeeran?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform"
              >
                <img
                  src="/images/insta-preview.png"
                  alt="Instagram Preview"
                  className="w-80 h-48 object-cover rounded-lg border-2 border-pink-200"
                />
              </a>
            </div>
          </div>
        </div>
      </div>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-2xl p-12 relative overflow-hidden">
            {/* Animated background elements */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"
            />
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Start Studying?
              </h2>
              <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                Don't wait! Book your study seat now and experience the perfect study environment.
              </p>
              <Link
                to="/booking"
                className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200 inline-flex items-center space-x-2 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <BookOpen className="w-5 h-5" />
                <span>Book Your Seat</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </motion.section>

      {/* FAQ SECTION AT BOTTOM */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions about booking, facilities, and our library policies.
            </p>
          </motion.div>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { question: "How do I book a seat?", answer: "Go to the Booking page, select your date and seat, fill in your details, and complete the payment online." },
              { question: "What are your operating hours?", answer: "We are open from 6:30 AM to 11:00 PM, 7 days a week, including holidays." },
              { question: "Is WiFi available?", answer: "Yes, we provide high-speed WiFi to all registered students." },
              { question: "Can I bring my own food and drinks?", answer: "Yes, you can bring your own food and drinks. Please keep the study area clean." },
              { question: "How do I contact the library?", answer: "You can use the Contact page or email us at thestudypointlibraryjeeran@gmail.com." },
              { question: "Is the library open on public holidays?", answer: "Yes, we are open every day of the year." },
              { question: "How do I pay for my booking?", answer: "You can pay online using UPI, debit/credit card, or net banking through our secure payment gateway." },
              { question: "Is there a quiet zone?", answer: "Yes, we have dedicated quiet zones for focused study." }
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="card border border-primary-100 hover:shadow-xl transition-all duration-300 bg-white/95"
              >
                <button
                  type="button"
                  className="w-full text-left flex items-center justify-between p-6 focus:outline-none"
                  onClick={() => setExpandedFaqHome(idx === expandedFaqHome ? null : idx)}
                >
                  <h3 className="text-lg font-semibold text-primary-700 pr-4">{faq.question}</h3>
                  <motion.div
                    animate={{ rotate: expandedFaqHome === idx ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {expandedFaqHome === idx ? (
                      <ArrowRight className="w-5 h-5 text-primary-600" />
                    ) : (
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    )}
                  </motion.div>
                </button>
                <AnimatePresence>
                  {expandedFaqHome === idx && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6"
                    >
                      <div className="border-t border-gray-200 pt-4">
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact 