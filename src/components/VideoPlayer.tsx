import React from 'react';
import { X } from 'lucide-react';
import ReactPlayer from 'react-player';

interface VideoPlayerProps {
  uri: string;
  title: string;
  onClose: () => void;
}

export function VideoPlayer({ uri, onClose, title }: VideoPlayerProps) {

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="relative w-full h-full max-w-screen-xl mx-auto p-4">
        <button
          className="absolute top-4 right-4 bg-white text-black p-2 rounded-full hover:bg-gray-200 z-50"
          onClick={onClose}
          type="button"
          aria-label="Fermer le lecteur vidéo"
        >
          <X size={24} />
        </button>

        <div className="relative w-full h-full flex items-center justify-center">
            <ReactPlayer
              url={uri}
              controls
              playing
              width="100%"
              height="100%"
              config={{
                file: {
                  attributes: {
                    crossOrigin: "anonymous"
                  }
                }
              }}
              onError={(e) => console.error('Erreur de lecture ReactPlayer:', e)}
            />
        </div>
      </div>
    </div>
  );
}