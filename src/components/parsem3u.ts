import { openDB, deleteDB } from 'idb'
import dotenv from 'dotenv';

dotenv.config();

const BEARER_TOKEN = process.env.TMDB_API_KEY;

interface InterfaceMedia {
  id: number;
  title: string;
  logo: string;
  uri: string;
  category: string;
  group: string;
}

export const downloadContentFromLink = async (url: string) => {
    try {
      const response = await fetch(url, {
        mode: 'cors',
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      })
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const content = await response.text();
      return content;
    } catch (error) {
      console.error('Error downloading content:', error);
      return null;
    }
};

export async function resetDatabase() {
  try {
    await deleteDB('my-database');
    console.log('Base de données supprimée avec succès');
  } catch (error) {
    console.error('Erreur lors de la suppression de la base de données:', error);
  }
}

export async function storeContentInIndexedDB(content: any) {
  try {
    await resetDatabase();

    const db = await openDB('my-database', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('movies')) {
          db.createObjectStore('movies', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('series')) {
          db.createObjectStore('series', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('tvChannels')) {
          db.createObjectStore('tvChannels', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('watchlist')) {
          db.createObjectStore('watchlist', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('history')) {
          db.createObjectStore('history', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('profile')) {
          const profileStore = db.createObjectStore('profile', { keyPath: 'id' });
          profileStore.put({ id: 'avatar', path: '/profilepictures/1.jpg' });
        }
      },
    });

    console.log(db)

    const tx = db.transaction(['movies', 'series', 'tvChannels'], 'readwrite');
    
    const moviesStore = tx.objectStore('movies');
    const seriesStore = tx.objectStore('series');
    const tvChannelsStore = tx.objectStore('tvChannels');
    console.log(content.movies[0])
    console.log(db)

    // Vérifier et nettoyer les données avant de les stocker
    for (const movie of content.movies) {
      const cleanMovie = {
        title: movie.title || '',
        logo: movie.logo || null,
        group: movie.group || 'Uncategorized',
        category: movie.category || '',
        uri: movie.uri || ''
      };
      await moviesStore.add(cleanMovie);
    }

    for (const serie of content.series) {
      const cleanSerie = {
        title: serie.title || '',
        logo: serie.logo || null,
        group: serie.group || 'Uncategorized',
        category: serie.category || '',
        uri: serie.uri || ''
      };
      await seriesStore.add(cleanSerie);
    }

    for (const channel of content.tvChannels) {
      const cleanChannel = {
        title: channel.title || '',
        logo: channel.logo || null,
        group: channel.group || 'Uncategorized',
        category: channel.category || '',
        uri: channel.uri || ''
      };
      await tvChannelsStore.add(cleanChannel);
    }

    await tx.done;
    console.log('Données stockées avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors du stockage des données:', error);
    throw error;
  }
}

export async function IsDatabaseEmpty() {
  try {
    const db = await openDB('my-database', 1);
    return db.objectStoreNames.length === 0;
  } catch (error) {
    console.error('Erreur lors de la vérification de la base de données:', error);
    return true;
  }
}

export async function getContentFromIndexedDB() {
  const db = await openDB('my-database', 1);
  
  try {
    const tx = db.transaction(['movies', 'series', 'tvChannels'], 'readonly');
    const movies = await tx.objectStore('movies').getAll();
    const series = await tx.objectStore('series').getAll();
    const tvChannels = await tx.objectStore('tvChannels').getAll();
    
    return { movies, series, tvChannels };
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    return { movies: [], series: [], tvChannels: [] };
  } finally {
    db.close();
  }
}

export async function getMoviesFromIndexedDB() {
  const db = await openDB('my-database', 1)
  const movies = await db.getAll('movies')
  return { movies }
}

export async function getSeriesFromIndexedDB() {
  const db = await openDB('my-database', 1)
  const series = await db.getAll('series')
  return { series }
}

export async function getTvChannelsFromIndexedDB() {
  const db = await openDB('my-database', 1)
  const tvChannels = await db.getAll('tvChannels')
  return { tvChannels }
}


export function parseM3UContent(content: string) {
  const lines = content.split('\n');
  const movies: any[] = [];
  const series: any[] = [];
  const tvChannels: any[] = [];

  let currentSegment: any = null;

  lines.forEach((line, index) => {
    if (line.startsWith('#EXTINF')) {
      // Extraction des informations avec regex
      const tvgName = line.match(/tvg-name="([^"]*)"/)
      const tvgLogo = line.match(/tvg-logo="([^"]*)"/)
      const groupTitle = line.match(/group-title="([^"]*)"/)

      if (tvgName) {
        currentSegment = {
          title: tvgName[1].trim(),
          logo: tvgLogo ? tvgLogo[1] : null,
          group: groupTitle ? groupTitle[1] : 'Uncategorized',
          category: tvgName[1].trim(), // Garder la catégorie pour la compatibilité
          uri: '' // Sera rempli dans la prochaine ligne
        };
      }
    } else if (line && !line.startsWith('#') && currentSegment) {
      currentSegment.uri = line.trim();
      
      // Créer une copie propre de l'objet
      const cleanSegment = {
        title: currentSegment.title,
        logo: currentSegment.logo,
        group: currentSegment.group,
        category: currentSegment.category,
        uri: currentSegment.uri
      };

      // Déterminer la catégorie en fonction de l'URL et du groupe
      if (currentSegment.uri.includes('movie')) {
        movies.push(cleanSegment);
      } else if (currentSegment.uri.includes('series')) {
        series.push(cleanSegment);
      } else {
        tvChannels.push(cleanSegment);
      }
      
      currentSegment = null;
    }
  });
  return { movies, series, tvChannels };
}


