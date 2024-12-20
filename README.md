# EpiCodi

EpiCodi is a web application developed with React and Vite, using Tailwind CSS for styling. This project allows you to manage M3U playlists, display movies, series, and TV channels, and interact with a local database to store user information.

## Features

- **M3U Playlist Management**: Download and import M3U files to manage your media.
- **Content Display**: Browse and watch movies, series, and TV channels.
- **Local Database**: Uses IndexedDB to store user data such as viewing history and favorites list.
- **Recommendations**: Get recommendations based on viewed media.
- **Profile Customization**: Change your avatar and manage your favorites list.

## Installation

1. Clone the repository:   ```bash
   git clone https://github.com/your-username/EpiCodi.git
   cd EpiCodi/codi   ```

2. Install dependencies:   ```bash
   npm install   ```

3. Start the development server:   ```bash
   npm run vite:start   ```

4. Access the application via [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `npm run vite:start`: Starts the application in development mode.
- `npm run vite:build`: Builds the application for production.
- `npm run vite:preview`: Previews the built application.

## Configuration

- **Vite**: Server and plugin configuration in `vite.config.ts`.
- **Tailwind CSS**: Style configuration in `tailwind.config.js`.

## Project Structure

- **src/pages**: Contains the main pages of the application such as `login`, `homepage`, `details`, `user`, and `searching`.
- **src/components**: Reusable components of the application.
- **public**: Static files and manifests.

## Main Dependencies

- React
- Vite
- Tailwind CSS
- IndexedDB (via `idb`)

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss the changes you wish to make.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
