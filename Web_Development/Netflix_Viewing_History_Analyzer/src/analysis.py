import pandas as pd
import re
import json
from fuzzywuzzy import process

def analyze_viewing_history(df):
    """Analyzes Netflix viewing data and prints results."""

    # Expanded Genre tagging with partial title matching
    genre_dict = {
        # K-Dramas (combining K-Dramas and Asian Dramas)
        'Squid Game': 'K-Drama',
        'Crash Landing on You': 'K-Drama',
        'Vincenzo': 'K-Drama',
        'Heaven Official\'s Blessing': 'K-Drama',
        'Put Your Head on My Shoulder': 'K-Drama',
        'Take My Brother Away': 'K-Drama',
        'Love (ft. Marriage and Divorce)': 'K-Drama',

        # Anime
        'Attack on Titan': 'Anime',
        'Naruto': 'Anime',
        'One Piece': 'Anime',
        'Black Clover': 'Anime',

        # Action/Thriller
        'Breaking Bad': 'Action/Thriller',
        'Money Heist': 'Action/Thriller',
        'Stranger Things': 'Action/Thriller',
        'The Witcher': 'Action/Thriller',
        'Sherlock': 'Action/Thriller',

        # Reality Shows
        'Too Hot to Handle': 'Reality',
        'The Circle': 'Reality',
        'Dubai Bling': 'Reality',

        # Documentaries
        'Our Planet': 'Documentary',
        'Inside: Lego': 'Documentary',
        '13th': 'Documentary',

        # Comedy
        'Melissa & Joey': 'Comedy',
        'The IT Crowd': 'Comedy',
        'Brooklyn Nine-Nine': 'Comedy'
    }

    # keyword-based fallback genres
    keyword_genre_map = {
        'series': 'Drama',
        'season': 'Drama',
        'episode': 'Drama',
        'special': 'Documentary',
        'study': 'Documentary',
        'documentary': 'Documentary',
        'doctor': 'Reality',
        'love': 'K-Drama',
        'romance': 'K-Drama',
        'thriller': 'Action/Thriller',
        'war': 'Action/Thriller',
        'game': 'Action/Thriller',
        'mystery': 'Action/Thriller',
        'adventure': 'Action/Thriller',
        'fantasy': 'Action/Thriller',
        'supernatural': 'Action/Thriller',
        'crime': 'Action/Thriller',
        'comedy': 'Comedy',
        'sitcom': 'Comedy',
        'anime': 'Anime',
        'reality': 'Reality',
        'planet': 'Documentary',
        'environment': 'Documentary',
        'nature': 'Documentary'
    }

    # Function to clean titles
    def clean_title(title):
        """Remove extra colons, episode numbers, and generic labels."""
        title_cleaned = re.sub(r'(:\s*[^:]*$)', '', title)  # Remove subtitles after second colon
        title_cleaned = re.sub(r'(\sSeason\s\d+|\sEpisode\s\d+|\s*:.*$)', '', title_cleaned).strip()  # Remove specific season/episode labels
        return title_cleaned

    # Apply the title cleaning function
    df['CleanedTitle'] = df['Title'].apply(clean_title)

    # Function to match genres
    def get_genre(title):
        """Match genre using fuzzy matching and fallback to keyword-based matching."""
        # First, try fuzzy matching with the known genre dictionary
        match = process.extractOne(title, genre_dict.keys(), score_cutoff=65)  # More relaxed fuzzy matching
        if match:
            return genre_dict[match[0]]

        # If no fuzzy match, use keyword matching as a fallback
        for keyword, genre in keyword_genre_map.items():
            if keyword.lower() in title.lower():
                return genre
        
        # Fallback to default genre if nothing matches
        return 'Drama'

    # Apply the genre matching
    df['Genre'] = df['CleanedTitle'].apply(get_genre)

    # Combine K-Drama and Asian Drama into a single genre
    df['Genre'] = df['Genre'].replace({'Asian Drama': 'K-Drama'})

    # Log unmatched titles (if any still exist)
    unmatched_titles = df[df['Genre'] == 'Drama']['CleanedTitle'].unique()
    print("\nUnmatched Titles (Fell back to 'Drama'):")
    print(unmatched_titles)

    # Total number of shows/movies watched
    total_watched = len(df)
    print(f"Total shows/movies watched: {total_watched}")

    # Most-watched show after cleaning titles
    most_watched_show = df['CleanedTitle'].replace('', pd.NA).dropna().value_counts().idxmax()

    # Convert 'Date' to datetime and handle invalid dates
    df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
    invalid_dates = df['Date'].isna().sum()
    print(f"Number of invalid dates: {invalid_dates}")

    # Yearly watching breakdown
    yearly_watching = df.groupby(df['Date'].dt.year)['CleanedTitle'].count()

    # Top 5 most-watched shows/movies
    top_5_shows = df['CleanedTitle'].value_counts().head(5)

    # Analyze watch patterns by day of the week
    df['DayOfWeek'] = df['Date'].dt.day_name()
    most_watched_day = df['DayOfWeek'].value_counts().idxmax()
    day_breakdown = df['DayOfWeek'].value_counts()

    # Monthly watching breakdown
    df['Month'] = df['Date'].dt.month_name()
    month_breakdown = df.groupby(df['Month'])['CleanedTitle'].count()

    # Total time spent watching (assuming avg. 45 min per title)
    avg_episode_duration = 45  # minutes
    total_time_watched = total_watched * avg_episode_duration
    total_time_watched_hours = total_time_watched / 60  # convert to hours

    # Genre breakdown
    genre_breakdown = df['Genre'].value_counts()

    # Print all insights
    print(f"Most watched show/movie: {most_watched_show}")
    print("\nYearly watching breakdown:")
    print(yearly_watching.to_string())

    print("\nTop 5 Most-Watched Shows/Movies:")
    print(top_5_shows)

    print(f"\nMost binge-watched day of the week: {most_watched_day}")
    print("Day of Week Breakdown:")
    print(day_breakdown)

    print("\nMonthly Watching Breakdown:")
    print(month_breakdown)

    print(f"\nTotal Estimated Time Spent Watching (in minutes): {total_time_watched}")
    print(f"Total Time in Hours: {total_time_watched_hours:.2f} hours")

    print("\nMost Watched Genres:")
    print(genre_breakdown)

    # Export results to a JSON file (optional)
    insights = {
        "total_watched": total_watched,
        "most_watched_show": most_watched_show,
        "yearly_watching_breakdown": yearly_watching.to_dict(),
        "top_5_shows": top_5_shows.to_dict(),
        "most_watched_day_of_week": most_watched_day,
        "day_of_week_breakdown": day_breakdown.to_dict(),
        "monthly_watching_breakdown": month_breakdown.to_dict(),
        "total_time_watched_minutes": total_time_watched,
        "total_time_watched_hours": total_time_watched_hours,
        "most_watched_genres": genre_breakdown.to_dict()
    }

    with open('netflix_insights.json', 'w') as json_file:
        json.dump(insights, json_file, indent=4)

    print("\nResults have been exported to 'netflix_insights.json'.")
