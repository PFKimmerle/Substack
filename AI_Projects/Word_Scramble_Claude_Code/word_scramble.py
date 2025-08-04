import random

def main():
    categories = {
        "flower": ["rose", "tulip", "daisy", "lily", "orchid", "sunflower", "violet", "jasmine"],
        "food": ["pizza", "burger", "pasta", "salad", "chicken", "sandwich", "soup", "rice"],
        "car": ["honda", "toyota", "ford", "bmw", "audi", "tesla", "nissan", "mazda"]
    }
    
    print("Welcome to Word Scramble Game!")
    print("=" * 30)
    
    while True:
        print("\nSelect a category:")
        print("1. Flower")
        print("2. Food") 
        print("3. Car")
        print("Q. Quit")
        
        choice = input("\nEnter your choice: ").lower().strip()
        
        if choice == 'q':
            print("Thanks for playing!")
            break
            
        category_map = {"1": "flower", "2": "food", "3": "car"}
        
        if choice not in category_map:
            print("Invalid choice. Please try again.")
            continue
            
        selected_category = category_map[choice]
        word = random.choice(categories[selected_category])
        scrambled = scramble_word(word)
        
        print(f"\nCategory: {selected_category.title()}")
        print(f"Scrambled word: {scrambled}")
        print("You have 3 chances to guess the word!")
        
        guesses = 0
        max_guesses = 3
        
        while guesses < max_guesses:
            guess = input(f"\nGuess #{guesses + 1}: ").lower().strip()
            
            if guess == word:
                print("Correct! Well done!")
                break
            else:
                guesses += 1
                remaining = max_guesses - guesses
                if remaining > 0:
                    print(f"Incorrect. You have {remaining} guess(es) left.")
                else:
                    print(f"Game over! The correct answer was: {word}")
        
        play_again = input("\nPlay again? (Y/N): ").lower().strip()
        if play_again != 'y':
            print("Thanks for playing!")
            break

def scramble_word(word):
    word_list = list(word)
    random.shuffle(word_list)
    scrambled = ''.join(word_list)
    
    while scrambled == word:
        random.shuffle(word_list)
        scrambled = ''.join(word_list)
    
    return scrambled

if __name__ == "__main__":
    main()