# server/indexer.py
import os
from pathlib import Path
from langchain_community.document_loaders import (
    PyPDFLoader, TextLoader, UnstructuredMarkdownLoader, UnstructuredHTMLLoader
)
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import FAISS

DOCS_DIR = Path("knowledge_base")
INDEX_DIR = Path("index")
EMBED_MODEL = "nomic-embed-text"

def load_documents():
    docs = []
    for p in DOCS_DIR.rglob("*"):
        if p.is_dir():
            continue
        try:
            if p.suffix.lower() == ".pdf":
                docs += PyPDFLoader(str(p)).load()
            elif p.suffix.lower() in {".md", ".markdown"}:
                docs += UnstructuredMarkdownLoader(str(p)).load()
            elif p.suffix.lower() == ".txt":
                docs += TextLoader(str(p), encoding="utf-8").load()
            elif p.suffix.lower() in {".htm", ".html"}:
                docs += UnstructuredHTMLLoader(str(p)).load()
        except Exception as e:
            print(f"[WARN] Skipping {p.name}: {e}")
    return docs

def build_index():
    print("[INFO] Loading docs from knowledge_base/...")
    docs = load_documents()
    if not docs:
        print("[ERROR] No docs found. Add files to knowledge_base/ folder.")
        return
    print(f"[OK] Loaded {len(docs)} documents")

    print("[INFO] Splitting into chunks...")
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents(docs)
    print(f"[OK] Created {len(chunks)} chunks")

    print(f"[INFO] Creating embeddings ({len(chunks)} chunks, ~1-2 min)...")
    embeddings = OllamaEmbeddings(model=EMBED_MODEL)

    print("Testing embedding model...")
    test = embeddings.embed_query("test")
    print(f"[OK] Model OK (vector dim: {len(test)})")

    print("[INFO] Building FAISS index (processing chunks)...")
    vs = FAISS.from_documents(chunks, embeddings)
    print("[OK] Index built")

    print(f"[INFO] Saving to {INDEX_DIR}/...")
    INDEX_DIR.mkdir(exist_ok=True)
    vs.save_local(str(INDEX_DIR))
    print(f"[OK] Saved! Files: {[f.name for f in INDEX_DIR.glob('*')]}")
    print("\n[DONE] Indexing complete! Run main.py to use.")

if __name__ == "__main__":
    build_index()
