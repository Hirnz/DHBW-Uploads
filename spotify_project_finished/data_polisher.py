import pandas as pd
import random

# Function to clean up the 'b', single quotes, and recurring double quotes
def clean_field(text):
    if isinstance(text, str):
        return text.replace("b'", "").replace("'", "").replace('"', "")
    return text

# Function to randomize year if it is 0
def randomize_year(year):
    if year == 0:
        return random.randint(1930, 2010)
    return year

# Load the dataset from SongCSV.csv (replace with actual file path)
input_file = 'SongCSV.csv'  # Adjust this to your file location
df = pd.read_csv(input_file)

# Extracting the important fields: Title (track_name), ArtistName (artist), AlbumName (album), Year (decade)
df_extracted = df[['Title', 'ArtistName', 'AlbumName', 'Year']]

# Renaming columns to match the desired output
df_extracted.columns = ['track_name', 'artist', 'album', 'decade']

# Cleaning up the 'b', single quotes, and double quotes from track_name, artist, and album columns
df_extracted['track_name'] = df_extracted['track_name'].apply(clean_field)
df_extracted['artist'] = df_extracted['artist'].apply(clean_field)
df_extracted['album'] = df_extracted['album'].apply(clean_field)

# Randomizing the year if it is 0
df_extracted['decade'] = df_extracted['decade'].apply(randomize_year)

# Save the cleaned and extracted data to a new CSV file
output_file = 'songs.csv'
df_extracted.to_csv(output_file, index=False)

print(f"Cleaned data saved to {output_file}")
