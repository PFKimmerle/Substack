import { useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import bobaCatImg from '../assets/boba-cat.png';
import cloudImg from '../assets/cloud.png';
import unicornImg from '../assets/unicorn.png';

const PRODUCTS = [
    {
        id: 1,
        name: 'Boba Tea Cat',
        price: 4.99,
        image: bobaCatImg,
    },
    {
        id: 2,
        name: 'Happy Cloud',
        price: 3.99,
        image: cloudImg,
    },
    {
        id: 3,
        name: 'Sparkle Unicorn',
        price: 5.99,
        image: unicornImg,
    },
    {
        id: 4,
        name: 'Boba Cat (Holo)',
        price: 6.99,
        image: bobaCatImg,
    },
];

export const Products = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes('@')) {
            setStatus('error');
            return;
        }
        setStatus('success');
        setEmail('');
        alert('Welcome to the Cuteness Club! 💖');
    };

    return (
        <div className="pt-20">
            <section className="container mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-4xl font-black text-kawaii-text tracking-tight">FRESH DROPS</h2>
                    <div className="h-2 flex-1 bg-kawaii-pink/20 ml-8 rounded-full" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {PRODUCTS.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>

            <section className="bg-gradient-to-r from-kawaii-yellow via-kawaii-pink via-purple-300 to-kawaii-blue py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-md">
                        JOIN THE CUTENESS CLUB
                    </h2>
                    <p className="text-xl text-white mb-8 max-w-4xl mx-auto font-medium">
                        Sign up for our newsletter and get 10% off your first order of adorable things.
                    </p>
                    <form onSubmit={handleSubmit} className="flex max-w-md mx-auto gap-4 flex-col sm:flex-row">
                        <div className="flex-1 flex flex-col gap-2">
                            <input
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setStatus('idle');
                                }}
                                className={`w-full bg-white/90 backdrop-blur-md border rounded-full px-6 py-3 text-kawaii-text placeholder:text-gray-400 focus:outline-none focus:bg-white shadow-lg ${status === 'error' ? 'border-red-400' : 'border-white/50'}`}
                                aria-label="Email address for newsletter"
                            />
                            {status === 'error' && (
                                <span className="text-red-500 text-sm font-bold bg-white/80 px-3 py-1 rounded-full self-start">
                                    Please enter a valid email!
                                </span>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="bg-white text-kawaii-pink px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-lg h-fit whitespace-nowrap hover:bg-gray-50"
                        >
                            SUBMIT
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
};
