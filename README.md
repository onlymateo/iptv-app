# IPTV app

IPTV app is a web application developed with React and Vite, using Tailwind CSS for styling. This project allows you to manage M3U playlists, display movies, series, and TV channels, and interact with a local database to store user information.

## Features

- **M3U Playlist Management**: Download and import M3U files to manage your media.
- **Content Display**: Browse and watch movies, series, and TV channels.
- **Local Database**: Uses IndexedDB to store user data such as viewing history and favorites list.
- **Recommendations**: Get recommendations based on viewed media.
- **Profile Customization**: Change your avatar and manage your favorites list.

## Installation

1. Clone the repository:   
   ```bash 
   git clone git@github.com:onlymateo/iptv-app.git
   ```

2. Install dependencies:   ```bash
   npm install   ```

3. Start the development server:   ```bash
   npm start  ```

4. Access the application via [http://localhost:3000](http://localhost:3000).


## Configuration

- **Tailwind CSS**: Style configuration in `tailwind.config.js`.

## Project Structure

- **src/pages**: Contains the main pages of the application such as `login`, `homepage`, `details`, `user`, and `searching`.
- **src/components**: Reusable components of the application.
- **public**: Static files and manifests.

## Main Dependencies

- React
- Tailwind CSS
- IndexedDB (via `idb`)

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss the changes you wish to make.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
