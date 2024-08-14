import Link from 'next/link';

export default function Home() {
  return (
    <div className="container">
      <div className="hero">
        <h1>Welcome to YourNextBnB</h1>
      </div>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p>Your home away from home.</p>
        <Link href="/listing">
          <button>View Listings</button>
        </Link>
        <Link href="/about" style={{ marginLeft: '10px' }}>
          <button>About Us</button>
        </Link>
      </div>
    </div>
  );
}
