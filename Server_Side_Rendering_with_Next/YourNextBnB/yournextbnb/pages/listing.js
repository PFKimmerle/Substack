import Link from 'next/link';

const listings = [
  { id: 1, name: 'Cozy Cabin in the Woods', image: '/images/cabin.jpg' },
  { id: 2, name: 'Modern City Apartment', image: '/images/city-apartment.jpg' },
  { id: 3, name: 'Beachside Bungalow', image: '/images/beach-bungalow.jpg' },
];

export default function Listings() {
  return (
    <div className="container">
      <h1>Our Listings</h1>
      <div className="listings-grid">
        {listings.map((listing) => (
          <div key={listing.id} className="listing-item">
            <Link href={`/listing/${listing.id}`}>
              <div>
                <img src={listing.image} alt={listing.name} />
                <h2>{listing.name}</h2>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
