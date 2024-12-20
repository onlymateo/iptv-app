import { useCallback, useEffect, useMemo, useState } from 'react'
///import Link from 'next/link'
import { Search, Filter, ChevronDown } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getProfilePicture } from '../../components/parsem3u';

interface Media {
  id: number;
  category: string;
  uri: string;
  logo: string;
  group: string;
}


export default function SearchPage({ movies, series, tvChannels }: { movies: any[], series: any[], tvChannels: any[] }) {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState(location.state?.searchQuery || '')
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [searchResults, setSearchResults] = useState<Media[]>([])
  const navigate = useNavigate()
  const [selectedAvatar, setSelectedAvatar] = useState('/profilepictures/1.jpg')

  const genres = ['All', 'TV Channels', 'Movies', 'Series']

  const handleBack = () => {
    navigate('/homepage')
  }

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 24 // 6 colonnes x 4 lignes

  const handleSearch = (genre: string) => {
    const filteredResults = (() => {
      const query = searchQuery.toLowerCase()
      let results: Media[] = []

      if (genre === 'Movies') {
        results = results.concat(movies)
      } else if (genre === 'Series') {
        results = results.concat(series)
      } else if (genre === 'TV Channels') {
        results = results.concat(tvChannels)
      } else {
        results = results.concat(movies)
        results.concat(series)
        results.concat(tvChannels)
      }
      setCurrentPage(1)

      // Filtrer d'abord les résultats
      const filteredItems = results.filter(item => {
        const matchesSearch = item.category.toLowerCase().includes(query)
        return matchesSearch
      })

      // Trier les résultats pour mettre "FR|" en premier
      const sortedResults = filteredItems.sort((a, b) => {
        const aHasFR = a.category.includes('FR')
        const bHasFR = b.category.includes('FR')
        
        if (aHasFR && !bHasFR) return -1
        if (!aHasFR && bHasFR) return 1
        return 0
      })

      return sortedResults.slice(0, 100)
    })()

    setSearchResults(filteredResults)
  }
    
  const fetchAvatar = async () => {
    const avatar = await getProfilePicture();
    setSelectedAvatar(avatar);
  };

  useEffect(() => {
    fetchAvatar();
    handleSearch(selectedGenre)
  }, [])

  // Calcul de la pagination
  const totalPages = Math.ceil(searchResults.length / itemsPerPage)
  const paginatedResults = searchResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Fonction pour changer de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleInfo = (media: Media) => {
    navigate('/details', { 
      state: { 
        id: media.id,
        uri: media.uri,
        category: media.category,
        logo: media.logo 
      } 
    })
  }

  const handleCatechange = (value: string) => {
    setSelectedGenre(value)
    handleSearch(value)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between p-4 bg-black bg-opacity-90 fixed top-0 w-full z-50">
        <div className="flex flex-row items-center">
          <div className="hover:text-gray-300 cursor-pointer text-center pt-2" onClick={() => navigate('/user')}>
            <img src={selectedAvatar} alt="Profile" className="w-12 h-11 rounded-full mr-3" />
          </div>
          <div className="text-red-600 text-4xl font-bold cursor-pointer" onClick={() => navigate('/user')}>
            NETFLOUZ
          </div>
        </div>
        <div className="flex space-x-4 align-center justify-center">
            {/* <div className="hover:text-gray-300 cursor-pointer text-center pt-2" onClick={() => setCategory("TV")}>TV Shows</div>
            <div className="hover:text-gray-300 cursor-pointer text-center pt-2" onClick={() => setCategory("Movies")}>Movies</div>
            <div className="hover:text-gray-300 cursor-pointer text-center pt-2" onClick={() => setCategory("Series")}>Series</div> */}
        </div>
      </nav>

      {/* Search Section */}
      <div className="pt-24 px-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search for movies, TV shows, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(selectedGenre)
                }
              }}

            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <div className="relative">
            <select
              value={selectedGenre}
              onChange={(e) => handleCatechange(e.target.value)}
              className="appearance-none bg-gray-800 text-white px-4 py-2 pr-8 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              {genres.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Search Results */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {paginatedResults.map((result: any) => (
            <div key={result.uri} className="relative group flex flex-col" onClick={() => handleInfo(result)}>
              <div className="relative">
                <img 
                  src={result.logo} 
                  alt={result.category} 
                  className="w-full h-auto rounded-md transition-transform duration-300 group-hover:scale-105" 
                />
                {/*<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                </div>*/}
              </div>
              <p className="text-white text-center font-bold mt-2">{result.category}</p>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {searchResults.length > 0 && (
          <div className="flex justify-center items-center space-x-2 mt-8 pb-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-md bg-gray-800 text-white disabled:opacity-50"
            >
              Précédent
            </button>
            
            <div className="flex space-x-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === index + 1 ? 'bg-red-600' : 'bg-gray-800'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-md bg-gray-800 text-white disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        )}

        {searchResults.length === 0 && (
          <p className="text-center text-gray-400 mt-8">No results found. Try adjusting your search or filters.</p>
        )}
      </div>
    </div>
  )
}