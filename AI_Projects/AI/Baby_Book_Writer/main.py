#!/usr/bin/env python3
"""Baby Book Writer - Generate baby board books with AI."""

import argparse
import json
import os
from generator import generate_book_content, save_image_prompts, TOPICS
from pdf_builder import build_pdf, build_prompts_only_pdf

AUTHOR = "Your Name"

def main():
    parser = argparse.ArgumentParser(description="Generate baby board books")
    parser.add_argument("command", choices=["generate", "build-pdf"],
                       help="generate: create content & prompts, build-pdf: create final PDF")
    parser.add_argument("--topic", choices=TOPICS,
                       help=f"Book topic: {', '.join(TOPICS)}")
    parser.add_argument("--pages", type=int, default=12,
                       help="Number of pages (default: 12)")

    args = parser.parse_args()

    if args.command == "generate":
        if not args.topic:
            print(f"Available topics: {', '.join(TOPICS)}")
            args.topic = input("Choose topic: ").strip().lower()
            if args.topic not in TOPICS:
                print(f"Error: Invalid topic. Choose from: {TOPICS}")
                return

        # Topic-based output folder
        output_dir = os.path.join("output", args.topic)
        print(f"\nGenerating {args.pages}-page book about '{args.topic}'...")

        # Generate content
        pages = generate_book_content(args.topic, args.pages)
        print(f"Generated {len(pages)} pages")

        # Create output directories
        os.makedirs(output_dir, exist_ok=True)
        prompts_dir = os.path.join(output_dir, "image-prompts")
        images_dir = os.path.join(output_dir, "images")
        os.makedirs(images_dir, exist_ok=True)

        # Save content
        content_path = os.path.join(output_dir, "content.json")
        with open(content_path, "w") as f:
            json.dump({"topic": args.topic, "pages": pages}, f, indent=2)
        print(f"Saved content to: {content_path}")

        # Save image prompts (including cover and back cover)
        save_image_prompts(pages, prompts_dir, args.topic)
        print(f"Saved image prompts to: {prompts_dir}/")

        # Build preview PDF
        title = args.topic.capitalize()
        preview_path = os.path.join(output_dir, f"{args.topic}_preview.pdf")
        build_prompts_only_pdf(pages, preview_path, title)
        print(f"Created preview PDF: {preview_path}")

        print(f"\nNext steps:")
        print(f"1. Open {prompts_dir}/ and use prompts with your image generator")
        print(f"2. Save content images as page_01.png, page_02.png, etc. in {images_dir}/")
        print(f"3. Create book_cover.png and back_cover.png in {images_dir}/")
        print(f"4. Run: python main.py build-pdf --topic {args.topic}")

    elif args.command == "build-pdf":
        if not args.topic:
            print(f"Available topics: {', '.join(TOPICS)}")
            args.topic = input("Choose topic: ").strip().lower()

        output_dir = os.path.join("output", args.topic)
        content_path = os.path.join(output_dir, "content.json")

        if not os.path.exists(content_path):
            print(f"Error: No content.json found in {output_dir}/")
            print("Run 'generate' command first.")
            return

        with open(content_path) as f:
            data = json.load(f)

        pages = data["pages"]
        topic = data["topic"]
        title = topic.capitalize()
        images_dir = os.path.join(output_dir, "images")
        output_pdf = os.path.join(output_dir, f"{topic}_book.pdf")

        print(f"Building PDF from {len(pages)} pages...")
        build_pdf(pages, images_dir, output_pdf, title, AUTHOR)
        print(f"Created: {output_pdf}")

if __name__ == "__main__":
    main()
