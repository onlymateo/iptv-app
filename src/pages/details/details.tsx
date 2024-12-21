import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom';
import { openDB } from 'idb';
import React from 'react';
import { useState, useEffect } from 'react'
import { Play, Plus, ThumbsUp, X } from 'lucide-react'
import { VideoPlayer } from '../../components/VideoPlayer';
import { addToWatchlist, isInWatchlist, removeFromWatchlist, addToHistory, getProfilePicture, fetchTMDBData, fetchTMDBRecommendations } from '../../components/parsem3u.ts';

interface MovieDetailProps {
  id: number;
  uri: string;
  category: string;
  logo: string;
}

function MovieDetail() {
  const location = useLocation();
  const [isPlaying, setIsPlaying] = useState(false)
  const { id, uri, category, logo } = location.state as MovieDetailProps;
  console.log(id, uri, category, logo)
  
  const [movieresearch, setMovieResearch] = useState('')
  const navigate = useNavigate()
  const [isInList, setIsInList] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('/profilepictures/1.jpg')
  const movieTitle = category?.split('|')[1]?.trim() || '';
  const [movieDetails, setMovieDetails] = useState<{
    release_date: string;
    overview: string;
    vote_average: number;
    tmdb_id: number;
  } | null>(null);
  const [tmdbRecommendations, setTmdbRecommendations] = useState<any[]>([]);

  const fetchAvatar = async () => {
    const avatar = await getProfilePicture();
    setSelectedAvatar(avatar);
  };

  useEffect(() => {
    fetchAvatar();
  }, []);

  const handleBack = () => {
    navigate('/homepage')
  }
  const handleSearch = () => {
    if (movieresearch !== '') {
      navigate('/search')
    }
  }

  const handleSetToMylist = async () => {
    const type = uri.includes('movie') ? 'movie' as const : 
                 uri.includes('series') ? 'series' as const : 'tvChannel' as const;
               
    if (isInList) {
      try {
        const success = await removeFromWatchlist(id);
        if (success) {
          setIsInList(false);
          console.log('Retiré de la liste avec succès');
        } else {
          console.error('Erreur lors du retrait de la liste');
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    } else {
      const watchlistItem = {
        id,
        title: category,
        logo: logo,
        uri: uri,
        category: category,
        type: type
      };

      try {
        const success = await addToWatchlist(watchlistItem);
        if (success) {
          setIsInList(true);
          console.log('Ajouté à la liste avec succès');
        } else {
          console.error('Erreur lors de l\'ajout à la liste');
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  const handlePlay = async () => {
    setIsPlaying(true);
    const type = uri.includes('movie') ? 'movie' as const : 
                 uri.includes('series') ? 'series' as const : 'tvChannel' as const;

    try {
      // Supprimer l'élément de l'historique s'il existe déjà
      const db = await openDB('my-database', 1);
      await db.delete('history', id);

      // Ajouter le nouvel élément à l'historique
      const historyItem = {
        id,
        title: category,
        logo,
        uri,
        category,
        type,
        timestamp: Date.now()
      };

      await addToHistory(historyItem);
    } catch (error) {
      console.error('Erreur lors de la gestion de l\'historique:', error);
    }
  };

  useEffect(() => {
    const checkIfInList = async () => {
      const inList = await isInWatchlist(uri);
      setIsInList(inList);
    };
    checkIfInList();
  }, [uri]);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      const details = await fetchTMDBData(movieTitle);
      setMovieDetails(details);
    };
    
    fetchMovieDetails();
  }, [movieTitle]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (movieDetails?.tmdb_id) {
        const recs = await fetchTMDBRecommendations(movieDetails.tmdb_id);
        setTmdbRecommendations(recs);
      }
    };
    
    fetchRecommendations();
  }, [movieDetails?.tmdb_id]);

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Navigation Bar */}
      <nav className="flex flex-row items-center justify-between p-4 bg-black bg-opacity-90 fixed top-0 w-full z-50">
        <div className="flex flex-row items-center">
          <div className="hover:text-gray-300 cursor-pointer text-center pt-2" onClick={() => navigate('/user')}>
            <img src={selectedAvatar} alt="Profile" className="w-12 h-11 rounded-full mr-3" />
          </div>
          <div className="text-red-600 text-4xl font-bold cursor-pointer" onClick={handleBack}>
            NETFLOUZ
          </div>
        </div>

        <div className="flex space-x-4 align-center justify-center">
          <input
            type="text"
            placeholder="Search" 
            className="hidden md:block bg-black text-white p-2 rounded border"
            value={movieresearch}
            onChange={(e) => setMovieResearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
          />
          <button
            className="block md:hidden p-2"
            onClick={() => navigate('/search', { state: { searchQuery: movieresearch } })}
          >
            <img src="/loupe.png" alt="Search" className="w-6 h-6" />
          </button>
        </div>
      </nav>
      
      {isPlaying && (
        <VideoPlayer 
          uri={uri}
          title={category}
          onClose={() => setIsPlaying(false)}
        />
      )}

      {/* Movie Banner */}
      <div className="relative pt-16">
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent"></div>
        <img 
          src={logo} 
          alt={logo} 
          className="w-full h-[90vh] md:h-[500px] object-cover"
        />
        <div className="absolute bottom-0 left-0 p-8 w-full">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            {category}
          </h1>
          <div className="flex flex-row space-x-4">
            <button 
              className="bg-white text-black hover:bg-gray-200 rounded flex flex-row p-4 pb-2 pt-2"
              onClick={handlePlay}
            >
              <Play className="mr-2" />
              Play
            </button>
            <button className="bg-white text-black hover:bg-gray-200 rounded flex flex-row p-4 pb-2 pt-2" onClick={handleSetToMylist}>
              {isInList ? <X className="mr-2" /> : <Plus className="mr-2" />}
              List
            </button>
            <button className="bg-white text-black hover:bg-gray-200 rounded flex flex-row p-4 pb-2 pt-2">
              <ThumbsUp className="mr-2" />
              Rate
            </button>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-green-500 font-semibold">{movieDetails?.vote_average ? movieDetails.vote_average + " / 10" : "Non disponible"}</span>
            <span>{movieDetails?.release_date ? new Date(movieDetails.release_date).toLocaleDateString('fr-FR') : "Non disponible"}</span>
          </div>
        </div>
      </div>

      {/* Movie Details */}
      <div className="px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-2">
          <p className="text-lg mb-4">Description</p>
          <div>
            <p className="text-gray-300 mb-4">
              {movieDetails?.overview || "Description non disponible"}
            </p>
          </div>

          <div>
            <span className="text-gray-400">Date de sortie:</span>{" "}
            {movieDetails?.release_date ? new Date(movieDetails.release_date).toLocaleDateString('fr-FR') : "Non disponible"}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Recommandations</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {tmdbRecommendations.map((movie, index) => (
              <div key={index} className="relative group">
                <img
                  src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-auto object-cover rounded transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-sm text-white truncate">{movie.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieDetail