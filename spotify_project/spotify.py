import time, pandas as pd, os
from colorama import Fore, Style # Coloring of the menu done via ChatGPT prompt

valid_options = ['title', 'artist', 'album', 'year']
valid_search_methods = ['linear', 'binary']
valid_sort_algorithms = ['insertion', 'selection', 'quick']

#####################################################################################
# Functionalities to navigate and design the menu/terminal as a user sees it
def clear_screen():
    # Source: https://www.geeksforgeeks.org/clear-screen-python/
    os.system('cls' if os.name == 'nt' else 'clear')

def display_menu():
    clear_screen()  # To make sure the user only sees the current menu and doesn't get confused with earlier results found or actions taken; makes scrolling not required
    print(Fore.CYAN + "=" * 50)
    print("   Welcome to Your Music Library Manager")
    print("=" * 50 + Style.RESET_ALL)
    print("\n" + Fore.YELLOW + "Please select an option:" + Style.RESET_ALL)
    print("1. Add song to library")
    print("2. Delete song from library")
    print("3. Manage playlists")  # Playlist submenu: def display_playlist_menu and choice handling: def perform_playlist_action, displayed by manage_playlists
    print("4. Manage favorites")  # Favorites submenu: def display_favorites_menu and choice handling: def perform_favorites_action, displayed by manage_favourites
    print("5. Search for songs")
    print("6. Sort library")
    print("E. Exit")
    print(Fore.CYAN + "=" * 50 + Style.RESET_ALL)

def display_playlist_menu():
    clear_screen()
    print(Fore.CYAN + "=" * 50)
    print("   Playlist Management")
    print("=" * 50 + Style.RESET_ALL)
    print("\n" + Fore.YELLOW + "Please select an option:" + Style.RESET_ALL)
    print("1. Create playlist")
    print("2. Delete playlist")
    print("3. Add song to playlist")
    print("4. Remove song from playlist")
    print("5. List all playlists")
    print("B. Back to main menu")
    print(Fore.CYAN + "=" * 50 + Style.RESET_ALL)

def display_favorites_menu():
    clear_screen()
    print(Fore.CYAN + "=" * 50)
    print("   Favorites Management")
    print("=" * 50 + Style.RESET_ALL)
    print("\n" + Fore.YELLOW + "Please select an option:" + Style.RESET_ALL)
    print("1. Mark song as favorite")
    print("2. Unmark song as favorite")
    print("3. List all favorite songs")
    print("B. Back to main menu")
    print(Fore.CYAN + "=" * 50 + Style.RESET_ALL)

def perform_playlist_action(choice, library):
    if choice == '1':
        library.create_playlist()
    elif choice == '2':
        library.delete_playlist()
    elif choice == '3':
        library.add_song_to_playlist()
    elif choice == '4':
        library.remove_song_from_playlist()
    elif choice == '5':
        library.list_playlists()
    else:
        print(Fore.RED + "Invalid choice. Please try again." + Style.RESET_ALL)
    
    input("\nPress Enter to return to the playlist menu...")

def perform_favorites_action(choice, library):
    if choice == '1':
        library.mark_as_favorite()
    elif choice == '2':
        library.unmark_as_favorite()
    elif choice == '3':
        library.list_favorites()
    else:
        print(Fore.RED + "Invalid choice. Please try again." + Style.RESET_ALL)
    
    input("\nPress Enter to return to the favorites menu...")

def manage_playlists(library):
    while True:
        display_playlist_menu()  # Show the playlist management menu
        choice = input("Enter your choice: ").lower()
        if choice == 'b':
            break # Exit the playlist management menu and go back to the main menu
        else:
            perform_playlist_action(choice, library)

def manage_favorites(library):
    while True:
        display_favorites_menu()  # Show the favorites management menu
        choice = input("Enter your choice: ").lower()
        if choice == 'b':
            break # Exit the playlist management menu and go back to the main menu
        else:
            perform_favorites_action(choice, library)

def perform_action(choice, library):
    if choice == '1':
        library.add_song_to_library()
    elif choice == '2':
        library.delete_song_from_library()
    elif choice == '3':
        manage_playlists(library) # Submenu call
    elif choice == '4':
        manage_favorites(library) # Submenu call
    elif choice == '5':
        library.search_songs() # search_songs call
    elif choice == '6':
        library.sort_library(None, None) # sort_library call
    else:
        print(Fore.RED + "Invalid choice. Please try again." + Style.RESET_ALL)
    
    input("\nPress Enter to return to the menu...")
#####################################################################################

#####################################################################################
class Song:

    def __init__(self, title, artist, album, year):
        self.title = title
        self.artist = artist
        self.album = album
        self.year = year

    # Functions __str__ and __repr__ so Song-Objects dont just return their memory adress, but rather return their important info in form of a string that is readable
    # Mostly called in the outputs of search and sort functions
    def __str__(self):
        return f"{self.title} by {self.artist} ({self.year})"
    
    
    def __repr__(self):
        return f"{self.title} by {self.artist} ({self.year})"
#####################################################################################

#####################################################################################
class Playlist:

    def __init__(self, name):
        self.name = name
        self.songs = []


    def add_song(self, song):
        self.songs.append(song)


    def remove_song(self, song):
        self.songs.remove(song)

    # Same reason as in class Song: readable output when Playlists are being output, mostly in the playlist submenus options
    def __str__(self):
        return f"Playlist: {self.name}, {len(self.songs)} songs"
#####################################################################################


