import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  Wifi, 
  Clock, 
  Users, 
  Star, 
  ArrowRight, 
  Play,
  Pause,
  Volume2,
  VolumeX,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Zap,
  Shield,
  Heart
} from "lucide-react";

const owners = [
  { 
    img: "/images/owner1.jpg", 
    name: "Jayesh Bhoot", 
    role: "Founder & Mechanical Engineer",
    bio: "Mechanical Engineer at Rajkot.",
    experience: "Mechanical Engineering"
  },
  { 
    img: "/images/owner2.jpg", 
    name: "Sunil Mukhadham", 
    role: "Founder & Operations Manager",
    bio: "Ensuring smooth operations and excellent customer service for our study community.",
    experience: "Operations Management"
  },
  { 
    img: "/images/owner3.jpg", 
    name: "Rakesh Bhoot", 
    role: "Founder & AVFO",
    bio: "Government official at Buda, dedicated to community development and education.",
    experience: "Government Service"
  },
  { 
    img: "/images/owner4.jpg", 
    name: "Satyam Bhoot", 
    role: "Founder & Software Developer",
    bio: "Software developer managing our digital infrastructure and technology solutions.",
    experience: "Software Development"
  },
  { 
    img: "/images/owner5.jpg", 
    name: "Jayesh Mukhadham", 
    role: "Founder & Business Owner",
    bio: "Business owner at Patidar Paints, taking care of accounts and financial management.",
    experience: "Business Management"
  },
];

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
    icon: <Clock className="w-8 h-8" />,
            title: "365 Days Open",
          description: "Open every day of the year for your study needs",
    color: "from-purple-500 to-purple-600"
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Community",
    description: "Join a community of dedicated learners",
    color: "from-green-500 to-green-600"
  }
];

const testimonials = [
  {
    name: "Abhivyakt Patidar",
    role: "JEE Aspirant",
    text: "The Study Point Library is the best place for focused study. The environment is peaceful and the WiFi is super fast!",
    rating: 5,
    avatar: "/images/owner1.jpg"
  },
  {
    name: "Vishal Rathore",
    role: "Banking Exam Aspirant",
    text: "The library's disciplined environment and extended hours helped me prepare for my banking exams without any distractions. Highly recommended for all competitive exam aspirants!",
    rating: 5,
    avatar: "/images/owner2.jpg"
  },
  {
    name: "Sushil Mali",
    role: "Aspirant",
    text: "I love the quiet zone and the resources available here. Highly recommended for any serious student!",
    rating: 5,
    avatar: "/images/owner3.jpg"
  }
];

const stats = [
          { number: "2023", label: "Established", icon: <BookOpen className="w-6 h-6" /> },
  { number: "99%", label: "Satisfaction Rate", icon: <Star className="w-6 h-6" /> },
  { number: "16.5h", label: "Daily Hours", icon: <Clock className="w-6 h-6" /> }
];

