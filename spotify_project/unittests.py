# Special Thanks to ChatGPT for we have never seen how to write unit tests
# This was not necessary but great to see that with correct tests, the rogram spotify.py performs as it should!

import unittest
from unittest.mock import patch, MagicMock
from spotify import Library, Song, Playlist


class TestMusicLibrary(unittest.TestCase):
    def setUp(self):
        """Set up a library instance for testing."""
        self.library = Library()

    @patch.object(Library, 'load_songs_from_csv', return_value=None)
    def test_add_song_to_library(self, mock_load_csv):
        # Create a Library instance with no pre-loaded songs
        library = Library()

        # Simulate user input for song details
        with patch('builtins.input', side_effect=["Test Title", "Test Artist", "Test Album", "2020"]):
            library.add_song_to_library()

        # Check that the song was added correctly
        self.assertEqual(len(library.songs), 1)
        self.assertEqual(library.songs[0].title, "Test Title")
        self.assertEqual(library.songs[0].artist, "Test Artist")
        self.assertEqual(library.songs[0].album, "Test Album")
        self.assertEqual(library.songs[0].year, 2020)

    def test_delete_song_from_library(self):
        """Test deleting a song from the library."""
        # Add a song to delete
        self.library.songs.append(Song("Delete Song", "Artist", "Album", 2000))

        with patch('builtins.input', return_value="delete song"):
            self.library.delete_song_from_library()
        # Need to assert 10000 because after adding and deleting the dummy song, only the initially created songs should remain
        self.assertEqual(len(self.library.songs), 10000)

    def test_create_playlist(self):
        """Test creating a playlist."""
        with patch('builtins.input', return_value="Chill Playlist"):
            self.library.create_playlist()
        
        self.assertEqual(len(self.library.playlists), 1)
        self.assertEqual(self.library.playlists[0].name, "Chill Playlist")

    def test_add_song_to_playlist(self):
        """Test adding a song to a playlist."""
        # Add song and playlist to the library
        self.library.songs.append(Song("Song1", "Artist1", "Album1", 2020))
        self.library.playlists.append(Playlist("My Playlist"))

        with patch('builtins.input', side_effect=["My Playlist", "Song1"]):
            self.library.add_song_to_playlist()

        self.assertEqual(len(self.library.playlists[0].songs), 1)
        self.assertEqual(self.library.playlists[0].songs[0].title, "Song1")


    @patch('builtins.input', side_effect=["year", "abc", "2020", "linear"])
    @patch('builtins.print')  # Mock the print function
    def test_invalid_year_search(self, mock_print, mock_input):
        """Test search with invalid year input."""
        
        # Execute the search_songs function
        self.library.search_songs()

        # Assert the print function was called with the invalid year warning
        mock_print.assert_any_call("Invalid input. Please enter a valid positive integer for the year.")

    @patch('builtins.input', side_effect=["invalid", "title", "Test Title", "linear"])
    @patch('builtins.print')  # Mock the print function
    def test_invalid_search_by(self, mock_print, mock_input):
        """Test search with invalid search_by input."""
        
        # Execute the search_songs function
        self.library.search_songs()

        # Assert the print function was called with the invalid search_by warning
        mock_print.assert_any_call("Invalid choice. Please enter one of the following: title, artist, album, or year.")


    @patch('builtins.input', side_effect=["title", "Test Title", "invalid", "linear"])
    @patch('builtins.print')  # Mock the print function
    def test_invalid_search_method(self, mock_print, mock_input):
        """Test search with invalid search method."""
        
        # Execute the search_songs function
        self.library.search_songs()

        # Assert the print function was called with the invalid search method warning
        mock_print.assert_any_call("Invalid choice. Please enter either 'linear' or 'binary'.")




    def test_invalid_year_search(self):
        """Test invalid year input during search."""
        with patch('builtins.input', side_effect=["year", "abc", "2020", "linear"]):
            with patch('builtins.print') as mock_print:
                self.library.search_songs()
        
        mock_print.assert_any_call("Invalid input. Please enter a valid positive integer for the year.")

    @patch.object(Library, 'load_songs_from_csv', return_value=None)
    def test_sort_library_by_title(self, mock_load_csv):
        # Create a library instance
        library = Library()

        # Add unsorted songs, including one with None title
        library.songs.append(Song(None, "Artist1", "Album1", 2020))  # Song with None title
        library.songs.append(Song("B Song", "Artist2", "Album2", 2021))
        library.songs.append(Song("A Song", "Artist3", "Album3", 2019))

        # Simulate user input to sort by title
        with patch('builtins.input', side_effect=["title", "quick"]):
            library.sort_library(None, None)

        # Assert the songs are sorted by title, with None treated as empty string
        self.assertEqual(library.songs[0].title, "A Song")
        self.assertEqual(library.songs[1].title, "B Song")
        self.assertIsNone(library.songs[2].title)  # None should be last

    def test_mark_song_as_favorite(self):
        """Test marking a song as a favorite."""
        self.library.songs.append(Song("Favorite Song", "Artist", "Album", 2020))

        with patch('builtins.input', return_value="Favorite Song"):
            self.library.mark_as_favorite()

        self.assertEqual(len(self.library.favorites), 1)
        self.assertEqual(self.library.favorites[0].title, "Favorite Song")

    @patch.object(Library, 'load_songs_from_csv', return_value=None)
    def test_unmark_song_as_favorite(self, mock_load_csv):
        # Create a Library instance with no pre-loaded songs
        library = Library()

        # Add a song and mark it as a favorite
        song = Song("Favorite Song", "Artist", "Album", 2020)
        library.songs.append(song)
        library.favorites.append(song)

        # Simulate user input to unmark the favorite song
        with patch('builtins.input', return_value="favorite song"):
            library.unmark_as_favorite()

        # Check that the song was removed from favorites
        self.assertEqual(len(library.favorites), 0)


if __name__ == "__main__":
    unittest.main()