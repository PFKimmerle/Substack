import pandas as pd

def load_csv(filepath):
    """Reads and loads Netflix history from a CSV file."""
    try:
        df = pd.read_csv(filepath)
        return df
    except FileNotFoundError:
        raise Exception(f"File {filepath} not found.")
    except Exception as e:
        raise Exception(f"An error occurred: {e}")
