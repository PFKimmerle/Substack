"""BMO Desktop Pet"""
import os
import random
import tkinter as tk
from PIL import Image, ImageTk, ImageDraw

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(BASE_DIR, "assets")

PET_HEIGHT = 75
BUBBLE_HEIGHT = 30

MAGENTA = (255, 0, 255, 255)


def clean_and_load(name, flip=False, height=PET_HEIGHT):
    path = os.path.join(ASSETS, name)
    if not os.path.exists(path):
        return None
    img = Image.open(path).convert("RGBA")

    # pre-shrink to speed up flood fill
    if img.height > height * 4:
        pre_h = height * 4
        pre_w = int(img.width * (pre_h / img.height))
        img = img.resize((pre_w, pre_h), Image.NEAREST)

    # flood fill corners to remove background
    corners = [(0, 0), (img.width - 1, 0),
               (0, img.height - 1), (img.width - 1, img.height - 1)]
    for corner in corners:
        ImageDraw.floodfill(img, corner, (0, 0, 0, 0), thresh=50)

    # kill semi-transparent edge pixels (pink fringe fix)
    r, g, b, a = img.split()
    a = a.point(lambda p: 255 if p >= 128 else 0)
    img = Image.merge("RGBA", (r, g, b, a))

    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    scale = height / img.height
    new_w = int(img.width * scale)
    img = img.resize((new_w, height), Image.NEAREST)

    if flip:
        img = img.transpose(Image.FLIP_LEFT_RIGHT)

    # magenta bg = window transparency color
    bg = Image.new("RGBA", img.size, MAGENTA)
    bg.paste(img, (0, 0), img)
    return ImageTk.PhotoImage(bg)


def make_placeholder():
    img = Image.new("RGBA", (80, 100), (0, 0, 0, 0))
    for x in range(10, 70):
        for y in range(10, 90):
            img.putpixel((x, y), (0, 200, 150, 255))
    return ImageTk.PhotoImage(img)


