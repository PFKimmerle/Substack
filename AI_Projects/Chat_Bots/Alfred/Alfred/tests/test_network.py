#!/usr/bin/env python3
"""
DuckDuckGo network diagnostic test.
Run with: python tests/test_network.py

Run from Alfred root directory.
"""

print("=" * 80)
print("DUCKDUCKGO NETWORK DIAGNOSTIC TEST (DDGS VERSION)")
print("=" * 80)
print()

# Test 1: Check if NEW package is installed
print("[1/5] Checking if ddgs (new package) is installed...")
try:
    from ddgs import DDGS
    print("      [OK] NEW package (ddgs) found - GOOD!")
except ImportError:
    print("      [FAIL] NEW package (ddgs) NOT found")
    print("      Run: pip install ddgs")
    exit(1)

# Test 1b: Check if OLD package is still installed (should uninstall)
print("\n[2/5] Checking if old duckduckgo-search is still installed...")
try:
    import duckduckgo_search
    print("      [WARN] OLD package still installed - should uninstall it")
    print("      Run: pip uninstall duckduckgo-search -y")
    print("      (It may cause conflicts)")
except ImportError:
    print("      [OK] OLD package not found - GOOD!")

# Test 2: Try a simple search with NEW package
print("\n[3/5] Testing basic DuckDuckGo search with NEW package...")
print("      Query: 'test query'")
try:
    with DDGS() as ddgs:
        results = list(ddgs.text("test query", max_results=2))
        if results:
            print(f"      [OK] SUCCESS: Got {len(results)} results")
            print(f"      First result: {results[0]['title'][:60]}")
        else:
            print("      [FAIL] No results returned")
            print("      DuckDuckGo may be blocking your IP or rate-limiting you")
except Exception as e:
    print(f"      [FAIL] ERROR: {type(e).__name__}")
    print(f"      {str(e)[:150]}")
    print("\n      This means DuckDuckGo is not accessible from your network.")

# Test 3: Try a Python-specific search
print("\n[4/5] Testing Python search with site hint...")
print("      Query: 'latest python version site:python.org'")
try:
    with DDGS() as ddgs:
        results = list(ddgs.text("latest python version site:python.org", max_results=2))
        if results:
            print(f"      [OK] SUCCESS: Got {len(results)} results")
            for i, r in enumerate(results[:2], 1):
                print(f"      [{i}] {r['title'][:60]}")
                print(f"          {r['url']}")
        else:
            print("      [FAIL] No results")
except Exception as e:
    print(f"      [FAIL] ERROR: {type(e).__name__}")
    print(f"      {str(e)[:150]}")

# Test 4: Try fetching a direct URL
print("\n[5/5] Testing direct URL fetch (no search)...")
print("      URL: https://www.python.org")
try:
    import requests
    r = requests.get("https://www.python.org", timeout=10)
    if r.status_code == 200:
        print(f"      [OK] SUCCESS: Got {len(r.text)} bytes")
    else:
        print(f"      [WARN] Got status code {r.status_code}")
except Exception as e:
    print(f"      [FAIL] {type(e).__name__}")

# Summary
print("\n" + "=" * 80)
print("DIAGNOSIS")
print("=" * 80)
print()

# Check what happened
print("What to do based on your results:\n")

print("[OK] If tests 3-4 PASSED:")
print("  --> DuckDuckGo works! Your search service should work correctly.")
print()

print("[FAIL] If test 3 FAILED but test 5 PASSED:")
print("  --> DuckDuckGo is blocked/rate-limited")
print("  --> Consider using a different search provider")
print()

print("[FAIL] If BOTH tests 3 and 5 FAILED:")
print("  --> Major network restriction")
print("  --> Check firewall, VPN, proxy settings")
print()
