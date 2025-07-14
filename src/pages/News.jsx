import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Clock, 
  ExternalLink, 
  Filter,
  Globe,
  TrendingUp,
  BookOpen,
  Calendar
} from 'lucide-react'
import BrandedImage from '../components/BrandedImage'


const News = () => {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('general')
  const [page, setPage] = useState(1)
  const [totalResults, setTotalResults] = useState(0)

  // NewsAPI.org configuration
  const API_KEY = "5fbf066517144d3a9192051f1c38a431"
  const BASE_URL = "https://newsapi.org/v2"

  const categories = [
    { id: 'general', name: 'General', icon: <Globe className="w-4 h-4" /> },
    { id: 'technology', name: 'Technology', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'education', name: 'Education', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'business', name: 'Business', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'science', name: 'Science', icon: <Globe className="w-4 h-4" /> },
    { id: 'health', name: 'Health', icon: <Globe className="w-4 h-4" /> },
    { id: 'sports', name: 'Sports', icon: <Globe className="w-4 h-4" /> },
    { id: 'entertainment', name: 'Entertainment', icon: <Globe className="w-4 h-4" /> }
  ]

  // Function to build API URL
  const buildApiUrl = useCallback((search = '', cat = category, pageNum = page) => {
    let url = ''
    
    console.log('Building URL with:', { search, cat, pageNum })
    
    if (search) {
      // For search queries, use everything endpoint (country param not supported)
      url = `${BASE_URL}/everything?q=${encodeURIComponent(search)}&apiKey=${API_KEY}&page=${pageNum}&pageSize=12&sortBy=popularity&language=en`
    } else if (cat === 'education') {
      // Education category has no results, use search instead
      url = `${BASE_URL}/everything?q=education&apiKey=${API_KEY}&page=${pageNum}&pageSize=12&sortBy=popularity&language=en`
    } else {
      // For other categories, use top-headlines endpoint
      url = `${BASE_URL}/top-headlines?category=${cat}&apiKey=${API_KEY}&page=${pageNum}&pageSize=12`
    }

    console.log('Built URL:', url)
    return url
  }, [API_KEY, category, page])

  // Function to fetch news from NewsAPI.org
  const fetchNews = useCallback(async (search = '', cat = category, pageNum = 1, append = false) => {
    if (!append) {
      setLoading(true)
    }
    setError(null)
    
    try {
      const url = buildApiUrl(search, cat, pageNum)
      console.log('Fetching news from:', url)

      // Use CORS proxy to avoid browser restrictions
      console.log('Making API call through CORS proxy')
      
      // Try different CORS proxies
      const corsProxies = [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
        'https://thingproxy.freeboard.io/fetch/'
      ]
      
      let response = null
      let lastError = null
      
      for (const proxy of corsProxies) {
        try {
          const fullUrl = proxy + encodeURIComponent(url)
          console.log('Trying proxy:', proxy)
          
          // Add timeout to prevent hanging requests
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout
          
          response = await fetch(fullUrl, {
            method: 'GET',
            signal: controller.signal
            // No custom headers to avoid CORS issues
          })
          
          clearTimeout(timeoutId)
          
          if (response.ok) {
            console.log('Success with proxy:', proxy)
            break
          }
        } catch (err) {
          console.log('Failed with proxy:', proxy, err.message)
          lastError = err
          continue
        }
      }
      
      if (!response || !response.ok) {
        throw lastError || new Error('All CORS proxies failed')
      }

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      if (!response.ok) {
        console.error('Response not ok:', response.status, response.statusText)
        if (response.status === 429) {
          throw new Error('API rate limit exceeded. Please try again later.')
        } else if (response.status === 401) {
          throw new Error('API authentication failed.')
        } else if (response.status === 403) {
          throw new Error('API access forbidden. CORS or domain restrictions may apply.')
        } else {
          throw new Error(`API request failed with status: ${response.status}`)
        }
      }

      const data = await response.json()
      console.log('API Response:', data)

      if (data.status === 'error') {
        throw new Error(data.message || 'API returned an error')
      }

      if (data.articles && data.articles.length > 0) {
        if (append) {
          // Append to existing articles for pagination
          setArticles(prev => [...prev, ...data.articles])
        } else {
          // Replace articles for new search/category
          setArticles(data.articles)
        }
        setTotalResults(data.totalResults || data.articles.length)
        setError(null)
      } else {
        // If no articles found, show a more specific message
        if (search) {
          throw new Error(`No articles found for "${search}". Try a different search term.`)
        } else {
          throw new Error(`No ${cat} news available at the moment.`)
        }
      }
    } catch (err) {
      console.error('Error fetching news:', err)
      setError('Unable to fetch live news at the moment. Showing curated content.')
      
      // Enhanced sample news data with Hindi and English content
      const sampleNews = [
        {
          title: "Study Point Library Jiran Celebrates 1 Year Anniversary",
          description: "The first library in Jiran, established on July 10th, 2023, celebrates its first successful year of serving students and the community. Over 500 students have benefited from our services.",
          url: "#",
          urlToImage: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&fit=crop&crop=center",
          publishedAt: new Date().toISOString(),
          source: { name: "Local News" }
        },
        {
          title: "UPSC परीक्षा की तैयारी के लिए Study Point Library में सफलता",
          description: "जिरान और आसपास के क्षेत्रों के सिविल सेवा उम्मीदवार उत्कृष्ट परिणाम प्राप्त कर रहे हैं। हमारी लाइब्रेरी UPSC की तैयारी के लिए आदर्श वातावरण प्रदान करती है।",
          url: "#",
          urlToImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&fit=crop&crop=center",
          publishedAt: new Date(Date.now() - 86400000).toISOString(),
          source: { name: "शिक्षा आज" }
        },
        {
          title: "JEE और NEET के छात्रों को लाइब्रेरी से मिल रही सफलता",
          description: "इंजीनियरिंग और मेडिकल के उम्मीदवार Study Point Library में समर्पित अध्ययन सत्र के माध्यम से महान सफलता प्राप्त कर रहे हैं।",
          url: "#",
          urlToImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
          publishedAt: new Date(Date.now() - 172800000).toISOString(),
          source: { name: "प्रतियोगी परीक्षाएं" }
        },
        {
          title: "Madhya Pradesh Education Department Recognizes Study Point Library",
          description: "The MP Education Department has commended Study Point Library Jiran for its contribution to student success. Our facility serves as a model for community-based learning centers.",
          url: "#",
          urlToImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
          publishedAt: new Date(Date.now() - 259200000).toISOString(),
          source: { name: "Government News" }
        },
        {
          title: "डिजिटल इंडिया: लाइब्रेरी में मुफ्त ऑनलाइन संसाधन",
          description: "Study Point Library डिजिटल इंडिया को अपनाते हुए ऑनलाइन अध्ययन सामग्री, ई-बुक्स और डिजिटल संसाधनों तक मुफ्त पहुंच प्रदान करती है।",
          url: "#",
          urlToImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
          publishedAt: new Date(Date.now() - 345600000).toISOString(),
          source: { name: "डिजिटल इंडिया" }
        },
        {
          title: "नीमच जिले के छात्रों ने शैक्षणिक उत्कृष्टता प्राप्त की",
          description: "नीमच जिले के छात्र अपने शैक्षणिक प्रदर्शन में उल्लेखनीय सुधार दिखा रहे हैं। Study Point Library का वातावरण उनकी सफलता में महत्वपूर्ण योगदान दे रहा है।",
          url: "#",
          urlToImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400",
          publishedAt: new Date(Date.now() - 432000000).toISOString(),
          source: { name: "शैक्षणिक सफलता" }
        },
        {
          title: "Board Exam Preparation के लिए लाइब्रेरी के घंटे बढ़ाए गए",
          description: "CBSE और MP Board परीक्षाओं की तैयारी कर रहे छात्रों का समर्थन करने के लिए Study Point Library ने अपने कार्य घंटे बढ़ा दिए हैं।",
          url: "#",
          urlToImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
          publishedAt: new Date(Date.now() - 518400000).toISOString(),
          source: { name: "बोर्ड परीक्षाएं" }
        },
        {
          title: "Free WiFi and Digital Learning Tools Available",
          description: "Study Point Library provides free high-speed WiFi and access to digital learning platforms. Students can use BYJU'S, Unacademy, and other online learning resources.",
          url: "#",
          urlToImage: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400",
          publishedAt: new Date(Date.now() - 604800000).toISOString(),
          source: { name: "Technology News" }
        },
        {
          title: "Group Study Sessions के लिए नए Study Rooms जोड़े गए",
          description: "हमने Group Study Sessions के लिए नए आरामदायक अध्ययन स्थान जोड़े हैं। प्रतियोगी परीक्षाओं की तैयारी के लिए एक साथ अध्ययन करने वाले छात्रों के लिए बिल्कुल सही।",
          url: "#",
          urlToImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
          publishedAt: new Date(Date.now() - 691200000).toISOString(),
          source: { name: "सुविधा अपडेट" }
        },
        {
          title: "Library Partners with Local Schools for Better Education",
          description: "Study Point Library has partnered with schools in Jiran and Neemuch to provide additional study support. This collaboration helps bridge the gap between school and home study.",
          url: "#",
          urlToImage: "https://images.unsplash.com/photo-1523240794102-9c5f2a0c0c8b?w=400",
          publishedAt: new Date(Date.now() - 777600000).toISOString(),
          source: { name: "Education Partnership" }
        },
        {
          title: "ग्रामीण क्षेत्रों के छात्र लाइब्रेरी के समर्थन से उत्कृष्ट प्रदर्शन कर रहे हैं",
          description: "जिरान के आसपास के ग्रामीण क्षेत्रों के छात्र Study Point Library के समर्थन से शैक्षणिक उत्कृष्टता प्राप्त कर रहे हैं। हमारी सुविधा सभी छात्रों के लिए समान अवसर प्रदान करती है।",
          url: "#",
          urlToImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400",
          publishedAt: new Date(Date.now() - 864000000).toISOString(),
          source: { name: "ग्रामीण शिक्षा" }
        },
        {
          title: "Career Counseling Services की शुरुआत",
          description: "Study Point Library अब छात्रों को सही करियर पथ चुनने में मदद करने के लिए करियर काउंसलिंग सेवाएं प्रदान करती है। विभिन्न प्रतियोगी परीक्षाओं और करियर विकल्पों के लिए विशेषज्ञ मार्गदर्शन उपलब्ध है।",
          url: "#",
          urlToImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400",
          publishedAt: new Date(Date.now() - 950400000).toISOString(),
          source: { name: "करियर मार्गदर्शन" }
        }
      ]

      // Filter sample news based on category if needed
      if (cat !== 'general') {
        const categoryKeywords = {
          'technology': ['digital', 'wifi', 'technology', 'online', 'digital india'],
          'education': ['study', 'learning', 'students', 'education', 'academic', 'upsc', 'jee', 'neet', 'board'],
          'business': ['community', 'facility', 'service', 'partnership', 'career'],
          'science': ['research', 'studies', 'academic', 'ncert', 'reference'],
          'health': ['environment', 'atmosphere', 'comfortable', 'wellness'],
          'sports': ['sports', 'fitness', 'physical', 'activity'],
          'entertainment': ['entertainment', 'media', 'culture', 'arts']
        }
        
        const keywords = categoryKeywords[cat] || []
        const filteredNews = sampleNews.filter(article => 
          keywords.some(keyword => 
            article.title.toLowerCase().includes(keyword) || 
            (article.description && article.description.toLowerCase().includes(keyword))
          )
        )
        
        setArticles(filteredNews.length > 0 ? filteredNews : sampleNews)
      } else {
        setArticles(sampleNews)
      }
    } finally {
      setLoading(false)
    }
  }, [buildApiUrl, category])

  // Function to fetch more data for infinite scroll
  const fetchMoreData = useCallback(async () => {
    if (loading) return // Prevent multiple simultaneous requests
    
    const nextPageNum = page + 1
    setPage(nextPageNum)
    await fetchNews(searchTerm, category, nextPageNum, true)
  }, [page, searchTerm, category, fetchNews, loading])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && !loading && articles.length < totalResults) {
          console.log('Loading more news...')
          fetchMoreData()
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before reaching the bottom
        threshold: 0.1
      }
    )

    const sentinel = document.getElementById('scroll-sentinel')
    if (sentinel) {
      observer.observe(sentinel)
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel)
      }
    }
  }, [loading, articles.length, totalResults, fetchMoreData])

  // Initial load
  useEffect(() => {
    console.log('useEffect triggered with:', { searchTerm, category })
    document.title = `${capitalizeFirstLetter(category)} - Study Point Library News`
    setPage(1)
    fetchNews(searchTerm, category, 1, false)
  }, [searchTerm, category, fetchNews])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchNews(searchTerm, category, 1)
  }

  const handleCategoryChange = (newCategory) => {
    console.log('Category changed to:', newCategory)
    setCategory(newCategory)
    setSearchTerm('')
    setPage(1)
    // Call fetchNews with the new category
    fetchNews('', newCategory, 1, false)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
  }

  const truncateText = (text, maxLength = 120) => {
    if (!text || text.length <= maxLength) return text
    return text.substr(0, maxLength) + '...'
  }

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

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
              Study Point Library - Latest {capitalizeFirstLetter(category)} News
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Stay informed with the latest global news, educational insights, and updates from around the world. 
              Knowledge is power, and we're here to keep you connected.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={`Search ${capitalizeFirstLetter(category)} news...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-gray-600 font-medium flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Categories:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    category === cat.id
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* News Grid */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <>
            {/* Error Message (if any) */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8"
              >
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Live News Temporarily Unavailable
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>{error}</p>
                        <p className="mt-1 font-medium">
                          Showing curated library news and updates below.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* News Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {articles.map((article, index) => (
                <motion.article
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
                >
                  {/* Article Image */}
                  <div className="relative h-48 overflow-hidden">
                    <BrandedImage
                      src={article.urlToImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      fallbackText="Study Point Library Jiran"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="inline-block bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                        {article.source.name || 'News'}
                      </span>
                    </div>
                  </div>

                  {/* Article Content */}
                  <div className="p-6">
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDate(article.publishedAt)}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors duration-200">
                      {article.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {truncateText(article.description || 'No description available.')}
                    </p>
                    
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                    >
                      Read More
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                </motion.article>
              ))}
            </motion.div>

            {/* Infinite Scroll Sentinel */}
            {articles.length < totalResults && (
              <div id="scroll-sentinel" className="h-10 flex items-center justify-center">
                {loading && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    <span>Loading more news...</span>
                  </div>
                )}
              </div>
            )}

            {/* End of Results */}
            {articles.length >= totalResults && articles.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 text-center"
              >
                <div className="text-gray-500 text-sm">
                  <p>You've reached the end of available news.</p>
                  <p className="mt-1">Showing {articles.length} articles</p>
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-8"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Stay Connected with Study Point Library
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We believe in the power of knowledge and staying informed. Our news section keeps you updated 
              with the latest educational trends, technological advancements, and community news. 
              Remember, we're here to support your learning journey since July 10th, 2023.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Updated Daily
              </span>
              <span className="flex items-center">
                <Globe className="w-4 h-4 mr-1" />
                Global Coverage
              </span>
              <span className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                Educational Focus
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default News 