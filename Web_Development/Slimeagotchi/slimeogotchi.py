import tkinter as tk
from tkinter import ttk
from PIL import Image, ImageTk
import time
import os
import pygame

class Slimeogotchi:
    """A class representing the Slimeogotchi pet with health, happiness, and hygiene attributes."""

    def __init__(self):
        # Initialize pet's core attributes
        self.health = 100
        self.happiness = 100
        self.hygiene = 100
        self.is_alive = True
        self.last_interaction_time = time.time()
        self.mood = "Happy"

    def feed(self):
        """Increase health and happiness when feeding the pet."""
        if self.is_alive:
            # Cap health and happiness at 100
            self.health = min(100, self.health + 20)
            self.happiness = min(100, self.happiness + 5)
            self.last_interaction_time = time.time()

    def sleep(self):
        """Replenish health and happiness when the pet sleeps."""
        if self.is_alive:
            self.health = min(100, self.health + 10)
            self.happiness = min(100, self.happiness + 10)
            self.last_interaction_time = time.time()

    def play(self):
        """Boost happiness, but decrease health as playtime drains energy."""
        if self.is_alive:
            self.happiness = min(100, self.happiness + 20)
            self.health = max(0, self.health - 5)  # Playing reduces health slightly
            self.last_interaction_time = time.time()

    def clean(self):
        """Improve hygiene of the pet."""
        if self.is_alive:
            self.hygiene = min(100, self.hygiene + 30)
            self.last_interaction_time = time.time()

    def give_medicine(self):
        """Heal the pet, restoring health."""
        if self.is_alive:
            self.health = min(100, self.health + 25)
            self.last_interaction_time = time.time()
            
    def send_love(self):
        """Increase happiness by sending love to the pet."""
        if self.is_alive:
            self.happiness = min(100, self.happiness + 15)
            self.last_interaction_time = time.time()

    def decrease_stats(self):
        """Gradually reduce pet stats over time. The pet dies if stats reach zero."""
        if self.is_alive:
            self.health = max(0, self.health - 2)
            self.happiness = max(0, self.happiness - 2)
            self.hygiene = max(0, self.hygiene - 3)
            if self.health == 0 or self.happiness == 0 or self.hygiene == 0:
                self.die()
            else:
                self.update_mood()

    def update_mood(self):
        """Update the pet's mood based on happiness levels."""
        if self.happiness > 70:
            self.mood = "Happy"
        elif self.happiness > 40:
            self.mood = "Meh"
        else:
            self.mood = "Sad"

    def die(self):
        """Handle the pet's death."""
        self.is_alive = False
        self.mood = "Ghost"

    def reset(self):
        """Reset the pet to initial state."""
        self.health = 100
        self.happiness = 100
        self.hygiene = 100
        self.is_alive = True
        self.mood = "Happy"
        self.last_interaction_time = time.time()

class GameApp(tk.Tk):
    """The main application window for interacting with the Slimeogotchi pet."""
    def __init__(self):
        super().__init__()
        self.title("Slimeogotchi")
        self.geometry("400x600")
        self.resizable(False, False)
        self.channels = {}  # Dictionary to store channels

        
        pygame.mixer.init() # Initialize Pygame mixer for sound effects
        self.moving_right = True  # Control for pet animation direction

        # Core gameplay variables
        self.pet = Slimeogotchi()
        self.idle_time_limit = 10   # Seconds before the pet starts moving on its own
        self.animation_frames = {}

        # Get the directory where the script is located
        self.script_dir = os.path.dirname(os.path.abspath(__file__))

        # Control animation states
        self.animation_running = False
        self.animation_after_id = None

        # Load assets (images and sounds) and create the UI
        self.load_images()
        self.load_sounds()
        self.create_widgets()
        self.create_menu()
        self.update_gui()
        self.decrease_stats()
        self.animate_pet()

    def on_closing(self):
        """Handle window closing."""
        self.stop_all_sounds()
        pygame.mixer.quit()  # Quit pygame sound engine
        self.destroy()

    def load_images(self):
        """Load images and animations from the images folder."""
        self.animation_frames = {
            # Add various animations
            'idle': self.load_animation(['left1.png', 'left1.png', 'left2.png', 'left2.png', 'left1.png', 'left2.png', 'left2.png', 'right1.png', 'right1.png','right2.png','right1.png', 'right1.png', 'right2.png', 'right1.png']),
            'bounce': self.load_animation(['bounce1V2.png', 'bounce2V2.png', 'bounce3V2.png', 'bounce4V2.png']),
            'dance': self.load_animation(['music1.png', 'music2.png', 'music3.png', 'music1.png', 'music2.png', 'music3.png', 'music1.png', 'music2.png', 'music3.png', 'music1.png', 'music2.png', 'music3.png']),
            'love': self.load_animation(['heart1.png', 'heart2.png', 'heart3.png', 'heart1.png', 'heart2.png', 'heart3.png']),
            'ghost': self.load_animation(['ghost1.png', 'ghost2.png']),
            'eat': self.load_animation(['eat1.png', 'eat2.png', 'eat1.png', 'eat2.png', 'eat1.png', 'eat2.png', 'eat1.png', 'eat2.png']),
            'sleep': self.load_animation(['sleep1.png', 'sleep2.png', 'sleep3.png', 'sleep1.png', 'sleep2.png', 'sleep3.png', 'sleep1.png', 'sleep2.png', 'sleep3.png', 'sleep1.png', 'sleep2.png', 'sleep3.png']),
            'left': self.load_animation(['left1.png', 'left2.png']),
            'right': self.load_animation(['right1.png', 'right2.png']),
            'mad': self.load_animation(['mad1.png', 'mad2.png', 'mad_left1.png', 'mad_right2.png', 'mad1.png', 'mad2.png', 'mad_left1.png', 'mad_right2.png'])
        }

    def load_animation(self, filenames):
        """Load a sequence of images for an animation."""
        frames = []
        for filename in filenames:
            path = os.path.join(self.script_dir, 'images', filename)
            if os.path.exists(path):
                try:
                    # Resize and prepare the image for tkinter display
                    img = Image.open(path).resize((150, 150))
                    frames.append(ImageTk.PhotoImage(img))
                except Exception as e:
                    print(f"Error loading image {filename}: {e}")
            else:
                print(f"Image file not found: {path}")
        return frames

    def load_sounds(self):
        """Load sound effects and assign them to different channels."""
        pygame.mixer.set_num_channels(9)
        self.sounds = {}
        self.channels = {}
        sound_files = {
            'feed': 'eat-a-cracker-95783.mp3',
            'play': '90s-game-ui-11-185104.mp3',
            'clean': 'slime-squish-2-218566.mp3',
            'medicine': 'cute-level-up-2-189851.mp3',
            'sleep': 'pixel-sound-effect-5-103221.mp3',
            'click': 'mouse-click-sound-233951.mp3',
            'idle': '8bit-music-for-game-68698.mp3',
            'death': 'game-over-arcade-6435.mp3',
            'love': 'pixel-sound-effect-4-82881.mp3'
        }
        channel_index = 0
        for key, filename in sound_files.items():
            path = os.path.join(self.script_dir, 'sounds', filename)
            if os.path.exists(path):
                try:
                    sound = pygame.mixer.Sound(path)
                    self.sounds[key] = sound
                    self.channels[key] = pygame.mixer.Channel(channel_index)
                    channel_index += 1
                except Exception as e:
                    print(f"Error loading sound {filename}: {e}")
            else:
                print(f"Sound file not found: {path}")

    def stop_all_sounds(self):
        """Stop any currently playing sounds."""
        for channel in self.channels.values():
            channel.stop()

    def play_sound(self, sound_name):
        """Play the specified sound effect."""
        sound = self.sounds.get(sound_name)
        if sound:
            channel = self.channels.get(sound_name)
            if channel:
                channel.play(sound, loops=0)  # Play sound once
            else:
                print(f"No channel assigned for sound {sound_name}")
        else:
            print(f"Sound {sound_name} not found.")

    def reset_game(self):
        """Reset the game to its initial state, stopping any sounds."""
        self.stop_all_sounds()
        self.pet.reset()
        self.start_animation('idle')

    def create_widgets(self):
        """Create the GUI components."""
        # Create a canvas to display the pet's image
        self.canvas = tk.Canvas(self, width=500, height=225)
        self.canvas.pack()
        self.pet_image = self.canvas.create_image(250, 112, image=None)

        # Display mood
        self.mood_label = tk.Label(self, text=f"Mood: {self.pet.mood}", font=("Arial", 14))
        self.mood_label.pack(pady=5)

        # Health bar
        self.health_label = tk.Label(self, text="Health")
        self.health_label.pack()
        self.health_bar = ttk.Progressbar(self, orient="horizontal", length=300, mode="determinate")
        self.health_bar.pack()
        self.health_value_label = tk.Label(self, text=f"{self.pet.health}/100")
        self.health_value_label.pack()

        # Happiness bar
        self.happiness_label = tk.Label(self, text="Happiness")
        self.happiness_label.pack()
        self.happiness_bar = ttk.Progressbar(self, orient="horizontal", length=300, mode="determinate")
        self.happiness_bar.pack()
        self.happiness_value_label = tk.Label(self, text=f"{self.pet.happiness}/100")
        self.happiness_value_label.pack()

        # Hygiene bar
        self.hygiene_label = tk.Label(self, text="Hygiene")
        self.hygiene_label.pack()
        self.hygiene_bar = ttk.Progressbar(self, orient="horizontal", length=300, mode="determinate")
        self.hygiene_bar.pack()
        self.hygiene_value_label = tk.Label(self, text=f"{self.pet.hygiene}/100")
        self.hygiene_value_label.pack()

        # Buttons for actions
        self.buttons_frame = tk.Frame(self)
        self.buttons_frame.pack(pady=10)

        self.feed_button = tk.Button(self.buttons_frame, text="Feed", command=self.feed_pet)
        self.feed_button.grid(row=0, column=0, padx=5)

        self.sleep_button = tk.Button(self.buttons_frame, text="Sleep", command=self.sleep_pet)
        self.sleep_button.grid(row=0, column=1, padx=5)

        self.play_button = tk.Button(self.buttons_frame, text="Play", command=self.play_pet)
        self.play_button.grid(row=0, column=2, padx=5)

        self.clean_button = tk.Button(self.buttons_frame, text="Clean", command=self.clean_pet)
        self.clean_button.grid(row=1, column=0, padx=5, pady=5)

        self.medicine_button = tk.Button(self.buttons_frame, text="Medicine", command=self.give_medicine)
        self.medicine_button.grid(row=1, column=2, padx=5, pady=5)
        
        self.love_button = tk.Button(self.buttons_frame, text="Send Love", command=self.love_pet)
        self.love_button.grid(row=1, column=1, padx=5, pady=5)

        # Reset button for restarting the game
        self.reset_button = tk.Button(self, text="Reset", command=self.reset_game)

    def create_menu(self):
        """Create the menu bar with a Help option."""
        menu_bar = tk.Menu(self)
        self.config(menu=menu_bar)
        help_menu = tk.Menu(menu_bar, tearoff=0)
        menu_bar.add_cascade(label="Help", menu=help_menu)
        help_menu.add_command(label="Instructions", command=self.show_instructions)

    def show_instructions(self):
        """Display instructions for how to play the game."""
        instruction_text = (
            "Welcome to Slimeogotchi!\n\n"
            "Interact with your virtual pet to keep it healthy and happy. Here are some actions you can take:\n"
            "- Feed: Increases health.\n"
            "- Sleep: Increases health and happiness.\n"
            "- Play: Increases happiness but reduces health slightly.\n"
            "- Clean: Increases hygiene.\n"
            "- Give Medicine: Heals the pet when it's sick.\n"
            "- Send Love: Increases happiness.\n\n"
            "Make sure to care for your pet regularly to keep it alive!"
        )
        popup = tk.Toplevel(self)
        tk.Label(popup, text=instruction_text, justify='left').pack(padx=10, pady=10)
        tk.Button(popup, text="OK", command=popup.destroy).pack(pady=10)

    # Pet interaction methods
    def feed_pet(self):
        """Handle feeding the pet."""
        self.pet.feed()
        self.start_animation('eat')
        self.play_sound('feed')
        self.pet.last_interaction_time = time.time()

    def sleep_pet(self):
        """Handle pet sleeping."""
        self.pet.sleep()
        self.start_animation('sleep')
        self.play_sound('sleep')
        self.pet.last_interaction_time = time.time()

    def play_pet(self):
        """Handle playing with the pet."""
        self.pet.play()
        self.start_animation('dance')
        self.play_sound('play')
        self.pet.last_interaction_time = time.time()

    def clean_pet(self):
        """Handle cleaning the pet."""
        self.pet.clean()
        self.start_animation('bounce')
        self.play_sound('clean')
        self.pet.last_interaction_time = time.time()

    def give_medicine(self):
        """Handle giving medicine to the pet."""
        self.pet.give_medicine()
        self.start_animation('mad')
        self.play_sound('medicine')
        self.pet.last_interaction_time = time.time()

    def love_pet(self):
        """Handle the 'send love' action."""
        self.pet.send_love()
        self.start_animation('love')
        self.play_sound('love')
        self.pet.last_interaction_time = time.time()

    def decrease_stats(self):
        """Decrease pet's stats and schedule the next decrease."""
        self.pet.decrease_stats()
        self.after(3000, self.decrease_stats)  # decrease stats every 3 seconds

    def scoot_pet(self):
        """Move the pet around the canvas, changing direction at the edges."""
        current_x, current_y = self.canvas.coords(self.pet_image)
        canvas_width = self.canvas.winfo_width()

        sprite_width = 83

        # Pet moves to the right or left based on current direction
        if self.moving_right:
            new_x = current_x + 15
        else:
            new_x = current_x - 15

        left_boundary = sprite_width / 2
        right_boundary = canvas_width - sprite_width / 2

        # Change direction when reaching the edge
        if new_x <= left_boundary:
            new_x = left_boundary
            self.moving_right = True
        elif new_x >= right_boundary:
            new_x = right_boundary
            self.moving_right = False

        self.canvas.coords(self.pet_image, new_x, current_y)

    def update_gui(self):
        """Update the GUI with the pet's current state and stats."""
        if self.pet.is_alive:
            # Update stat bars and labels
            self.health_bar['value'] = self.pet.health
            self.happiness_bar['value'] = self.pet.happiness
            self.hygiene_bar['value'] = self.pet.hygiene

            self.health_value_label.config(text=f"{self.pet.health}/100")
            self.happiness_value_label.config(text=f"{self.pet.happiness}/100")
            self.hygiene_value_label.config(text=f"{self.pet.hygiene}/100")

            self.mood_label.config(text=f"Mood: {self.pet.mood}")

            # Enable buttons and hide the reset button
            self.enable_buttons()
            self.reset_button.pack_forget()

            current_time = time.time()
            # If the pet has been idle too long, make it scoot
            if current_time - self.pet.last_interaction_time > self.idle_time_limit:
                self.scoot_pet()
                self.pet.last_interaction_time = current_time

        else:
            # Display ghost animation when the pet dies
            self.start_animation('ghost')
            self.disable_buttons()
            self.reset_button.pack(pady=10)

        self.after(1000, self.update_gui)

    def reset_game(self):
        """Reset the game to initial state."""
        self.pet.reset()
        self.reset_button.pack_forget()
        self.start_animation('idle')

    def animate_pet(self):
        """Handle pet animation frames."""
        if self.pet.is_alive:
            # Ensure the idle animation is running when no other action is happening
            if not self.animation_running:
                self.start_animation('idle')
        self.after(100, self.animate_pet)

    def start_animation(self, animation_name):
        """Start the specified animation, then return to idle after it finishes."""
        if self.animation_after_id:
            self.after_cancel(self.animation_after_id)
            self.animation_running = False

        self.current_animation = animation_name
        frames = self.animation_frames.get(animation_name, [])
        if frames:
            self.animation_running = True
            self.disable_buttons()
            self.show_animation(frames, callback=self.start_idle_animation)
        else:
            print(f"No frames found for animation: {animation_name}")

    def show_animation(self, frames, index=0, callback=None):
        """Display the frames of an animation and revert to idle after the action finishes."""
        if self.pet.is_alive or self.current_animation == 'ghost':
            frame = frames[index]
            self.canvas.itemconfig(self.pet_image, image=frame)
            index = (index + 1) % len(frames)

            # Loop through the frames and call the callback when done
            if index == 0 and callback:
                self.animation_after_id = self.after(200, callback)
            else:
                self.animation_after_id = self.after(200, self.show_animation, frames, index, callback)
        else:
            self.animation_running = False

    def start_idle_animation(self):
        """Return to the idle animation when no other actions are happening."""
        if not self.pet.is_alive:
            # Keeps showing ghost animation if pet is not alive
            self.current_animation = 'ghost'
            ghost_frames = self.animation_frames.get('ghost', [])
            self.show_animation(ghost_frames)
        else:
            # Regular idle animation
            idle_frames = self.animation_frames.get('idle', [])
            if idle_frames:
                self.animation_running = True
                self.show_animation(idle_frames)
                self.enable_buttons()


    def disable_buttons(self):
        """Disable all action buttons."""
        self.feed_button.config(state="disabled")
        self.sleep_button.config(state="disabled")
        self.play_button.config(state="disabled")
        self.clean_button.config(state="disabled")
        self.medicine_button.config(state="disabled")
        self.love_button.config(state="disabled")

    def enable_buttons(self):
        """Enable all action buttons."""
        self.feed_button.config(state="normal")
        self.sleep_button.config(state="normal")
        self.play_button.config(state="normal")
        self.clean_button.config(state="normal")
        self.medicine_button.config(state="normal")
        self.love_button.config(state="normal")


# Main entry point to start the application
if __name__ == "__main__":
    print("Creating app instance")
    app = GameApp() # Instantiate the app
    print("Setting protocol")
    app.protocol("WM_DELETE_WINDOW", app.on_closing)  # Handle window closing event
    app.mainloop() # Start the main loop