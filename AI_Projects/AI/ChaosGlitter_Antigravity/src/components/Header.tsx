import { ShoppingBag, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export const Header = () => {
    const { toggleCart, items } = useCart();
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-kawaii-pink/20 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-2 hover:scale-105 transition-transform duration-300">
                        <Sparkles className="w-6 h-6 text-kawaii-pink animate-bounce" />
                        <h1 className="text-2xl font-black tracking-tight text-kawaii-text">
                            Chaos<span className="text-kawaii-pink">Glitter</span>
                        </h1>
                    </Link>

                    <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
                        <Link to="/products" className="font-bold text-kawaii-text hover:text-kawaii-pink transition-colors">Products</Link>
                        <Link to="/about" className="font-bold text-kawaii-text hover:text-kawaii-pink transition-colors">About</Link>
                    </nav>
                </div>

                <button
                    onClick={toggleCart}
                    className="relative p-2 hover:bg-kawaii-pink/10 rounded-full transition-colors group"
                    aria-label="Open cart"
                >
                    <ShoppingBag className="w-6 h-6 text-kawaii-text group-hover:text-kawaii-pink transition-colors" />
                    {itemCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-kawaii-yellow text-kawaii-text text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce shadow-sm">
                            {itemCount}
                        </span>
                    )}
                </button>
            </div>
        </header>
    );
};