export async function get2024ContentFromIndexedDB() {
  const db = await openDB('my-database', 1);
  
  // Récupérer tous les éléments et filtrer
  const allMovies = await db.getAll('movies');
  const allSeries = await db.getAll('series');
  const allTvChannels = await db.getAll('tvChannels');

  // Filtrer les éléments contenant '2024' dans la catégorie
  const movies = allMovies.filter(movie => movie.category.includes('2024'));
  const series = allSeries.filter(series => series.category.includes('2024'));
  const tvChannels = allTvChannels.filter(channel => channel.category.includes('2024'));

  return { movies, series, tvChannels };
}





export async function createWatchlistStore() {
  const db = await openDB('my-database', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('watchlist')) {
        db.createObjectStore('watchlist', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
  return db;
}

export async function addToWatchlist(item: {
  title: string;
  logo: string;
  uri: string;
  category: string;
  type: 'movie' | 'series' | 'tvChannel';
}): Promise<boolean> {
  try {
    const db = await openDB('my-database', 1);
    await db.add('watchlist', item);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'ajout à la watchlist:', error);
    return false;
  }
}

export async function removeFromWatchlist(id: number): Promise<boolean> {
  try {
    const db = await openDB('my-database', 1);
    await db.delete('watchlist', id);
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de la watchlist:', error);
    return false;
  }
}

export async function getWatchlist(): Promise<InterfaceMedia[]> {
  try {
    const db = await openDB('my-database', 1);
    const watchlist = await db.getAll('watchlist');
    return watchlist;
  } catch (error) {
    console.error('Erreur lors de la récupération de la watchlist:', error);
    return [];
  }
}

export async function isInWatchlist(uri: string) {
  const db = await openDB('my-database', 1);
  const allItems = await db.getAll('watchlist');
  return allItems.some(item => item.uri === uri);
}

export async function addToHistory(item: {
  id: number;
  title: string;
  logo: string;
  uri: string;
  category: string;
  type: 'movie' | 'series' | 'tvChannel';
  timestamp: number;
}): Promise<boolean> {
  try {
    const db = await openDB('my-database', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('history')) {
          db.createObjectStore('history', { keyPath: 'id' });
        }
      },
    });
    await db.put('history', item);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'ajout à l\'historique:', error);
    return false;
  }
}

export async function getHistory(): Promise<InterfaceMedia[]> {
  try {
    const db = await openDB('my-database', 1);
    const history = await db.getAll('history');
    return history.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    return [];
  }
}

export async function isInHistory(id: number): Promise<boolean> {
  try {
    const db = await openDB('my-database', 1);
    const item = await db.get('history', id);
    return item !== undefined;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'historique:', error);
    return false;
  }
}