export default function Home() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hoveredOwner, setHoveredOwner] = useState(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);

  const images = [
    "/images/study-room-1.jpg",
    "/images/study-room-2.jpg", 
    "/images/study-room-3.jpg"
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying, testimonials.length]);

  // Auto-rotate hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden min-h-screen flex items-center">
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

        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8 py-12 sm:py-20 md:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6"
              >
                <Zap className="w-4 h-4 mr-2" />
                Extended Hours Available
              </motion.div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6">
                Welcome to
                <motion.span 
                  className="block text-primary-200"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    background: 'linear-gradient(90deg, #e5e7eb, #f3f4f6, #e5e7eb)',
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  The Study Point Library Jiran
                </motion.span>
              </h1>
              
              <motion.p 
                className="text-base sm:text-xl md:text-2xl text-primary-100 mb-6 sm:mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Book your ideal study seat from our comfortable spaces. Established on July 10th, 2023 - The first library in Jiran.
                Enjoy high-speed WiFi, quiet environment, and everything you need for productive study sessions.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col gap-3 sm:flex-row sm:gap-4"
              >
                <Link
                  to="/booking"
                  className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Book Your Seat
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary-600 transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Contact Us
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 mt-8 sm:mt-12"
              >
                {stats.map((stat, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    className="text-center"
                  >
                    <div className="text-lg sm:text-2xl md:text-3xl font-bold mb-1">{stat.number}</div>
                    <div className="text-xs sm:text-sm text-primary-200">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-white/20 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImage}
                    src={images[currentImage]}
                    alt="The Study Point Library Jiran"
                    className="w-full h-40 sm:h-64 object-cover rounded-xl mb-4 sm:mb-6"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                  />
                </AnimatePresence>
                
                {/* Image indicators */}
                <div className="flex justify-center space-x-2 mb-2 sm:mb-4">
                  {images.map((_, idx) => (
                    <motion.button
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentImage ? 'bg-white' : 'bg-white/30'
                      }`}
                      onClick={() => setCurrentImage(idx)}
                      whileHover={{ scale: 1.2 }}
                    />
                  ))}
                </div>

                <div className="text-center">
                  <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Perfect Study Environment</h3>
                  <p className="text-primary-200 text-xs sm:text-sm">Comfortable, quiet, and productive</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-10 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8">
          <motion.div 
            className="text-center mb-8 sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
              Why Choose Our Study Space?
            </h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">
              We provide everything you need for a successful study session
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                onHoverStart={() => setHoveredFeature(idx)}
                onHoverEnd={() => setHoveredFeature(null)}
                className="relative group"
              >
                <div className={`p-4 sm:p-6 rounded-2xl bg-gradient-to-br ${feature.color} text-white text-center transition-all duration-300 transform group-hover:scale-105 shadow-lg group-hover:shadow-xl`}>
                  <motion.div
                    animate={{ 
                      rotate: hoveredFeature === idx ? 360 : 0,
                      scale: hoveredFeature === idx ? 1.2 : 1
                    }}
                    transition={{ duration: 0.3 }}
                    className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full mb-2 sm:mb-4"
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-base sm:text-xl font-semibold mb-1 sm:mb-2">{feature.title}</h3>
                  <p className="text-white/90 text-xs sm:text-base">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section className="py-10 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8">
          <motion.div 
            className="text-center mb-8 sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
              Our Study Environment
            </h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Take a look at our comfortable and well-equipped study spaces designed for maximum productivity.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {images.map((image, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="relative group overflow-hidden rounded-2xl shadow-lg"
              >
                <img 
                  src={image} 
                  alt={`Study Area ${idx + 1}`} 
                  className="w-full h-40 sm:h-64 object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 text-white">
                    <h3 className="text-base sm:text-lg font-semibold mb-0.5 sm:mb-1">
                      {idx === 0 ? 'Main Study Area' : idx === 1 ? 'Quiet Zone' : 'Refreshment Area'}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/80">
                      {idx === 0 ? 'Spacious and well-lit study environment' : 
                       idx === 1 ? 'Perfect for focused study sessions' : 
                       'Relax and recharge between sessions'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-10 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8">
          <motion.div 
            className="text-center mb-8 sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
              What Our Students Say About Us
            </h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Hear directly from our students and their real experiences at Study Point Library Jiran.
            </p>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto text-center"
              >
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-4 sm:p-8 md:p-12">
                  <div className="flex justify-center mb-4 sm:mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 sm:w-6 sm:h-6 ${
                          i < testimonials[currentTestimonial].rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <blockquote className="text-base sm:text-xl md:text-2xl text-gray-700 mb-4 sm:mb-8 italic">
                    "{testimonials[currentTestimonial].text}"
                  </blockquote>
                  
                  <div className="flex items-center justify-center space-x-2 sm:space-x-4">
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 text-sm sm:text-base">
                        {testimonials[currentTestimonial].name}
                      </div>
                      <div className="text-gray-600 text-xs sm:text-sm">
                        {testimonials[currentTestimonial].role}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Testimonial controls */}
            <div className="flex justify-center items-center space-x-2 sm:space-x-4 mt-4 sm:mt-8">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentTestimonial(idx)}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-colors ${
                    idx === currentTestimonial ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MEET THE OWNERS SECTION */}
      <section className="py-10 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8">
          <motion.div 
            className="text-center mb-8 sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
              Meet the Team
            </h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">
              The Study Point Library Jiran is run by passionate individuals dedicated to providing the best study environment.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-8">
            {owners.map((owner, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                onHoverStart={() => setHoveredOwner(idx)}
                onHoverEnd={() => setHoveredOwner(null)}
                className="flex flex-col items-center group cursor-pointer text-center h-full"
              >
                <div className="relative mb-2 sm:mb-4">
                  <motion.img
                    src={owner.img}
                    alt={owner.name}
                    className="w-20 h-20 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-primary-600 shadow-lg"
                    animate={{ 
                      scale: hoveredOwner === idx ? 1.1 : 1,
                      rotateY: hoveredOwner === idx ? 180 : 0
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredOwner === idx ? 1 : 0 }}
                    className="absolute inset-0 rounded-full bg-primary-600/20 flex items-center justify-center"
                  >
                    <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
                  </motion.div>
                </div>
                
                {/* Owner details: always visible on mobile, animated on hover for desktop */}
                {/* Mobile: always visible */}
                <div className="block sm:hidden text-center w-full flex-1 flex flex-col justify-center">
                  <div className="font-semibold text-gray-900 text-base mb-0.5 leading-tight">{owner.name}</div>
                  <div className="text-primary-600 font-medium text-xs mb-1 leading-tight">{owner.role}</div>
                  <div className="text-gray-600 text-xs mb-1 leading-tight">{owner.experience}</div>
                  <p className="text-gray-500 text-xs leading-relaxed min-h-[2rem] flex items-center justify-center">{owner.bio}</p>
                </div>
                {/* Desktop: fade in on hover */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: hoveredOwner === idx ? 1 : 0, y: hoveredOwner === idx ? 0 : 10 }}
                  className="hidden sm:flex text-center w-full flex-1 flex-col justify-center transition-opacity duration-300"
                >
                  <div className="font-semibold text-gray-900 text-lg mb-1 leading-tight">{owner.name}</div>
                  <div className="text-primary-600 font-medium text-sm mb-2 leading-tight">{owner.role}</div>
                  <div className="text-gray-600 text-xs mb-2 leading-tight">{owner.experience}</div>
                  <p className="text-gray-500 text-xs leading-relaxed min-h-[3rem] flex items-center justify-center">{owner.bio}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-10 sm:py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Ready to Start Your Study Journey?
            </h2>
            <p className="text-base sm:text-lg text-primary-100 mb-4 sm:mb-8 max-w-2xl mx-auto">
              Join hundreds of students who have found their perfect study environment with us.<br />
              <span className="text-xs sm:text-sm text-primary-200">Contact: thestudypointlibraryjeeran@gmail.com</span>
            </p>
            <Link
              to="/booking"
              className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Book Your Seat Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 