#####################################################################################
class Library:

    def __init__(self, csv_file="songs.csv"):
        self.songs = []
        self.playlists = []
        self.favorites = []
        self.sorted_by = None
        self.load_songs_from_csv(csv_file)


    def __str__(self):
        if not self.songs:
            return "Library is empty."
        return "\n".join([str(song) for song in self.songs]) # If you want to print the whole library for whatever reason


    def load_songs_from_csv(self, file_path):
        try:
            song_df = pd.read_csv(file_path)
            for _, row in song_df.iterrows():
                # 'year' is treated as an integer and the defs that work with year will handle NaN values correctly
                year = row['year'] if pd.notna(row['year']) else 0
                song = Song(row['track_name'], row['artist'], row['album'], int(year))
                self.songs.append(song)
            print(f"{len(song_df)} songs loaded from {file_path}!")
        # When the file with the data isnt on the same level, there will be errors loading it
        except FileNotFoundError:
            print(f"Error: The file {file_path} was not found.")
        except Exception as e:
            print(f"An error occurred while loading songs: {e}")


    def get_non_empty_input(self, prompt: str, default_value: str = None) -> str:
        # Prompt the user for input and return a default value if input is empty.
        while True:
            user_input = input(prompt)
            if user_input:
                return user_input
            elif default_value is not None:
                return default_value
            else:
                print("Input cannot be empty. Please provide a value.")


    def add_song_to_library(self):
        # Using def get_non_empty_input to have non NaN entries (even though they would get handled correctly) to have at least some kind of feedback for the user
        title = self.get_non_empty_input("Enter the title (or leave blank for 'Untitled'): ", "Untitled")
        artist = self.get_non_empty_input("Enter the artist (or leave blank for 'Unknown Artist'): ", "Unknown Artist")
        album = self.get_non_empty_input("Enter the album (or leave blank for 'Unknown Album'): ", "Unknown Album")
        # Looping through user input prompts until there is avalid one
        while True:
            try:
                year = int(input("Enter the year: "))
                break
            except ValueError:
                print("Please enter a valid year.")
        song = Song(title, artist, album, year)
        # Add it to the library (songs is the actual list that contains the 10000 songs from the csv and any user added songs)
        self.songs.append(song)
        print(f"Song '{title}' added to the library!")


    def delete_song_from_library(self):
        title = input("Enter the title of the song to delete: ").lower()
        for song in self.songs:
            song_title = song.title if isinstance(song.title, str) else "" # Handle NaN or non-string values
            if song_title.lower() == title:
                self.songs.remove(song)
                print(f"Song '{title}' deleted from the library!")
                # Remove from any playlists and unmark as favorite
                for playlist in self.playlists:
                    if song in playlist.songs:
                        playlist.remove_song(song)
                if song in self.favorites:
                    self.unmark_as_favorite(song)
                return
        print(f"Song '{title}' not found in the library.")


    def create_playlist(self):
        name = input("Enter the playlist name: ")
        playlist = Playlist(name)
        self.playlists.append(playlist)
        print(f"Playlist '{name}' created!")


    def delete_playlist(self):
        name = input("Enter the playlist name to delete: ")
        for playlist in self.playlists:
            if playlist.name == name:
                self.playlists.remove(playlist)
                print(f"Playlist '{name}' deleted!")
                return
        print(f"Playlist '{name}' not found.")


    def add_song_to_playlist(self):
        # Similar to add_song_to_library but has to check for the existance of that Song-Object first and only operates in the playlist given by the user
        playlist_name = input("Enter the playlist name: ")
        title = input("Enter the song title to add: ").lower()
        for playlist in self.playlists:
            if playlist.name == playlist_name:
                for song in self.songs:
                    song_title = song.title if isinstance(song.title, str) else "" # Handle NaN or non-string values
                    if song_title.lower() == title:
                        playlist.add_song(song)
                        print(f"Song '{title}' added to playlist '{playlist_name}'!")
                        return
        print("Playlist or song not found.")


    def remove_song_from_playlist(self):
        # Similar to remove_song_from_library but has to check for the existance of that Song-Object first and only operates in the playlist given by the user
        playlist_name = input("Enter the playlist name: ")
        title = input("Enter the song title to remove: ").lower()
        for playlist in self.playlists:
            if playlist.name == playlist_name:
                for song in playlist.songs:
                    song_title = song.title if isinstance(song.title, str) else "" # Handle NaN or non-string values
                    if song_title.lower() == title:
                        playlist.remove_song(song)
                        print(f"Song '{title}' removed from playlist '{playlist_name}'!")
                        return
        print("Playlist or song not found.")


    def mark_as_favorite(self):
        title = input("Enter the song title to mark as favorite: ").strip().lower()
        for song in self.songs:
            if isinstance(song.title, str) and song.title.lower() == title:
                if song not in self.favorites:
                    self.favorites.append(song)
                    print(f"Song '{title}' marked as favorite!")
                return
        print(f"Song '{title}' not found.") # If the song is i.e. not a string, discard the attempt to mark it as favourite


    def unmark_as_favorite(self):
        title = input("Enter the song title to unmark as favorite: ")
        for song in self.favorites:
            if song.title and song.title.lower() == title.lower():
                self.favorites.remove(song)
                print(f"Song '{title}' removed from favorites!")
                return
        print(f"Song '{title}' not found in favorites.")


    def list_favorites(self):
        print("Favorite Songs:")
        for song in self.favorites:
            print(song)


    def list_playlists(self):
        print("Playlists:")
        for playlist in self.playlists:
            print(f"{playlist.name}: {[str(song) for song in playlist.songs]}")

    #####################################################################################
    # Sorting Algorithm Options: Sources in documentation (Youtube links), polished with the help of example code available on https://www.geeksforgeeks.org/sorting-algorithms/
    # Insertion-Sort:
    def insertion_sort(self, arr, key_func):
        for i in range(1, len(arr)):
            key = arr[i]
            j = i - 1
            while j >= 0 and key_func(arr[j]) > key_func(key):
                arr[j + 1] = arr[j]
                j -= 1
            arr[j + 1] = key
    # Selection-Sort:
    def selection_sort(self, arr, key_func):
        for i in range(len(arr)):
            min_idx = i
            for j in range(i + 1, len(arr)):
                if key_func(arr[j]) < key_func(arr[min_idx]):
                    min_idx = j
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
    # Quick-Sort:
    def quicksort(self, arr, key_func):
        if len(arr) <= 1:
            return arr
        pivot = arr[len(arr) // 2]
        left = [x for x in arr if key_func(x) < key_func(pivot)]
        middle = [x for x in arr if key_func(x) == key_func(pivot)]
        right = [x for x in arr if key_func(x) > key_func(pivot)]
        return self.quicksort(left, key_func) + middle + self.quicksort(right, key_func)
    #####################################################################################


    #####################################################################################
    # Searching Algorithm Options: Sources in documentation (Youtube links), additional source that explained the mechanism in greater detail to understand when to use which: https://www.geeksforgeeks.org/searching-algorithms-in-python/ 
    # Binary-Search:
    def binary_search(self, search_term, sort_by='title'):
        if sort_by == 'year':
            try:
                search_term = int(search_term) # Convert search term to an integer for year
            except ValueError:
                print("Invalid year input. Please enter a valid number, otherwise no songs will be found.")
                return []
        else:
            search_term = search_term.lower()

        # Sort the library by the specified attribute before performing binary search
        self.songs.sort(key=lambda x: (str(getattr(x, sort_by) or "")).lower()) 
        # sort() by python uses TimSort which fast (worst case O(n*log(n))) but still takes a bit of time which is visible in the tests
        # https://stackoverflow.com/questions/7770230/comparison-between-timsort-and-quicksort

        
        left, right = 0, len(self.songs) - 1
        result_index = None
        # Perform the binary search and handle different data types (year as an int is the exception to the three other attributes that are handled as str)
        while left <= right:
            mid = (left + right) // 2
            mid_value = getattr(self.songs[mid], sort_by)

            if sort_by == 'year':
                if mid_value == search_term:
                    result_index = mid
                    break
                elif mid_value < search_term:
                    left = mid + 1
                else:
                    right = mid - 1
            else:
                if not isinstance(mid_value, str):
                    mid_value = ""

                mid_value = mid_value.lower()

                if mid_value == search_term:
                    result_index = mid
                    break
                elif mid_value < search_term:
                    left = mid + 1
                else:
                    right = mid - 1

        if result_index is None:
            return [] # Return empty list to allow search_songs a working output, if this isnt implemented, search_songs expects a list but recieves None

        # If it found a match, expand to find all matches around it
        results = [self.songs[result_index]] # Add the initial found match

        # Search to the left of the found match
        i = result_index - 1
        while i >= 0 and getattr(self.songs[i], sort_by) == search_term:
            results.append(self.songs[i])
            i -= 1

        # Search to the right of the found match
        i = result_index + 1
        while i < len(self.songs) and getattr(self.songs[i], sort_by) == search_term:
            results.append(self.songs[i])
            i += 1

        # Returning all results is important for searching but not for sorting, so this returns all result that were found
        return results
    # Linear-Search:
    def linear_search(self, search_term, search_by='title'):
        results = []

        if search_by == 'year':
            try:
                search_term = int(search_term) # Convert search term to an integer for year
            except ValueError:
                print("Invalid year input. Please enter a valid number.")
                return results
        else:
            search_term = search_term.lower() # Convert input to lowercase for case-insensitive search

        for song in self.songs:
            value_to_check = getattr(song, search_by)

            # Handling NaN or non-string values (year) and string searches
            if search_by == 'year':
                if value_to_check == search_term:
                    results.append(song)
            else:
                if isinstance(value_to_check, str):
                    if search_term in value_to_check.lower():
                        results.append(song)

        # Returning all results is important for searching but not for sorting, so this returns all result that were found
        return results
    #####################################################################################

    #####################################################################################
    # Actual calls to the differen search functions with user interaction:
    # Searching: 
    def search_songs(self):
        search_term = None
        results = None

        # Loop until a valid search attribute is provided
        while True:
            search_by = input("Search by (title/artist/album/year): ").lower()
            if search_by in valid_options:
                break # Valid input, exit the loop
            else:
                print("Invalid choice. Please enter one of the following: title, artist, album, or year.")

        if search_by == "year":
            while True:
                search_term = input("Enter the search term (positive integer): ")
                if search_term.isdigit() and int(search_term) > 0:
                    search_term = int(search_term) # Convert the valid input to an integer
                    break
                else:
                    print("Invalid input. Please enter a valid positive integer for the year.")
        else:
            search_term = input(f"Enter the search term for {search_by}: ").lower()

        # Loop until a valid search method is provided
        while True:
            search_method = input("Search method (linear/binary): ").lower()
            if search_method in ['linear', 'binary']:
                break # Valid input, exit the loop
            else:
                print("Invalid choice. Please enter either 'linear' or 'binary'.")

        start_time = time.time()

        # Perform search (based on the chosen method)
        if search_method == "linear":
            results = self.linear_search(search_term, search_by)
        elif search_method == "binary":
            results = self.binary_search(search_term, search_by)

        elapsed_time = time.time() - start_time # Calculate elapsed time for search to give the user feedback, also used for tests

        # Print search results only once
        if results:
            print(f"{len(results)} song(s) found in {elapsed_time:.6f} seconds:")
            for song in results:
                print(song) # Through __repr__ this doesnt print the object but its "description" that was set by the __repr__ method
        else:
            print(f"No matching songs found. Search completed in {elapsed_time:.6f} seconds.")
    #####################################################################################
    # Sorting:
    def sort_library(self, sort_by, algorithm):
        # Loop until valid sorting attribute is provided
        while True:
            sort_by = input("Sort by (title/artist/album/year): ").lower()
            if sort_by in valid_options:
                break # Valid input, exit the loop
            else:
                print("Invalid choice. Please enter one of the following: title, artist, album, or year.")

        # Validation loop for selecting sorting algorithm
        while True:
            algorithm = input("Choose sorting algorithm (insertion/selection/quick): ").lower()
            if algorithm in valid_sort_algorithms:
                break # Valid input, exit the loop
            else:
                print("Invalid choice. Please enter either 'insertion', 'selection', or 'quick'.")

        # Sorting logic, only ChatGPT could help me with the lambda functions, tried it with the help of https://blogboard.io/blog/knowledge/python-sorted-lambda/#:~:text=A%20really%20simple%20concept%20with,a%20value%20of%20an%20expression. but couldn't implement it by myself
        if sort_by == "year":
            key_func = lambda x: getattr(x, sort_by)
        else:
            key_func = lambda x: (getattr(x, sort_by) or "").lower() if isinstance(getattr(x, sort_by), str) else ""
        start_time = time.time()

        # Only sort if the library is not already sorted by this attribute
        if self.sorted_by != sort_by:
            print(f"Sorting by {sort_by} using {algorithm}...") # Giving feedback when testing a slower algorithm to make sure its actually running, quicksort is done before you can question if its working
            if algorithm == 'insertion':
                self.insertion_sort(self.songs, key_func)
            elif algorithm == 'selection':
                self.selection_sort(self.songs, key_func)
            elif algorithm == 'quick':
                self.songs = self.quicksort(self.songs, key_func)
            else:
                print("Invalid sorting algorithm.")
                return
            
            self.sorted_by = sort_by

            # Printing all results is important for searching but not for sorting, so this prints only the first 5 results found
            print("Library sorted successfully. Here are the first 5 songs:")
            for song in self.songs[:5]:
                print(song)

            elapsed_time = time.time() - start_time
            print(f"Library sorted by {sort_by} using {algorithm.capitalize()} Sort in {elapsed_time:.6f} seconds.")
        else:
            print(f"Library is already sorted by {sort_by}, skipping sorting.")
    #####################################################################################
#####################################################################################


# Main program that runs in a continuous loop, awaits user input etc.
def main():
    library = Library("songs.csv")

    while True:
        display_menu() # Show the main menu
        choice = input("Enter your choice: ").lower()

        if choice == 'e': # Option for the user to exit the program (only available when in the main menu) if the user is not currently navigating through a submenu
            print("Exiting the program. Goodbye!")
            break 
        else:
            perform_action(choice, library)


if __name__ == "__main__":
    main()