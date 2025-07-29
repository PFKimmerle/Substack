import random

# Game symbols
SYMBOLS = ['🎨', '💎', '🍉', '⭐', '🪅']

def create_deck():
    """Create a deck of 5 unique symbols, duplicated and shuffled"""
    symbols = SYMBOLS[:5]  # Use first 5 symbols
    print("Card symbols to match:", " ".join(symbols))
    deck = symbols + symbols
    random.shuffle(deck)
    return deck

def display_board(deck, flipped_cards, matched_pairs):
    print("\n" + "="*30)
    print("  FLIP AND MATCH GAME")
    print("="*30)
    
    print("Positions: ", end="")
    for i in range(10):
        print(f"{i+1:>3}", end=" ")
    print()
    
    print("Cards:     ", end="")
    for i in range(10):
        if i in matched_pairs:
            print(f"{deck[i]:>3}", end=" ")
        elif i in flipped_cards:
            print(f"{deck[i]:>3}", end=" ")
        else:
            print("  ?", end=" ")
    print("\n")

def get_user_input():
    while True:
        try:
            choice = input("Enter two card positions (1-10) separated by space, or 'q' to quit: ").strip().lower()
            if choice == 'q':
                return -1, -1
            
            # Split input and validate we have exactly 2 positions
            positions = choice.split()
            if len(positions) != 2:
                print("Please enter exactly two positions separated by a space.")
                continue
            
            # Convert to integers and validate range
            pos1, pos2 = int(positions[0]), int(positions[1])
            
            if not (1 <= pos1 <= 10 and 1 <= pos2 <= 10):
                print("Both positions must be between 1 and 10.")
                continue
            
            if pos1 == pos2:
                print("You can't select the same card twice!")
                continue
            
            return pos1 - 1, pos2 - 1  # Convert to 0-based index
            
        except ValueError:
            print("Please enter valid numbers or 'q' to quit.")

def print_instructions():
    print("\nFLIP AND MATCH GAME")
    print("Find matching pairs by entering two card positions separated by a space.")
    print("Example: '3 7' to flip cards at positions 3 and 7")
    print("Type 'q' to quit anytime.\n")

def play_game():
    deck = create_deck()
    matched_pairs = set()
    attempts = 0
    
    print_instructions()
    
    while len(matched_pairs) < 10:
        display_board(deck, [], matched_pairs)
        
        print("Select two cards:")
        pos1, pos2 = get_user_input()
        if pos1 == -1 and pos2 == -1:
            return False
        
        # Check if cards are already matched and give specific feedback
        if pos1 in matched_pairs and pos2 in matched_pairs:
            print("Both cards are already matched! Choose different cards.")
            continue
        elif pos1 in matched_pairs:
            print(f"Card at position {pos1 + 1} is already matched! Choose a different card.")
            continue
        elif pos2 in matched_pairs:
            print(f"Card at position {pos2 + 1} is already matched! Choose a different card.")
            continue
        
        display_board(deck, [pos1, pos2], matched_pairs)
        attempts += 1
        
        if deck[pos1] == deck[pos2]:
            print("MATCH! Great job!")
            matched_pairs.add(pos1)
            matched_pairs.add(pos2)
        else:
            print("No match. Cards will flip back.")
    
    display_board(deck, [], matched_pairs)
    print(f"CONGRATULATIONS! You won in {attempts} attempts!")
    return True

def main():
    print("Welcome to Flip and Match!")
    
    while True:
        game_completed = play_game()
        
        if not game_completed:
            print("Thanks for playing! Goodbye!")
            break
        
        while True:
            play_again = input("\nPlay again? (y/n): ").strip().lower()
            if play_again in ['y', 'yes']:
                print("\nStarting new game...\n")
                break
            elif play_again in ['n', 'no']:
                print("Thanks for playing! Goodbye!")
                return
            else:
                print("Please enter 'y' or 'n'.")

if __name__ == "__main__":
    main()