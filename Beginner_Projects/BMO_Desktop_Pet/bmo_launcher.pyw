"""BMO Desktop Pet Launcher"""
import tkinter as tk
from tkinter import ttk
import subprocess
import os

class BMOLauncher:
    def __init__(self):
        self.process = None
        self.is_running = False

        self.root = tk.Tk()
        self.root.title("BMO Pet")
        self.root.geometry("250x120")
        self.root.resizable(False, False)
        self.root.configure(bg="#f0f0f0")

        style = ttk.Style()
        style.theme_use("clam")
        style.configure("Toggle.TButton",
                        font=("Segoe UI", 11),
                        padding=(20, 10))

        self.root.update_idletasks()
        x = (self.root.winfo_screenwidth() - 250) // 2
        y = (self.root.winfo_screenheight() - 120) // 2
        self.root.geometry(f"250x120+{x}+{y}")

        frame = ttk.Frame(self.root, padding=15)
        frame.pack(fill=tk.BOTH, expand=True)

        self.status_label = tk.Label(
            frame, text="Stopped",
            font=("Segoe UI", 12),
            fg="#888888", bg="#f0f0f0"
        )
        self.status_label.pack(pady=(0, 15))

        self.toggle_btn = ttk.Button(
            frame, text="Start BMO",
            command=self.toggle,
            style="Toggle.TButton", width=15
        )
        self.toggle_btn.pack()

        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

        self.script_dir = os.path.dirname(os.path.abspath(__file__))
        self.pet_script = os.path.join(self.script_dir, "bmo_pet.pyw")

        venv_pythonw = os.path.join(self.script_dir, ".venv",
                                    "Scripts", "pythonw.exe")
        if os.path.exists(venv_pythonw):
            self.pythonw = venv_pythonw
        else:
            self.pythonw = "pythonw"

    def toggle(self):
        if self.is_running:
            self.stop_pet()
        else:
            self.start_pet()

    def start_pet(self):
        if self.process is None or self.process.poll() is not None:
            try:
                self.process = subprocess.Popen(
                    [self.pythonw, self.pet_script],
                    cwd=self.script_dir,
                    creationflags=subprocess.CREATE_NO_WINDOW
                )
                self.is_running = True
                self.status_label.config(text="Running", fg="#2e7d32")
                self.toggle_btn.config(text="Stop BMO")
            except Exception:
                self.status_label.config(text="Error", fg="#c62828")

    def stop_pet(self):
        if self.process is not None:
            try:
                self.process.terminate()
                self.process.wait(timeout=2)
            except Exception:
                self.process.kill()
            self.process = None
        self.is_running = False
        self.status_label.config(text="Stopped", fg="#888888")
        self.toggle_btn.config(text="Start BMO")

    def on_close(self):
        self.stop_pet()
        self.root.destroy()

    def run(self):
        self.root.mainloop()


if __name__ == "__main__":
    app = BMOLauncher()
    app.run()
