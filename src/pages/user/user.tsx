import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getHistory, getWatchlist, removeFromWatchlist, setProfilePicture, getProfilePicture } from '../../components/parsem3u';

interface InterfaceMedia {
  category: string;
  uri: string;
  id: number;
  logo: string;
  group: string;
  timestamp?: number;
}

function UserPage() {
  const [myList, setMyList] = useState<InterfaceMedia[]>([]);
  const [history, setHistory] = useState<InterfaceMedia[]>([]);
  const [currentRowMyList, setCurrentRowMyList] = useState(0);
  const [currentRowHistory, setCurrentRowHistory] = useState(0);
  const [selectedAvatar, setSelectedAvatar] = useState('/profilepictures/1.jpg');
  const [movieresearch, setMovieResearch] = useState('')
  const navigate = useNavigate();

  const avatars = [
    '/profilepictures/1.jpg',
    '/profilepictures/2.jpg',
    '/profilepictures/3.jpg',
    '/profilepictures/4.jpg',
    '/profilepictures/5.jpg'
  ];

  useEffect(() => {
    const fetchData = async () => {
      const watchlist = await getWatchlist();
      const historyList = await getHistory();
      const avatar = await getProfilePicture();
      setSelectedAvatar(avatar);
      setMyList(watchlist);
      setHistory(historyList);
    };
    fetchData();
  }, []);

  const handleScroll = (direction: 'left' | 'right', type: 'myList' | 'history') => {
    if (type === 'myList') {
      setCurrentRowMyList(prev => direction === 'left' ? prev - 1 : prev + 1);
    } else {
      setCurrentRowHistory(prev => direction === 'left' ? prev - 1 : prev + 1);
    }
  };

  const handleRemoveFromList = async (id: number) => {
    const removed = await removeFromWatchlist(id);
    if (removed) {
      setMyList(myList.filter(item => item.id !== id));
    }
  };

  const handleInfo = (id: number, uri: string, category: string, logo: string) => {
    navigate('/details', { state: { id, uri, category, logo } });
  };

  const handleBack = () => {
    navigate('/homepage');
  };

  const handleAvatarChange = async (avatar: string) => {
    const success = await setProfilePicture(avatar);
    if (success) {
      setSelectedAvatar(avatar);
    }
  };

  const handleSearch = () => {
    if (movieresearch !== '') {
      navigate('/search', { state: { searchQuery: movieresearch } })
    }
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <nav className="flex items-center justify-between p-4 bg-black bg-opacity-90 fixed top-0 w-full z-50">
        <div className="flex flex-row items-center">
          <div className="hover:text-gray-300 cursor-pointer text-center pt-2" onClick={() => navigate('/user')}>
            <img src={selectedAvatar} alt="Profile" className="w-12 h-11 rounded-full mr-3" />
          </div>
          <div className="text-red-600 text-4xl font-bold cursor-pointer" onClick={handleBack}>
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

      <div className="pt-24 px-8">
        <div className="flex items-center space-x-8 mb-12">
          <img 
            src={selectedAvatar} 
            alt="Profile" 
            className="w-32 h-32 rounded-full border-4 border-red-600"
          />
          <div className="flex space-x-4">
            {avatars.map((avatar, index) => (
              <img
                key={index}
                src={avatar}
                alt={`Avatar ${index + 1}`}
                className={`w-16 h-16 rounded-full cursor-pointer transition-all 
                  ${selectedAvatar === avatar ? 'border-4 border-red-600' : 'opacity-50 hover:opacity-100'}`}
                onClick={() => handleAvatarChange(avatar)}
              />
            ))}
          </div>
        </div>

        {/* Ma Liste */}
        <div className="mt-8 px-4 pb-5">
          <h2 className="text-2xl font-semibold mb-4 text-left ml-2">Ma Liste</h2>
          <div className="relative">
            {myList.length > 0 ? (
              <>
                <button
                  onClick={() => handleScroll('left', 'myList')}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full z-10"
                >
                  <ChevronLeft />
                </button>
                <div className="flex space-x-4 overflow-hidden">
                  {myList.slice(currentRowMyList, currentRowMyList + 13).map((item, index) => (
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
              </>
            ) : (
              <div className="w-[200px] h-[300px] bg-gray-700 rounded-md"></div>
            )}
          </div>
        </div>

        {/* Historique */}
        <div className="mt-8 px-4 pb-5">
          <h2 className="text-2xl font-semibold mb-4 text-left ml-2">Historique</h2>
          <div className="relative">
            {history.length > 0 ? (
              <>
                <button
                  onClick={() => handleScroll('left', 'history')}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full z-10"
                >
                  <ChevronLeft />
                </button>
                <div className="flex space-x-4 overflow-hidden">
                  {history.slice(currentRowHistory, currentRowHistory + 13).map((item, index) => (
                    <div key={index} className="flex-none w-[200px] cursor-pointer">
                      <div className="h-[full] rounded-md relative group">
                        <img 
                          src={item.logo || '/placeholder.svg?height=169&width=300'} 
                          alt={item.category.split('|')[1]} 
                          className="h-full w-full object-cover rounded transition-transform duration-300 group-hover:scale-105" 
                          onClick={() => handleInfo(item.id, item.uri, item.category, item.logo)}
                        />
                      </div>
                      <p className="text-sm text-white mt-2 truncate">
                        {item.category.split('|')[1]}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(item.timestamp || 0).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleScroll('right', 'history')}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full z-10"
                >
                  <ChevronRight />
                </button>
              </>
            ) : (
              <div className="w-[200px] h-[300px] bg-gray-700 rounded-md"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserPage;