class BMOPet:
    def __init__(self, root):
        self.root = root

        r0 = clean_and_load("smile_walk_right0.png")
        r1 = clean_and_load("smile_walk_right_1.png")
        r2 = clean_and_load("smile_walk__right2.png")
        self.body_front = r0
        self.walk_r = [r0, r1, r2]
        self.walk_l = [clean_and_load("smile_walk_right0.png", flip=True),
                       clean_and_load("smile_walk_right_1.png", flip=True),
                       clean_and_load("smile_walk__right2.png", flip=True)]

        self.walk_r = [f for f in self.walk_r if f]
        self.walk_l = [f for f in self.walk_l if f]

        if not self.body_front:
            self.body_front = make_placeholder()

        self.faces = []
        self.current_face = None

        bubble_names = ["bubble_finn.png", "bubble_jake.png",
                        "bubble_bmo.png", "bubble_lsp.png",
                        "bubble_marceline.png", "bubble_pb.png",
                        "bubble_gunter.png", "bubble_peppermint.png"]
        self.bubbles_r = []
        self.bubbles_l = []
        for n in bubble_names:
            r = clean_and_load(n, height=BUBBLE_HEIGHT)
            l = clean_and_load(n, height=BUBBLE_HEIGHT, flip=True)
            if r and l:
                self.bubbles_r.append(r)
                self.bubbles_l.append(l)
        self.current_bubble = None
        self.facing = "right"

        self.state = "idle"
        self.frame_idx = 0
        self.state_timer = 0
        self.state_duration = random.randint(30, 80)
        self.ticks = 0
        self.speed = 1

        self.screen_w = root.winfo_screenwidth()
        self.screen_h = root.winfo_screenheight() - 50
        self.x = self.screen_w // 2
        self.y = self.screen_h - 80

        root.overrideredirect(True)
        root.attributes("-topmost", True)
        root.config(bg="magenta")
        root.wm_attributes("-transparentcolor", "magenta")

        self.canvas = tk.Canvas(root, width=170, height=130,
                                bg="magenta", highlightthickness=0)
        self.canvas.pack()

        self.body_item = self.canvas.create_image(85, 95,
                                                  image=self.body_front)
        if self.current_face:
            self.face_item = self.canvas.create_image(85, 85,
                                                      image=self.current_face)
        else:
            self.face_item = None
        self.bubble_item = self.canvas.create_image(145, 60, image="")

        self.drag_x = 0
        self.drag_y = 0
        self.canvas.bind("<ButtonPress-1>", self.start_drag)
        self.canvas.bind("<B1-Motion>", self.do_drag)

        root.geometry(f"+{self.x}+{self.y}")
        self.update()

    def start_drag(self, event):
        self.drag_x = event.x
        self.drag_y = event.y

    def do_drag(self, event):
        self.x = self.root.winfo_x() + (event.x - self.drag_x)
        self.y = self.root.winfo_y() + (event.y - self.drag_y)
        self.root.geometry(f"+{self.x}+{self.y}")

    def update(self):
        self.state_timer += 1
        self.ticks += 1

        if self.state_timer > self.state_duration:
            self.state_timer = 0
            self.state_duration = random.randint(30, 80)
            self.state = random.choice(["idle", "idle",
                                        "walk_left", "walk_right"])

        if self.faces and random.random() < 0.03:
            self.current_face = random.choice(self.faces)
            if self.face_item:
                self.canvas.itemconfig(self.face_item,
                                       image=self.current_face)

        if self.state == "walk_right":
            self.facing = "right"
        elif self.state == "walk_left":
            self.facing = "left"

        # bubble toggle
        if self.bubbles_r and self.ticks > 15 and random.random() < 0.05:
            if self.current_bubble is None:
                idx = random.randrange(len(self.bubbles_r))
                if self.facing == "right":
                    self.current_bubble = self.bubbles_r[idx]
                    self.canvas.coords(self.bubble_item, 145, 60)
                else:
                    self.current_bubble = self.bubbles_l[idx]
                    self.canvas.coords(self.bubble_item, 25, 60)
            else:
                self.current_bubble = None
            self.canvas.itemconfig(self.bubble_item,
                                   image=self.current_bubble or "")

        if self.state == "walk_right" and self.walk_r:
            self.x += self.speed
            self.frame_idx = (self.frame_idx + 1) % len(self.walk_r)
            self.canvas.itemconfig(self.body_item,
                                   image=self.walk_r[self.frame_idx])
        elif self.state == "walk_left" and self.walk_l:
            self.x -= self.speed
            self.frame_idx = (self.frame_idx + 1) % len(self.walk_l)
            self.canvas.itemconfig(self.body_item,
                                   image=self.walk_l[self.frame_idx])
        else:
            self.canvas.itemconfig(self.body_item, image=self.body_front)

        # bounce off screen edges, flip bubble to match
        if self.x <= 0:
            self.x = 0
            self.state = "walk_right"
            self.facing = "right"
            if self.current_bubble is not None:
                idx = self.bubbles_l.index(self.current_bubble) if self.current_bubble in self.bubbles_l else -1
                if idx >= 0:
                    self.current_bubble = self.bubbles_r[idx]
                self.canvas.coords(self.bubble_item, 145, 60)
                self.canvas.itemconfig(self.bubble_item,
                                       image=self.current_bubble)
        elif self.x >= self.screen_w - 170:
            self.x = self.screen_w - 170
            self.state = "walk_left"
            self.facing = "left"
            if self.current_bubble is not None:
                idx = self.bubbles_r.index(self.current_bubble) if self.current_bubble in self.bubbles_r else -1
                if idx >= 0:
                    self.current_bubble = self.bubbles_l[idx]
                self.canvas.coords(self.bubble_item, 25, 60)
                self.canvas.itemconfig(self.bubble_item,
                                       image=self.current_bubble)

        self.root.geometry(f"+{self.x}+{self.y}")
        self.root.after(120, self.update)


if __name__ == "__main__":
    root = tk.Tk()
    pet = BMOPet(root)
    root.mainloop()
