import click
from file_handler import load_csv
from analysis import analyze_viewing_history

@click.command()
@click.option('--file', '-f', required=True, type=click.Path(), help='Specify the path to your Netflix viewing history CSV file.')
def main(file: str):
    """Analyzes your Netflix viewing habits."""
    try:
        data = load_csv(file)
        analyze_viewing_history(data)
        print("Results have been successfully analyzed.")
    except FileNotFoundError:
        print(f"Error: The file '{file}' was not found. Please check the file path and try again.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == '__main__':
    main()