import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User,
  ChevronUp,
  ChevronDown,
  BookOpen,
  Clock,
  MapPin,
  DollarSign,
  Wifi,
  Shield
} from 'lucide-react'
import toast from 'react-hot-toast'

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! 👋 I\'m your study assistant. How can I help you today?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Common questions and their responses
  const commonQuestions = {
    'booking': {
      keywords: ['book', 'booking', 'reserve', 'seat', 'how to book'],
      response: 'To book a study seat:\n1. Go to the Booking page\n2. Select your preferred date and time\n3. Choose from available seats\n4. Fill in your details\n5. Confirm your booking\n\nWe offer 4 hours (₹300) and full time (₹600) options.'
    },
    'hours': {
      keywords: ['hours', 'time', 'open', 'close', 'schedule'],
              response: 'We are open from 6:30 AM to 11:00 AM, seven days a week! That\'s 4.5 hours of study time every day to fit your schedule.'
    },
    'pricing': {
      keywords: ['price', 'cost', 'fee', 'money', '₹', 'rupees'],
      response: 'Our pricing:\n• 4 Hours (Morning/Evening): ₹300 per seat\n• Full Time: ₹600 per seat\n\nPayment is required at the time of booking.'
    },
    'location': {
      keywords: ['where', 'location', 'address', 'place', 'find'],
      response: 'We are located at:\nThe Study Point Library\nJiran, Neemuch District\nMadhya Pradesh, India\n\nYou can find us on Google Maps or contact us for directions.'
    },
    'wifi': {
      keywords: ['wifi', 'internet', 'connection', 'online'],
      response: 'Yes! We provide high-speed WiFi free of charge to all our customers. Our internet connection is optimized for streaming, downloading, and online learning platforms.'
    },
    'seats': {
      keywords: ['seat', 'seats', 'capacity', 'how many'],
              response: 'We have comfortable study seats available across two columns. You can select your preferred seat during the booking process. We were established on July 10th, 2023 as the first library in Jiran.'
    },
    'cancel': {
      keywords: ['cancel', 'cancellation', 'refund', 'change'],
      response: 'You can cancel your booking up to 2 hours before your scheduled time. Cancellations made after this period may be subject to charges. We understand that sometimes plans change!'
    },
    'contact': {
      keywords: ['contact', 'phone', 'email', 'reach', 'call'],
      response: 'You can reach us through:\n• Email: thestudypointlibraryjeeran@gmail.com\n• Phone: +91 7089290615\n• Instagram: @the_study_point_library_jeeran\n\nWe typically respond within 24 hours.'
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const findResponse = (message) => {
    const lowerMessage = message.toLowerCase()
    
    for (const [category, data] of Object.entries(commonQuestions)) {
      if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
        return data.response
      }
    }
    
    return 'I\'m sorry, I don\'t have information about that. Please contact us directly at thestudypointlibraryjeeran@gmail.com or call us for specific assistance.'
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = findResponse(inputMessage)
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1000)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickQuestions = [
    'How to book a seat?',
    'What are your hours?',
    'How much does it cost?',
    'Where are you located?'
  ]

  const handleQuickQuestion = (question) => {
    setInputMessage(question)
    setTimeout(() => handleSendMessage(), 100)
  }

  return (
    <>
      {/* Chatbot Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Study Assistant</h3>
                    <p className="text-xs text-primary-100">Online • Ready to help</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.type === 'bot' && (
                        <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="whitespace-pre-line text-sm">
                        {message.content}
                      </div>
                      {message.type === 'user' && (
                        <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-1">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Chatbot 