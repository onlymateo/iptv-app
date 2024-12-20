import React, { useEffect, useState } from 'react'
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import  Homepage  from './pages/homepage/homepage';
import MovieDetail  from './pages/details/details';
import LoginPage from './pages/login/login';
import SearchPage from './pages/searching/search';
import UserPage from './pages/user/user';
import { getContentFromIndexedDB, IsDatabaseEmpty } from './components/parsem3u';

interface InterfaceMedia {
  category: string;
  uri: string;
  id: number;
  logo: string;
  group: string;
}

function App() {
  const [isDatabaseEmpty, setIsDatabaseEmpty] = useState(true)
  const [movies, setMovies] = useState<InterfaceMedia[]>([])
  const [series, setSeries] = useState<InterfaceMedia[]>([])
  const [tvChannels, setTvChannels] = useState<InterfaceMedia[]>([])

  useEffect(() => {
    const checkDatabase = async () => {
      const isEmpty = await IsDatabaseEmpty()
      if (!isEmpty) {
        setIsDatabaseEmpty(false)
        const content = await getContentFromIndexedDB()
        setMovies(content.movies)
        setSeries(content.series)
        setTvChannels(content.tvChannels)
      } else {
        setIsDatabaseEmpty(true)
      }
    }
    checkDatabase()
  }, [])

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={isDatabaseEmpty ? <LoginPage /> : <Navigate to="/homepage" />} />
          <Route path="/homepage" element={!isDatabaseEmpty ? <Homepage movies={movies} series={series} tvChannels={tvChannels}/> : <Navigate to="/login" />} />
          <Route path="/details" element={!isDatabaseEmpty ? <MovieDetail /> : <Navigate to="/login" />} />
          <Route path="/user" element={!isDatabaseEmpty ? <UserPage /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to={isDatabaseEmpty ? "/login" : "/homepage"} />} />
          <Route path="/search" element={!isDatabaseEmpty ? <SearchPage movies={movies} series={series} tvChannels={tvChannels}/> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
