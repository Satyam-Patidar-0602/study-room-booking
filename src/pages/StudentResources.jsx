import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Calculator, 
  Clock, 
  Target, 
  Calendar,
  FileText,
  Brain,
  Lightbulb,
  Users,
  Star,
  Download,
  ExternalLink,
  Search,
  Filter,
  Bookmark,
  Share2,
  Eye,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react'
import { downloadStudyMaterial } from '../utils/pdfGenerator'

const StudentResources = () => {
  
  const [activeTab, setActiveTab] = useState('mocktest')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Add this state for mock test
  const [selectedMockTest, setSelectedMockTest] = useState('mppsc')
  const [userAnswers, setUserAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)

  // Mock test data
  const mockTests = {
    mppsc: {
      name: 'MPPSC Prelims Mock Test',
      questions: [
        {
          q: 'Who was the first woman Chief Minister of Madhya Pradesh?',
          options: ['Uma Bharti', 'Sushma Swaraj', 'Vijaya Raje Scindia', 'Kamalapati Tripathi'],
          answer: 0
        },
        {
          q: 'The Tropic of Cancer passes through how many districts of Madhya Pradesh?',
          options: ['8', '14', '10', '12'],
          answer: 1
        },
        {
          q: "Which river is known as the 'Lifeline of Madhya Pradesh'?",
          options: ['Narmada', 'Tapti', 'Betwa', 'Chambal'],
          answer: 0
        },
        {
          q: "Who is the author of the book 'Discovery of India'?",
          options: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Sardar Patel', 'Subhash Chandra Bose'],
          answer: 1
        },
        {
          q: 'The largest tribal group in Madhya Pradesh is:',
          options: ['Bhil', 'Gond', 'Baiga', 'Korku'],
          answer: 1
        }
      ]
    },
    uppsc: {
      name: 'UPPSC GS Paper 1 Practice Set',
      questions: [
        {
          q: 'Who was the first Governor of Uttar Pradesh?',
          options: ['Sarojini Naidu', 'Govind Ballabh Pant', 'Sampurnanand', 'Sucheta Kriplani'],
          answer: 0
        },
        {
          q: 'The city of Nawabs is:',
          options: ['Kanpur', 'Lucknow', 'Varanasi', 'Allahabad'],
          answer: 1
        },
        {
          q: "The famous 'Kumbh Mela' is held in which city of Uttar Pradesh?",
          options: ['Mathura', 'Prayagraj', 'Agra', 'Bareilly'],
          answer: 1
        },
        {
          q: "Who is known as the 'Father of Indian Green Revolution'?",
          options: ['M.S. Swaminathan', 'Norman Borlaug', 'C. Subramaniam', 'Verghese Kurien'],
          answer: 0
        },
        {
          q: 'The official language of Uttar Pradesh is:',
          options: ['Hindi', 'Urdu', 'English', 'Sanskrit'],
          answer: 0
        }
      ]
    },
    mpboard: {
      name: 'MP Board Class 12 Model Paper',
      questions: [
        {
          q: "What is Ohm's Law? State its mathematical expression.",
          options: [
            'V = IR',
            'P = VI',
            'I = V/R',
            'R = V/I'
          ],
          answer: 0
        },
        {
          q: 'What is the pH value of a neutral solution at 25°C?',
          options: ['5', '6', '7', '8'],
          answer: 2
        },
        {
          q: 'Find the derivative of sin x with respect to x.',
          options: ['sin x', 'cos x', '-sin x', '-cos x'],
          answer: 1
        },
        {
          q: 'What is the functional unit of kidney?',
          options: ['Neuron', 'Nephron', 'Alveoli', 'Glomerulus'],
          answer: 1
        },
        {
          q: 'Name the process by which green plants make their food.',
          options: ['Respiration', 'Transpiration', 'Photosynthesis', 'Fermentation'],
          answer: 2
        }
      ]
    }
  }

  // Study Progress State
  const [studyGoals, setStudyGoals] = useState(() => {
    const saved = localStorage.getItem('studyGoals')
    return saved ? JSON.parse(saved) : [
      { id: 1, subject: 'Mathematics', target: 120, completed: 0, unit: 'minutes' },
      { id: 2, subject: 'Physics', target: 90, completed: 0, unit: 'minutes' },
      { id: 3, subject: 'Chemistry', target: 60, completed: 0, unit: 'minutes' },
      { id: 4, subject: 'English', target: 45, completed: 0, unit: 'minutes' }
    ]
  })

  // Save goals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('studyGoals', JSON.stringify(studyGoals))
  }, [studyGoals])

  // Add study time to a subject
  const addStudyTime = (subjectId, minutes) => {
    setStudyGoals(prev => prev.map(goal => 
      goal.id === subjectId 
        ? { ...goal, completed: Math.min(goal.completed + minutes, goal.target) }
        : goal
    ))
  }

  // Study Materials
  const studyMaterials = [
    {
      id: 1,
      title: 'NCERT Solutions - Class 12',
      category: 'ncert',
      description: 'Complete NCERT solutions for Physics, Chemistry, Mathematics',
      icon: <BookOpen className="w-6 h-6" />,
      downloadUrl: '/materials/ncert-class12-solutions.txt',
      rating: 4.8,
      downloads: 1250
    },
    {
      id: 2,
      title: 'JEE Main Previous Papers',
      category: 'jee',
      description: 'Last 5 years JEE Main question papers with solutions',
      icon: <FileText className="w-6 h-6" />,
      downloadUrl: '/materials/jee-main-previous-papers.txt',
      rating: 4.9,
      downloads: 2100
    },
    {
      id: 3,
      title: 'NEET Biology Notes',
      category: 'neet',
      description: 'Comprehensive biology notes for NEET preparation',
      icon: <Brain className="w-6 h-6" />,
      downloadUrl: '/materials/neet-biology-notes.txt',
      rating: 4.7,
      downloads: 1800
    },
    {
      id: 4,
      title: 'UPSC Current Affairs',
      category: 'upsc',
      description: 'Monthly current affairs compilation for UPSC',
      icon: <TrendingUp className="w-6 h-6" />,
      downloadUrl: '/materials/upsc-current-affairs.txt',
      rating: 4.6,
      downloads: 950
    },
    {
      id: 5,
      title: 'SSC Quantitative Aptitude',
      category: 'ssc',
      description: 'Complete quantitative aptitude guide for SSC exams',
      icon: <Calculator className="w-6 h-6" />,
      downloadUrl: '/materials/ssc-quantitative-aptitude.txt',
      rating: 4.5,
      downloads: 1100
    },
    {
      id: 6,
      title: 'MPSC Study Material',
      category: 'mpsc',
      description: 'Maharashtra Public Service Commission study resources',
      icon: <Award className="w-6 h-6" />,
      downloadUrl: '/materials/mpsc-study-material.txt',
      rating: 4.4,
      downloads: 750
    },
    {
      id: 7,
      title: 'JEE Advanced Mock Tests',
      category: 'jee',
      description: 'Full-length mock tests with detailed solutions for JEE Advanced',
      icon: <Target className="w-6 h-6" />,
      downloadUrl: '/materials/jee-advanced-mock-tests.txt',
      rating: 4.8,
      downloads: 1650
    },
    {
      id: 8,
      title: 'NEET Physics Formulas',
      category: 'neet',
      description: 'Complete physics formula sheet with examples for NEET',
      icon: <Zap className="w-6 h-6" />,
      downloadUrl: '/materials/neet-physics-formulas.txt',
      rating: 4.6,
      downloads: 1400
    },
    {
      id: 9,
      title: 'UPSC History Notes',
      category: 'upsc',
      description: 'Comprehensive Indian history notes for UPSC CSE',
      icon: <BookOpen className="w-6 h-6" />,
      downloadUrl: '/materials/upsc-history-notes.txt',
      rating: 4.7,
      downloads: 1200
    },
    {
      id: 10,
      title: 'SSC English Grammar',
      category: 'ssc',
      description: 'Complete English grammar guide for SSC exams',
      icon: <FileText className="w-6 h-6" />,
      downloadUrl: '/materials/ssc-english-grammar.txt',
      rating: 4.5,
      downloads: 980
    },
    {
      id: 11,
      title: 'NCERT Class 11 Solutions',
      category: 'ncert',
      description: 'NCERT solutions for Class 11 Physics, Chemistry, Biology',
      icon: <BookOpen className="w-6 h-6" />,
      downloadUrl: '/materials/ncert-class11-solutions.txt',
      rating: 4.7,
      downloads: 1350
    },
    {
      id: 12,
      title: 'JEE Chemistry Notes',
      category: 'jee',
      description: 'Comprehensive chemistry notes for JEE Main and Advanced',
      icon: <Brain className="w-6 h-6" />,
      downloadUrl: '/materials/jee-chemistry-notes.txt',
      rating: 4.8,
      downloads: 1900
    },
    {
      id: 13,
      title: 'NEET Chemistry Practice',
      category: 'neet',
      description: 'Practice questions and solutions for NEET Chemistry',
      icon: <Calculator className="w-6 h-6" />,
      downloadUrl: '/materials/neet-chemistry-practice.txt',
      rating: 4.6,
      downloads: 1100
    },
    {
      id: 14,
      title: 'UPSC Geography Notes',
      category: 'upsc',
      description: 'Indian and world geography notes for UPSC preparation',
      icon: <TrendingUp className="w-6 h-6" />,
      downloadUrl: '/materials/upsc-geography-notes.txt',
      rating: 4.5,
      downloads: 850
    },
    {
      id: 15,
      title: 'SSC Reasoning Guide',
      category: 'ssc',
      description: 'Complete reasoning and logical thinking guide for SSC',
      icon: <Brain className="w-6 h-6" />,
      downloadUrl: '/materials/ssc-reasoning-guide.txt',
      rating: 4.4,
      downloads: 920
    },
    {
      id: 16,
      title: 'MPSC Geography Notes',
      category: 'mpsc',
      description: 'Maharashtra geography and culture notes for MPSC',
      icon: <Award className="w-6 h-6" />,
      downloadUrl: '/materials/mpsc-geography-notes.txt',
      rating: 4.3,
      downloads: 680
    },
    {
      id: 17,
      title: 'JEE Mathematics Formulas',
      category: 'jee',
      description: 'Complete mathematics formula sheet for JEE preparation',
      icon: <Calculator className="w-6 h-6" />,
      downloadUrl: '/materials/jee-mathematics-formulas.txt',
      rating: 4.9,
      downloads: 2200
    },
    {
      id: 18,
      title: 'NEET Previous Year Papers',
      category: 'neet',
      description: 'Last 10 years NEET question papers with solutions',
      icon: <FileText className="w-6 h-6" />,
      downloadUrl: '/materials/neet-previous-year-papers.txt',
      rating: 4.8,
      downloads: 1750
    },
    {
      id: 19,
      title: 'UPSC Polity Notes',
      category: 'upsc',
      description: 'Indian polity and constitution notes for UPSC',
      icon: <BookOpen className="w-6 h-6" />,
      downloadUrl: '/materials/upsc-polity-notes.txt',
      rating: 4.7,
      downloads: 1050
    },
    {
      id: 20,
      title: 'SSC General Knowledge',
      category: 'ssc',
      description: 'Comprehensive GK guide for SSC exams',
      icon: <Brain className="w-6 h-6" />,
      downloadUrl: '/materials/ssc-general-knowledge.txt',
      rating: 4.4,
      downloads: 890
    },
    {
      id: 21,
      title: 'NCERT Class 10 Solutions',
      category: 'ncert',
      description: 'NCERT solutions for Class 10 Science and Mathematics',
      icon: <BookOpen className="w-6 h-6" />,
      downloadUrl: '/materials/ncert-class10-solutions.txt',
      rating: 4.6,
      downloads: 1450
    },
    {
      id: 22,
      title: 'JEE Physics Practice',
      category: 'jee',
      description: 'Physics practice questions with detailed solutions',
      icon: <Zap className="w-6 h-6" />,
      downloadUrl: '/materials/jee-physics-practice.txt',
      rating: 4.7,
      downloads: 1600
    },
    {
      id: 23,
      title: 'NEET Mock Test Series',
      category: 'neet',
      description: 'Complete mock test series for NEET preparation',
      icon: <Target className="w-6 h-6" />,
      downloadUrl: '/materials/neet-mock-test-series.txt',
      rating: 4.8,
      downloads: 1850
    },
    {
      id: 24,
      title: 'UPSC Economics Notes',
      category: 'upsc',
      description: 'Indian economy notes for UPSC civil services',
      icon: <TrendingUp className="w-6 h-6" />,
      downloadUrl: '/materials/upsc-economics-notes.txt',
      rating: 4.6,
      downloads: 950
    },
    {
      id: 25,
      title: 'MPPSC Prelims Mock Test 2024',
      category: 'mppsc',
      description: 'Full-length mock test for MPPSC Prelims with answer key and explanations',
      icon: <Award className="w-6 h-6" />,
      downloadUrl: '/materials/mppsc-prelims-mock-test.txt',
      rating: 4.7,
      downloads: 800
    },
    {
      id: 26,
      title: 'UPPSC GS Paper 1 Practice Set',
      category: 'uppsc',
      description: 'General Studies Paper 1 practice set for UPPSC with solutions',
      icon: <Award className="w-6 h-6" />,
      downloadUrl: '/materials/uppsc-gs-paper1-practice.txt',
      rating: 4.6,
      downloads: 650
    },
    {
      id: 27,
      title: 'MP Board Class 12 Model Paper',
      category: 'mpboard',
      description: 'Sample model paper for MP Board Class 12 (Science stream)',
      icon: <BookOpen className="w-6 h-6" />,
      downloadUrl: '/materials/mpboard-class12-model-paper.txt',
      rating: 4.8,
      downloads: 900
    },
  ]

  // Study Tips
  const studyTips = [
    {
      id: 1,
      title: 'Pomodoro Technique',
      description: 'Study in 25-minute focused sessions with 5-minute breaks',
      icon: <Clock className="w-6 h-6" />,
      category: 'technique'
    },
    {
      id: 2,
      title: 'Active Recall',
      description: 'Test yourself instead of just re-reading material',
      icon: <Brain className="w-6 h-6" />,
      category: 'technique'
    },
    {
      id: 3,
      title: 'Spaced Repetition',
      description: 'Review material at increasing intervals',
      icon: <Calendar className="w-6 h-6" />,
      category: 'technique'
    },
    {
      id: 4,
      title: 'Mind Mapping',
      description: 'Create visual diagrams to connect concepts',
      icon: <Lightbulb className="w-6 h-6" />,
      category: 'technique'
    },
    {
      id: 5,
      title: 'Group Study Sessions',
      description: 'Learn with peers to gain different perspectives',
      icon: <Users className="w-6 h-6" />,
      category: 'collaboration'
    },
    {
      id: 6,
      title: 'Digital Note-Taking',
      description: 'Use apps like Notion or OneNote for organized notes',
      icon: <FileText className="w-6 h-6" />,
      category: 'technology'
    }
  ]

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Categories', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'ncert', name: 'NCERT', icon: <FileText className="w-4 h-4" /> },
    { id: 'jee', name: 'JEE', icon: <Target className="w-4 h-4" /> },
    { id: 'neet', name: 'NEET', icon: <Brain className="w-4 h-4" /> },
    { id: 'upsc', name: 'UPSC', icon: <Award className="w-4 h-4" /> },
    { id: 'ssc', name: 'SSC', icon: <Calculator className="w-4 h-4" /> },
    { id: 'mpsc', name: 'MPSC', icon: <Star className="w-4 h-4" /> },
    { id: 'mppsc', name: 'MPPSC', icon: <Award className="w-4 h-4" /> },
    { id: 'uppsc', name: 'UPPSC', icon: <Award className="w-4 h-4" /> },
    { id: 'mpboard', name: 'MP Board', icon: <BookOpen className="w-4 h-4" /> },
  ]

  // Study session tracking (simplified for progress tracking)
  const [sessionHistory, setSessionHistory] = useState(() => {
    const saved = localStorage.getItem('sessionHistory')
    return saved ? JSON.parse(saved) : []
  })

  const filteredMaterials = studyMaterials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Student Resources Hub
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Everything you need for successful exam preparation. Study materials, tools, and tips to help you excel.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: 'mocktest', name: 'Mock Test', icon: <Award className="w-4 h-4" /> },
              { id: 'materials', name: 'Study Materials', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'tips', name: 'Study Tips', icon: <Lightbulb className="w-4 h-4" /> },
              { id: 'progress', name: 'Progress Tracker', icon: <TrendingUp className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setShowResults(false)
                  setUserAnswers({})
                }}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Mock Test Tab */}
        {activeTab === 'mocktest' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Award className="w-6 h-6 mr-2 text-primary-600" />
                Mock Test
              </h2>
              {/* Test Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Mock Test
                </label>
                <select
                  value={selectedMockTest}
                  onChange={e => {
                    setSelectedMockTest(e.target.value)
                    setUserAnswers({})
                    setShowResults(false)
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="mppsc">MPPSC Prelims Mock Test</option>
                  <option value="uppsc">UPPSC GS Paper 1 Practice Set</option>
                  <option value="mpboard">MP Board Class 12 Model Paper</option>
                </select>
              </div>
              {/* Questions */}
              {!showResults ? (
                <form
                  onSubmit={e => {
                    e.preventDefault()
                    setShowResults(true)
                  }}
                  className="space-y-6"
                >
                  {mockTests[selectedMockTest].questions.map((q, idx) => (
                    <div key={idx} className="mb-4">
                      <div className="font-medium mb-2">
                        Q{idx + 1}. {q.q}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options.map((opt, oidx) => (
                          <label key={oidx} className={`flex items-center p-2 rounded-lg border cursor-pointer transition-colors ${userAnswers[idx] === oidx ? 'bg-primary-100 border-primary-600' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                            <input
                              type="radio"
                              name={`q${idx}`}
                              value={oidx}
                              checked={userAnswers[idx] === oidx}
                              onChange={() => setUserAnswers({ ...userAnswers, [idx]: oidx })}
                              className="mr-2"
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold mt-4"
                  >
                    Submit
                  </button>
                </form>
              ) : (
                <div className="mt-6">
                  <h3 className="text-xl font-bold mb-4">Results</h3>
                  <div className="mb-4 text-lg font-medium">
                    Score: {Object.entries(userAnswers).filter(([idx, ans]) => mockTests[selectedMockTest].questions[idx].answer === ans).length} / {mockTests[selectedMockTest].questions.length}
                  </div>
                  <div className="space-y-4">
                    {mockTests[selectedMockTest].questions.map((q, idx) => (
                      <div key={idx} className="p-4 rounded-lg border bg-gray-50">
                        <div className="font-medium mb-1">
                          Q{idx + 1}. {q.q}
                        </div>
                        <div className="mb-1">
                          <span className="font-semibold">Your answer: </span>
                          {typeof userAnswers[idx] === 'number' ? q.options[userAnswers[idx]] : <span className="italic text-gray-400">Not answered</span>}
                        </div>
                        <div>
                          <span className="font-semibold">Correct answer: </span>
                          {q.options[q.answer]}
                        </div>
                        {userAnswers[idx] === q.answer ? (
                          <div className="text-green-600 font-semibold mt-1">Correct</div>
                        ) : (
                          <div className="text-red-600 font-semibold mt-1">Incorrect</div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setShowResults(false)
                      setUserAnswers({})
                    }}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold mt-6"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Study Materials Tab */}
        {activeTab === 'materials' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Search and Filter */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search study materials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedCategory === category.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.icon}
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Materials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material) => (
                <motion.div
                  key={material.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-primary-600">
                        {material.icon}
                      </div>
                      <div className="flex items-center space-x-1 text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm text-gray-600">{material.rating}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {material.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4">
                      {material.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {material.downloads} downloads
                      </span>
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                          <Bookmark className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            // Check if we have PDF content for this material
                            const materialId = material.downloadUrl.split('/').pop().replace('.txt', '')
                            if (materialId === 'ncert-class12-solutions' || 
                                materialId === 'jee-main-previous-papers' || 
                                materialId === 'neet-biology-notes' || 
                                materialId === 'upsc-current-affairs') {
                              downloadStudyMaterial(materialId)
                            } else {
                              // Fallback to text file download for other materials
                              const link = document.createElement('a')
                              link.href = material.downloadUrl
                              link.download = material.title.replace(/\s+/g, '-').toLowerCase() + '.txt'
                              document.body.appendChild(link)
                              link.click()
                              document.body.removeChild(link)
                            }
                          }}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                        >
                          <Download className="w-4 h-4 inline mr-1" />
                          Download PDF
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Study Tips Tab */}
        {activeTab === 'tips' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studyTips.map((tip) => (
                <motion.div
                  key={tip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="text-primary-600 mb-4">
                    {tip.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {tip.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {tip.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Progress Tracker Tab */}
        {activeTab === 'progress' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-primary-600" />
                Study Progress Tracker
              </h2>
              
              {/* Add New Goal */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Add New Study Goal</h3>
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Subject name"
                    id="newSubject"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Target minutes"
                    id="newTarget"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => {
                      const subject = document.getElementById('newSubject').value
                      const target = parseInt(document.getElementById('newTarget').value)
                      if (subject && target) {
                        const newGoal = {
                          id: Date.now(),
                          subject,
                          target,
                          completed: 0,
                          unit: 'minutes'
                        }
                        setStudyGoals(prev => [...prev, newGoal])
                        document.getElementById('newSubject').value = ''
                        document.getElementById('newTarget').value = ''
                      }
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Add Goal
                  </button>
                </div>
              </div>
              
              <div className="space-y-6">
                {studyGoals.map((goal) => {
                  const percentage = (goal.completed / goal.target) * 100
                  return (
                    <div key={goal.id} className="space-y-2 p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{goal.subject}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">
                            {goal.completed}/{goal.target} {goal.unit}
                          </span>
                          <button
                            onClick={() => addStudyTime(goal.id, 15)}
                            className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                          >
                            +15min
                          </button>
                          <button
                            onClick={() => setStudyGoals(prev => prev.filter(g => g.id !== goal.id))}
                            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                        {percentage >= 100 && (
                          <span className="text-sm text-green-600 font-medium">🎉 Goal Achieved!</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Weekly Summary */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Weekly Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {sessionHistory.filter(s => {
                        const weekAgo = new Date()
                        weekAgo.setDate(weekAgo.getDate() - 7)
                        return new Date(s.date) > weekAgo
                      }).length}
                    </div>
                    <div className="text-sm text-blue-600">Sessions This Week</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {sessionHistory.filter(s => {
                        const weekAgo = new Date()
                        weekAgo.setDate(weekAgo.getDate() - 7)
                        return new Date(s.date) > weekAgo
                      }).reduce((total, s) => total + s.duration, 0)}
                    </div>
                    <div className="text-sm text-green-600">Minutes This Week</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {studyGoals.filter(g => (g.completed / g.target) >= 1).length}
                    </div>
                    <div className="text-sm text-purple-600">Goals Completed</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {studyGoals.length > 0 ? Math.round(studyGoals.reduce((total, g) => total + (g.completed / g.target), 0) / studyGoals.length * 100) : 0}%
                    </div>
                    <div className="text-sm text-orange-600">Average Progress</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default StudentResources 