export async function setProfilePicture(avatarPath: string): Promise<boolean> {
  try {
    const db = await openDB('my-database', 1);
    await db.put('profile', { id: 'avatar', path: avatarPath });
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'avatar:', error);
    return false;
  }
}

export async function getProfilePicture(): Promise<string> {
  try {
    const db = await openDB('my-database', 1);
    const profile = await db.get('profile', 'avatar');
    return profile?.path || '/profilepictures/1.jpg';
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'avatar:', error);
    return '/profilepictures/1.jpg';
  }
}

export async function getRecommendations(currentMedia: InterfaceMedia, limit: number = 6): Promise<InterfaceMedia[]> {
  try {
    const db = await openDB('my-database', 1);
    let store: 'movies' | 'series' | 'tvChannels';
    
    // Déterminer le type de média
    if (currentMedia.uri.includes('movie')) {
      store = 'movies';
    } else if (currentMedia.uri.includes('series')) {
      store = 'series';
    } else {
      store = 'tvChannels';
    }

    // Récupérer tous les médias du même type
    const allMedia = await db.getAll(store);
    
    // Système de score pour les recommandations
    const scoredMedia = allMedia
      .filter(media => media.id !== currentMedia.id) // Exclure le média actuel
      .map(media => {
        let score = 0;
        
        // Score basé sur le groupe
        if (media.group === currentMedia.group) {
          score += 3;
        }
        
        // Score basé sur la catégorie
        const currentCategories = currentMedia.category.toLowerCase().split('|');
        const mediaCategories = media.category.toLowerCase().split('|');
        
        currentCategories.forEach(cat => {
          if (mediaCategories.some((mediaCat: string) => mediaCat.includes(cat))) {
            score += 2;
          }
        });
        
        // Score basé sur l'année (si présente)
        const currentYear = currentMedia.category.match(/\((\d{4})\)/)?.[1];
        const mediaYear = media.category.match(/\((\d{4})\)/)?.[1];
        
        if (currentYear && mediaYear && currentYear === mediaYear) {
          score += 2;
        }
        
        return { media, score };
      });

    // Trier par score et retourner les meilleures recommandations
    return scoredMedia
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.media);
      
  } catch (error) {
    console.error('Erreur lors de la récupération des recommandations:', error);
    return [];
  }
}

export async function fetchTMDBData(title: string) {
  try {
    // Nettoyer le titre en plusieurs étapes
    let cleanTitle = title
      .split('(')[0]                    // Retire le format "(2024)"
      .split(' - ')[0]                  // Retire le format " - 2024" ou " - S01E03"
      .replace(/AF\|/g, '')            // Retire "AF|"
      .replace(/S[0-9]+E[0-9]+/g, '')  // Retire "S01E03"
      .replace(/S[0-9]+/g, '')         // Retire "S01"
      .trim();
    
    // Enlever les doublons (comme dans "titre titre")
    const words = cleanTitle.split(' ');
    const uniqueWords = Array.from(new Set(words));
    cleanTitle = uniqueWords.join(' ');
    
    // Enlever tous les caractères spéciaux et espaces
    //const cleanTitle2 = cleanTitle.replace(/[^a-zA-Z0-9]/g, '');
    
    console.log("Titre original:", title);
    console.log("Titre nettoyé:", cleanTitle);
    console.log("Titre final:", cleanTitle);
    
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(cleanTitle)}&language=fr-FR`,
      {
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();
    console.log("Réponse API:", data);

    if (data.results && data.results.length > 0) {
      return {
        release_date: data.results[0].release_date,
        overview: data.results[0].overview,
        vote_average: data.results[0].vote_average,
        tmdb_id: data.results[0].id
      };
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération des données TMDB:', error);
    return null;
  }
}

export async function fetchTMDBRecommendations(movieId: number) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/recommendations?language=fr-FR`,
      {
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();
    return data.results?.slice(0, 6) || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des recommandations TMDB:', error);
    return [];
  }
}

export async function fetchRecentMovies() {
  try {
    const response = await fetch(
      'https://api.themoviedb.org/3/movie/now_playing?language=fr-FR',
      {
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des films récents:', error);
    return [];
  }
}
