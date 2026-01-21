import { Plus } from 'lucide-react';
import { type Product, useCart } from '../context/CartContext';

interface ProductCardProps {
    product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
    const { addToCart } = useCart();

    return (
        <div className="group relative bg-white border border-kawaii-pink/20 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-kawaii-pink/10 transition-all duration-300 hover:-translate-y-2">
            <div className="aspect-square overflow-hidden bg-gray-50 relative p-8 flex items-center justify-center">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-lg"
                />
                <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6 backdrop-blur-[2px]">
                    <button
                        onClick={() => addToCart(product)}
                        className="bg-kawaii-pink text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-kawaii-yellow transition-colors shadow-lg"
                        aria-label={`Add ${product.name} to cart`}
                    >
                        <Plus size={18} />
                        ADD TO CART
                    </button>
                </div>
            </div>

            <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-kawaii-text mb-1">{product.name}</h3>
                <p className="text-sm text-gray-400 mb-2">3 x 3 inches</p>
                <p className="text-kawaii-pink font-bold text-lg">${product.price.toFixed(2)}</p>
            </div>
        </div>
    );
};
