import json
import random
import sys

def load_words(file="words.json"):
    try:
        with open(file, "r") as file:
            return json.load(file)
    except FileNotFoundError:
        print("Error: words.json file not found.")
        sys.exit(1)
    except json.JSONDecodeError:
        print("Error: The word list couldn't be loaded. Check the file format.")
        sys.exit(1)
        
def scramble_word(word):
    chars= list(word)
    random.shuffle(chars)
    return "".join(chars)

def play_round(words):
    secret = random.choice(words)
    scrambled = scramble_word(secret)
    print(f"\nScrambled word: {scrambled}")
    
    for _ in range(3):
        guess = input("Your guess: ").strip().lower().replace(" ", "")
        if guess == secret:
            print("Awesome! You got it.")
            return
        print("Please try again.")
        
    print("Out of tries. The word was: " + secret)
    
def main():
    categories = load_words()
    
    while True:
        print("\nCategories: ", ", ".join(categories.keys()))
        print("Or type 'exit' to quit")
        choice = input("Select a category: ").strip().lower()
        
        if choice == 'exit':
            print("Thanks for playing! Later.")
            break
        elif choice not in categories:
            print("Invalid category. Please try again.")
            continue
        
        play_round(categories[choice])
        
        again = input("\nPlay again? (y/n): ").strip().lower()
        if again != 'y':
            print(" Thanks for playing! Later.")
            break
        
if __name__ == "__main__":
    main()