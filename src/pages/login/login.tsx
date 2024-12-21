import { useState } from 'react'
import { parseM3UContent, storeContentInIndexedDB } from '../../components/parsem3u'
import React from 'react'

function LoginPage() {
  const [link, setLink] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')
  const [downloadPhase, setDownloadPhase ] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setDownloading(true);

    try {
      new URL(link);
      setDownloadPhase('Téléchargement de la playlist...');

      const a = document.createElement('a');
      a.href = link;
      a.download = 'playlist.m3u';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloadPhase('Téléchargement terminé!');
      setDownloading(false);
      window.location.reload();
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du téléchargement');
      setDownloading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setDownloading(true);
        setDownloadPhase('Lecture du fichier...');
        
        const content = await file.text();
        setDownloadPhase('Traitement de la playlist...');
        const parsedContent = parseM3UContent(content);
        await storeContentInIndexedDB(parsedContent);
        
        setDownloadPhase('Importation terminée!');
        setDownloading(false);
        window.location.reload();
      } catch (err) {
        console.error('Erreur:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'importation');
        setDownloading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: 'url(/placeholder.svg?height=1080&width=1920)' }}>
      <div className="min-h-screen bg-black bg-opacity-50 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full bg-black bg-opacity-75 rounded-md p-8 space-y-8">
          <div className="text-red-600 text-4xl font-bold text-center mb-8">NETFLOUZ</div>
          {downloading ? (
            <div className="text-white text-lg">
              {downloadPhase}
              {/*<div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                <div className="bg-red-600 h-4 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>*/}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="m3u link"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full px-4 py-3 rounded-md bg-gray-700 text-white border-none placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
              </div>
              {error && <div className="text-red-600 text-sm text-left m-0">{error}</div>}
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md transition duration-300"
              >
                Sign In
              </button>
              
              {/* Ajout de l'input file */}
              <div className="mt-4">
                <input
                  type="file"
                  accept=".m3u,.m3u8"
                  onChange={handleFileUpload}
                  className="w-full text-gray-400"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                    Remember me
                  </label>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginPage