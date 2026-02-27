"""
Luna Desktop Pet Launcher
Simple Start/Stop GUI - double-click to run
"""
import tkinter as tk
from tkinter import ttk
import subprocess
import os

class LunaLauncher:
    def __init__(self):
        self.process = None
        self.is_running = False

        # Window setup
        self.root = tk.Tk()
        self.root.title("Luna Pet")
        self.root.geometry("250x120")
        self.root.resizable(False, False)
        self.root.configure(bg='#f0f0f0')

        # Modern theme
        style = ttk.Style()
        style.theme_use('clam')

        # Custom button style
        style.configure('Toggle.TButton',
                        font=('Segoe UI', 11),
                        padding=(20, 10))

        # Center window on screen
        self.root.update_idletasks()
        w, h = 250, 120
        x = (self.root.winfo_screenwidth() - w) // 2
        y = (self.root.winfo_screenheight() - h) // 2
        self.root.geometry(f"{w}x{h}+{x}+{y}")

        # Main frame with padding
        main_frame = ttk.Frame(self.root, padding=15)
        main_frame.pack(fill=tk.BOTH, expand=True)

        # Status label (colored)
        self.status_label = tk.Label(
            main_frame,
            text="Stopped",
            font=('Segoe UI', 12),
            fg='#888888',
            bg='#f0f0f0'
        )
        self.status_label.pack(pady=(0, 15))

        # Single toggle button
        self.toggle_btn = ttk.Button(
            main_frame,
            text="Start Luna",
            command=self.toggle_luna,
            style='Toggle.TButton',
            width=15
        )
        self.toggle_btn.pack()

        # Handle window close
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

        # Get the path to pets.py
        self.script_dir = os.path.dirname(os.path.abspath(__file__))
        self.pets_path = os.path.join(self.script_dir, "pets.py")

    def toggle_luna(self):
        if self.is_running:
            self.stop_luna()
        else:
            self.start_luna()

    def start_luna(self):
        if self.process is None or self.process.poll() is not None:
            try:
                pets_dir = os.path.dirname(self.pets_path)
                self.process = subprocess.Popen(
                    ["pythonw", self.pets_path],
                    cwd=pets_dir,
                    creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0
                )
                self.is_running = True
                self.status_label.config(text="Running", fg='#2e7d32')
                self.toggle_btn.config(text="Stop Luna")
            except Exception as e:
                self.status_label.config(text=f"Error", fg='#c62828')

    def stop_luna(self):
        if self.process is not None:
            try:
                self.process.terminate()
                self.process.wait(timeout=2)
            except:
                self.process.kill()
            self.process = None
        self.is_running = False
        self.status_label.config(text="Stopped", fg='#888888')
        self.toggle_btn.config(text="Start Luna")

    def on_close(self):
        self.stop_luna()
        self.root.destroy()

    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    app = LunaLauncher()
    app.run()
