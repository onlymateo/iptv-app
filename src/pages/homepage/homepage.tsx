import { useEffect, useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, Play, Info, Plus, X } from 'lucide-react'
import "./homepage.css"
import { useNavigate } from 'react-router-dom'
import { getContentFromIndexedDB, get2024ContentFromIndexedDB, getWatchlist, removeFromWatchlist, isInWatchlist, addToWatchlist, getProfilePicture, getRecommendations, fetchRecentMovies } from '../../components/parsem3u'

interface InterfaceMedia {
  category: string;
  uri: string;
  id: number;
  logo: string;
  group: string;
  title?: string;
}

function levenshteinDistance(str1: string, str2: string): number {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) track[0][i] = i;
  for (let j = 0; j <= str2.length; j++) track[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }

  return 100 - (track[str2.length][str1.length] * 100 / Math.max(str1.length, str2.length));
}

function Homepage({ movies, series, tvChannels }: { movies: InterfaceMedia[], series: InterfaceMedia[], tvChannels: InterfaceMedia[] }) {
  const [currentRowMovies, setCurrentRowMovies] = useState(0)
  const [currentRowSeries, setCurrentRowSeries] = useState(0)
  const [currentRowTvChannels, setCurrentRowTvChannels] = useState(0)
  const [movieresearch, setMovieResearch] = useState('')
  const [category, setCategory] = useState('')
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [myList, setMyList] = useState<InterfaceMedia[]>([])
  const [selectedAvatar, setSelectedAvatar] = useState('/profilepictures/1.jpg')
  const [currentRowRecommendations, setCurrentRowRecommendations] = useState(0)
  const [recentTMDBMovies, setRecentTMDBMovies] = useState<any[]>([])
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (movies.length > 0 && series.length > 0 && tvChannels.length > 0) {
        setLoading(false)
        clearInterval(interval)
      }
    }, 100) // 100ms = 0.1 seconde

    return () => clearInterval(interval) // Nettoyage lors du démontage
  }, [movies, series, tvChannels])

  useEffect(() => {
    const fetchMyList = async () => {
      const list = await getWatchlist();
      setMyList(list);
    };
    fetchMyList();
    const fetchAvatar = async () => {
      const avatar = await getProfilePicture();
      setSelectedAvatar(avatar);
    };
    fetchAvatar();
  }, []);


  useEffect(() => {
    const loadRecentMovies = async () => {
      const recentMovies = await fetchRecentMovies();
      const matchingMovies = recentMovies.filter((tmdbMovie: any) => {
        const movieTitle = tmdbMovie.title
          .split('(')[0]
          .split(' - ')[0]
          .replace(/AF\|/g, '')
          .replace(/S[0-9]+E[0-9]+/g, '')
          .replace(/S[0-9]+/g, '')
          .trim();
        return movies.some((localMovie: any) => {
          if (localMovie.category.toLowerCase().includes(movieTitle.toLowerCase())) {
            tmdbMovie.category = localMovie.category;
            tmdbMovie.uri = localMovie.uri;
            tmdbMovie.id = localMovie.id;
            tmdbMovie.logo = localMovie.logo;
            return true;
          }
          return false;
        });
      });
      setRecentTMDBMovies(matchingMovies);
    };
    loadRecentMovies();
  }, [movies]);

  const handleScroll = (direction: 'left' | 'right', category: 'movies' | 'series' | 'tvChannels' | 'myList' | 'recommendations') => {
    if (direction === 'left') {
      if (category === 'movies') {
        if (currentRowMovies > 0) {
          setCurrentRowMovies(currentRowMovies - 1)
        }
      } else if (category === 'series') {
        if (currentRowSeries > 0) {
          setCurrentRowSeries(currentRowSeries - 1)
          }
      } else if (category === 'tvChannels') {
        if (currentRowTvChannels > 0) {
          setCurrentRowTvChannels(currentRowTvChannels - 1)
        }
      } else if (category === 'recommendations') {
        if (currentRowRecommendations > 0) {
          setCurrentRowRecommendations(currentRowRecommendations - 1)
        }
      }
    } else if (direction === 'right') {
      if (category === 'movies') {
        if (currentRowMovies < recentTMDBMovies.length -1) {
          setCurrentRowMovies(currentRowMovies + 1)
        }
      } else if (category === 'series') {
        if (currentRowSeries < series.length - 1) {
          setCurrentRowSeries(currentRowSeries + 1)
        }
      } else if (category === 'tvChannels') {
        if (currentRowTvChannels < tvChannels.length - 1) {
          setCurrentRowTvChannels(currentRowTvChannels + 1)
        }
      } else if (category === 'recommendations') {
        if (currentRowRecommendations < recentTMDBMovies.length - 1) {
          setCurrentRowRecommendations(currentRowRecommendations + 1)
        }
      } 
    } 
  }

  const handleInfo = (id: number, uri: string, category: string, logo: string) => {
    navigate('/details', { state: { id: id, uri: uri, category: category, logo: logo } })
  }

  const handleSearch = () => {
    if (movieresearch !== '') {
      navigate('/search', { state: { searchQuery: movieresearch } })
    }
  }

  const handleAddToList = async (media: InterfaceMedia) => {
    // Déterminer le type en fonction de l'URI
    let type: 'movie' | 'series' | 'tvChannel';
    if (media.uri.includes('movie')) {
      type = 'movie';
    } else if (media.uri.includes('series')) {
      type = 'series';
    } else {
      type = 'tvChannel';
    }

    const watchlistItem = {
      id: media.id,
      title: media.category,
      logo: media.logo,
      uri: media.uri,
      category: media.category,
      type: type
    };

    await addToWatchlist(watchlistItem);
    setMyList([...myList, media]);
  };

  const handleRemoveFromList = async (id: number) => {
    const removed = await removeFromWatchlist(id);
    if (removed) {
      setMyList(myList.filter(item => item.id !== id));
    }
  };

  return (
    <div className="bg-black text-white min-h-screen overflow-y-auto">  
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between p-4 bg-black bg-opacity-90 fixed top-0 w-full z-50">
        <div className="flex flex-row items-center">
          <div className="hover:text-gray-300 cursor-pointer text-center pt-2" onClick={() => navigate('/user')}>
            <img src={selectedAvatar} alt="Profile" className="w-12 h-11 rounded-full mr-3" />
          </div>
          <div className="text-red-600 text-4xl font-bold cursor-pointer" onClick={() => {}}>
            NETFLOUZ
          </div>
        </div>
        <div className="flex space-x-4 align-center justify-center">
          {/*<div className="hover:text-gray-300 cursor-pointer text-center pt-2" onClick={() => setCategory("TV")}>TV Shows</div>
          <div className="hover:text-gray-300 cursor-pointer text-center pt-2" onClick={() => setCategory("Movies")}>Movies</div>
          <div className="hover:text-gray-300 cursor-pointer text-center pt-2" onClick={() => setCategory("Series")}>Series</div>*/}
          <input
            type="text"
            placeholder="Search" 
            className="bg-black text-white p-2 rounded border"
            value={movieresearch}
            onChange={(e) => setMovieResearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
          />
        </div>
      </nav>

      {/* Main Banner avec le premier film */}
      <div className="relative pt-16">
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent"></div>
        <img 
          src={movies[0]?.logo || "/placeholder.svg?height=600&width=1600"} 
          alt="Featured Movie" 
          className="w-full h-[500px] object-cover"
        />
        <div className="absolute bottom-0 left-0 p-8">
          <h1 className="text-5xl font-bold mb-4">
            {movies[0]?.category.split('|')[1] || "Featured Movie"}
          </h1>
          <div className="flex space-x-4">
            <button className="bg-white text-black hover:bg-gray-200 rounded flex flex-row p-4 pb-2 pt-2">
              <Play className="mr-2" />
              Play
            </button>
            <button className="bg-white text-black hover:bg-gray-200 rounded flex flex-row p-4 pb-2 pt-2" onClick={() => handleInfo(movies[0].id, movies[0].uri, movies[0].category, movies[0].logo)}>
              <Info className="mr-2" />
              More Info
            </button>
          </div>
        </div>
      </div>

      {myList.length > 0 && (
        <div className="mt-8 px-4 pb-5">
          <h2 className="text-2xl font-semibold mb-4 text-left ml-2">Ma Liste</h2>
          <div className="relative">
            <button
              onClick={() => handleScroll('left', 'myList')}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full z-10"
            >
              <ChevronLeft />
            </button>
            <div className="flex space-x-4 overflow-hidden">
              {myList.map((item, index) => (
                <div key={index} className="flex-none w-[200px] cursor-pointer">
                  <div className="h-[full] rounded-md relative group">
                    <img 
                      src={item.logo || '/placeholder.svg?height=169&width=300'} 
                      alt={item.category.split('|')[1]} 
                      className="h-full w-full object-cover rounded transition-transform duration-300 group-hover:scale-105" 
                      onClick={() => handleInfo(item.id, item.uri, item.category, item.logo)}
                    />
                    <button
                      onClick={() => handleRemoveFromList(item.id)}
                      className="absolute top-2 right-2 bg-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <p className="text-sm text-white mt-2 truncate">
                    {item.category.split('|')[1]}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={() => handleScroll('right', 'myList')}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full z-10"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* Section Films Récents */}
      <div className="mt-8 px-4 pb-5">
        <h2 className="text-2xl font-semibold mb-4 text-left ml-2">Films Récents</h2>
        <div className="relative">
          <button
            onClick={() => handleScroll('left', 'movies')}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full z-10"
          >
            <ChevronLeft />
          </button>
          <div className="flex space-x-4 overflow-hidden">
            {recentTMDBMovies.slice(currentRowMovies, currentRowMovies + 13).map((movie, index) => (
              <div key={index} className="flex-none w-[200px] cursor-pointer">
                <div className=" rounded-md relative group">
                  <img 
                    src={movie.logo || '/placeholder.svg?height=169&width=300'} 
                    alt={movie.category.split('|')[1]} 
                    className="h-full w-full object-cover rounded transition-transform duration-300 group-hover:scale-105" 
                    onClick={() => handleInfo(movie.id, movie.uri, movie.category, movie.logo)}
                  />
                  <button
                    onClick={() => handleAddToList(movie)}
                    className="absolute top-2 right-2 bg-white bg-opacity-70 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus size={16} className="text-black" />
                  </button>
                </div>
                <p className="text-sm text-white mt-2 truncate">
                  {movie.title}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={() => handleScroll('right', 'movies')}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full z-10"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* Section Séries */}
      <div className="mt-8 px-4 pb-5">
        <h2 className="text-2xl font-semibold mb-4 text-left ml-2">Séries</h2>
        <div className="relative">
          <button
            onClick={() => handleScroll('left', 'series')}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full z-10"
          >
            <ChevronLeft />
          </button>
          <div className="flex space-x-4 overflow-hidden">
            {series.slice(currentRowSeries, currentRowSeries + 13).map((movie, index) => (
             <div key={index} className="flex-none w-[200px] cursor-pointer">
             <div className="h-[169px] rounded-md relative group">
               <img 
                 src={movie.logo || '/placeholder.svg?height=169&width=300'} 
                 alt={movie.category.split('|')[1]} 
                 className="h-full w-full object-cover rounded transition-transform duration-300 group-hover:scale-105" 
                 onClick={() => handleInfo(movie.id, movie.uri, movie.category, movie.logo)}
               />
               <button
                 onClick={() => handleAddToList(movie)}
                 className="absolute top-2 right-2 bg-white bg-opacity-70 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
               >
                 <Plus size={16} className="text-black" />
               </button>
             </div>
             <p className="text-sm text-white mt-2 truncate">
               {movie.category.split('|')[1]}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={() => handleScroll('right', 'series')}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full z-10"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* Section TV */}
      <div className="mt-8 px-4 pb-5">
        <h2 className="text-2xl font-semibold mb-4 text-left ml-2">Chaînes TV</h2>
        <div className="relative">
          <button
            onClick={() => handleScroll('left', 'tvChannels'  )}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full z-10"
          >
            <ChevronLeft />
          </button>
          <div className="flex space-x-4 overflow-hidden">
            {tvChannels.slice(currentRowTvChannels, currentRowTvChannels + 13).map((movie, index) => (
              <div key={index} className="flex-none w-[200px] cursor-pointer">
              <div className="h-[169px] rounded-md relative group">
                <img 
                  src={movie.logo || '/placeholder.svg?height=169&width=300'} 
                  alt={movie.category.split('|')[1]} 
                  className="h-full w-full object-cover rounded transition-transform duration-300 group-hover:scale-105" 
                  onClick={() => handleInfo(movie.id, movie.uri, movie.category, movie.logo)}
                />
                <button
                  onClick={() => handleAddToList(movie)}
                  className="absolute top-2 right-2 bg-white bg-opacity-70 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Plus size={16} className="text-black" />
                </button>
              </div>
              <p className="text-sm text-white mt-2 truncate">
                {movie.category.split('|')[1]}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={() => handleScroll('right', 'tvChannels')}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full z-10"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* Indicateur de chargement */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
        </div>
      )}
    </div>
  )
}

export default Homepage