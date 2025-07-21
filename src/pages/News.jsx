import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Globe, 
  BookOpen, 
  Zap, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react'

const News = () => {
  // State for news data
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('general')

  // Pagination state
  const [page, setPage] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(9) // Show 9 articles per page
  const [totalPages, setTotalPages] = useState(0)

  // NewsAPI.org configuration
  const API_KEY = import.meta.env.VITE_NEWS_API_KEY || '5fbf066517144d3a9192051f1c38a431'
  const BASE_URL = "https://newsapi.org/v2"

  // Categories with icons
  const categories = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'technology', name: 'Technology', icon: Zap },
    { id: 'education', name: 'Education', icon: BookOpen }
  ]

  // Function to fetch news from NewsAPI.org
  const fetchNews = useCallback(async (search = '', cat = category, pageNum = 1, append = false) => {
    try {
      setLoading(true)
      setError('')

      const query = search || cat
      const url = `${BASE_URL}/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&page=${pageNum}&pageSize=${itemsPerPage}&apiKey=${API_KEY}`
      
      // Try multiple CORS proxies
      const corsProxies = [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
        'https://thingproxy.freeboard.io/fetch/'
      ]

      let response = null
      let data = null

      for (const proxy of corsProxies) {
        try {
          response = await fetch(proxy + encodeURIComponent(url))
          
          if (response.ok) {
            data = await response.json()
            break
          }
        } catch (proxyError) {
          continue
        }
      }

      if (!data) {
        throw new Error('All CORS proxies failed')
      }

      if (data.status === 'error') {
        if (data.code === 'apiKeyDisabled') {
          throw new Error('API key is disabled. Using demo content.')
        } else if (data.code === 'rateLimited') {
          throw new Error('Rate limit exceeded. Using demo content.')
        } else {
          throw new Error(data.message || 'API error occurred')
        }
      }

      if (data.articles && data.articles.length > 0) {
        const newArticles = data.articles.map(article => ({
          ...article,
          publishedAt: article.publishedAt || new Date().toISOString(),
          source: { name: article.source?.name || 'News' }
        }))

        if (append) {
          setArticles(prev => [...prev, ...newArticles])
        } else {
          setArticles(newArticles)
        }

        setTotalResults(data.totalResults || 0)
        setTotalPages(Math.ceil((data.totalResults || 0) / itemsPerPage))
        setCurrentPage(pageNum)
      } else {
        throw new Error(`No ${cat} news available at the moment.`)
      }
    } catch (err) {
      setError('Unable to fetch live news at the moment. Showing curated content.')
      
      // Enhanced sample news data with Hindi and English content
      const sampleNews = [
        {
          title: "Study Point Library Jiran Celebrates 1 Year Anniversary",
          description: "The first library in Jiran, established on July 10th, 2023, celebrates its first successful year of serving the community with quality study spaces and resources.",
          url: "#",
          urlToImage: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400",
          publishedAt: new Date().toISOString(),
          source: { name: "Local News" }
        },
        {
          title: "UPSC परीक्षा की तैयारी के लिए Study Point Library में सफलता",
          description: "जिरान और आसपास के क्षेत्रों के सिविल सेवा उम्मीदवार उत्कृष्ट परिणाम प्राप्त कर रहे हैं। हमारी लाइब्रेरी UPSC की तैयारी के लिए आदर्श वातावरण प्रदान करती है।",
          url: "#",
          urlToImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
          publishedAt: new Date().toISOString(),
          source: { name: "Government News" }
        },
        {
          title: "डिजिटल इंडिया: लाइब्रेरी में मुफ्त ऑनलाइन संसाधन",
          description: "Study Point Library डिजिटल इंडिया को अपनाते हुए ऑनलाइन अध्ययन सामग्री, ई-बुक्स और डिजिटल संसाधनों तक मुफ्त पहुंच प्रदान कर रही है।",
          url: "#",
          urlToImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
          publishedAt: new Date().toISOString(),
          source: { name: "Technology News" }
        },
        {
          title: "Group Study Sessions के लिए नए Study Rooms जोड़े गए",
          description: "हमने Group Study Sessions के लिए नए आरामदायक अध्ययन स्थान जोड़े हैं। प्रतियोगी परीक्षाओं की तैयारी के लिए एक साथ अध्ययन करने का बेहतरीन विकल्प।",
          url: "#",
          urlToImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400",
          publishedAt: new Date().toISOString(),
          source: { name: "Education News" }
        },
        {
          title: "Study Point Library: जिरान का पहला डिजिटल लाइब्रेरी",
          description: "जुलाई 10, 2023 को स्थापित Study Point Library जिरान का पहला आधुनिक डिजिटल लाइब्रेरी है। हम छात्रों को बेहतरीन अध्ययन वातावरण प्रदान करते हैं।",
          url: "#",
          urlToImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
          publishedAt: new Date().toISOString(),
          source: { name: "Local News" }
        },
        {
          title: "Free WiFi and Digital Resources at Study Point Library",
          description: "Study Point Library offers free high-speed WiFi and access to digital learning resources. Students can access online study materials, e-books, and educational videos.",
          url: "#",
          urlToImage: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400",
          publishedAt: new Date().toISOString(),
          source: { name: "Technology News" }
        }
      ]

      // Filter sample news based on category if needed
      let filteredNews = sampleNews
      if (cat !== 'general') {
        filteredNews = sampleNews.filter(article =>
          article.source.name.toLowerCase().includes(cat.toLowerCase())
        )
      }

      if (append) {
        setArticles(prev => [...prev, ...filteredNews])
      } else {
        setArticles(filteredNews.length > 0 ? filteredNews : sampleNews)
      }
      
      setTotalResults(filteredNews.length)
      setTotalPages(Math.ceil(filteredNews.length / itemsPerPage))
      setCurrentPage(1)
    } finally {
      setLoading(false)
    }
  }, [category, itemsPerPage])

  // Load more news function (for future use if needed)
  const loadMore = useCallback(() => {
    const nextPageNum = page + 1
    setPage(nextPageNum)
    fetchNews(searchTerm, category, nextPageNum, true)
  }, [page, searchTerm, category, fetchNews, loading])

  // Initialize news on component mount
  useEffect(() => {
    document.title = `${capitalizeFirstLetter(category)} - Study Point Library News`
    setPage(1)
    fetchNews(searchTerm, category, 1, false)
  }, [searchTerm, category, fetchNews])

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchNews(searchTerm, category, 1)
  }

  // Handle category change
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory)
    setSearchTerm('')
    setPage(1)
    fetchNews('', newCategory, 1, false)
  }

  // Utility function to capitalize first letter
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  // Format date function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Pagination functions
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      setPage(newPage)
      fetchNews(searchTerm, category, newPage, false)
    }
  }

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  // Calculate paginated articles
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedArticles = articles.slice(startIndex, endIndex)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Study Point Library - Latest {capitalizeFirstLetter(category)} News
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Stay informed with the latest global news, educational insights, and updates from around the world. 
              Knowledge is power, and we're here to keep you connected.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder={`Search ${capitalizeFirstLetter(category)} news...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
              </form>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      category === cat.id
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{cat.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* News Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Globe className="w-5 h-5 text-blue-600" />
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
            </motion.div>
          )}

          {/* News Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {paginatedArticles.map((article, index) => (
              <motion.article
                key={`${article.title}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Article Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.urlToImage || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                      {article.source.name || 'News'}
                    </span>
                  </div>
                </div>

                {/* Article Content */}
                <div className="p-6">
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(article.publishedAt)}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {article.description}
                  </p>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
                  >
                    Read More
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </motion.article>
            ))}
          </motion.div>

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 text-center"
            >
              <div className="inline-flex items-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mr-2"></div>
                <span>Loading more news...</span>
              </div>
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 flex justify-center"
            >
              <div className="flex items-center space-x-2 bg-white rounded-lg shadow-lg p-2">
                {/* First Page */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Previous Page */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Numbers */}
                {getVisiblePages().map((pageNum, index) => (
                  <div key={index}>
                    {pageNum === '...' ? (
                      <span className="px-3 py-2 text-gray-500">...</span>
                    ) : (
                      <button
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )}
                  </div>
                ))}

                {/* Next Page */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Last Page */}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* End of News Message */}
          {articles.length >= totalResults && totalResults > 0 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 text-center"
            >
              <div className="text-gray-500 text-sm">
                <p>You've reached the end of available news.</p>
                <p className="mt-1">
                  Showing {articles.length} articles
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* About Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="py-16 bg-white"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            About Our News Section
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            We believe in the power of knowledge and staying informed. Our news section keeps you updated 
            with the latest educational trends, technological advancements, and community news. 
            Remember, we're here to support your learning journey since July 10th, 2023.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 mt-8">
            <span className="flex items-center">
              <Globe className="w-4 h-4 mr-1" />
              Global News
            </span>
            <span className="flex items-center">
              <BookOpen className="w-4 h-4 mr-1" />
              Educational Updates
            </span>
            <span className="flex items-center">
              <Zap className="w-4 h-4 mr-1" />
              Technology Trends
            </span>
          </div>
        </div>
      </motion.section>
    </div>
  )
}

export default News 