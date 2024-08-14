export default function Listing({ listing }) {
  return (
    <div className="container">
      <h1>{listing.name}</h1>
      <img 
        src={listing.image} 
        alt={listing.name} 
        style={{
          width: '60%', 
          height: 'auto', 
          borderRadius: '12px', 
          margin: '20px auto', 
          display: 'block'
        }} 
      />
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p>Description: {listing.description}</p>
        <p>Amenities: {listing.amenities.join(', ')}</p>
        <button style={{ marginTop: '10px' }}>Book Now</button>
      </div>
    </div>
  );
}

export async function getStaticPaths() {
  const paths = [1, 2, 3].map((id) => ({ params: { id: id.toString() } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const listings = [
    { id: 1, name: 'Cozy Cabin in the Woods', image: '/images/cabin.jpg', description: 'A peaceful retreat in the woods.', amenities: ['Fireplace', 'Wi-Fi'] },
    { id: 2, name: 'Modern City Apartment', image: '/images/city-apartment.jpg', description: 'A sleek apartment in the heart of the city.', amenities: ['Gym', 'High-Speed Internet'] },
    { id: 3, name: 'Beachside Bungalow', image: '/images/beach-bungalow.jpg', description: 'A relaxing bungalow by the beach.', amenities: ['Ocean View', 'Wi-Fi'] },
  ];

  const listing = listings.find((listing) => listing.id.toString() === params.id);

  return { props: { listing } };
}
