import click
from file_handler import load_csv
from analysis import analyze_viewing_history

@click.command()
@click.option('--file', prompt='Netflix History CSV File', help='Path to Netflix viewing history CSV file')
def main(file):
    """Analyzes your Netflix viewing habits."""
    data = load_csv(file)
    analyze_viewing_history(data)

if __name__ == '__main__':
    main()
