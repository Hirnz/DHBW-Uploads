import pandas as pd, random

def clean_field(text):
    if isinstance(text, str):
        return text.replace("b'", "").replace("'", "").replace('"', "")
    return text

def randomize_year(year):
    if year == 0:
        return random.randint(1930, 2010)
    return year

# Load the dataset: SongCSV.csv (is on same level as this script)
input_file = 'SongCSV.csv'
df = pd.read_csv(input_file)

# Extracting the categories that will be used in spotify.py and renaming properly
df_extracted = df[['Title', 'ArtistName', 'AlbumName', 'Year']]
df_extracted.columns = ['track_name', 'artist', 'album', 'year']

# Cleaning of data/using the two defs to clean&randomize
df_extracted['track_name'] = df_extracted['track_name'].apply(clean_field)
df_extracted['artist'] = df_extracted['artist'].apply(clean_field)
df_extracted['album'] = df_extracted['album'].apply(clean_field)
df_extracted['year'] = df_extracted['year'].apply(randomize_year)

# Save the cleaned data to songs.csv which will be the data to use in spotify.py
output_file = 'songs.csv'
df_extracted.to_csv(output_file, index=False)
print(f"Cleaned data saved to {output_file}") # Feedback for testing/to see if the script worked