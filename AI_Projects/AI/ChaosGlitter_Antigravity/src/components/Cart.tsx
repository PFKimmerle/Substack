import { X, Trash2, ArrowRight, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useEffect } from 'react';

export const Cart = () => {
    const { isOpen, toggleCart, items, removeFromCart, updateQuantity, total } = useCart();

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                toggleCart();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, toggleCart]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-kawaii-text/20 backdrop-blur-sm"
                onClick={toggleCart}
            />

            {/* Drawer */}
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white border-l border-kawaii-pink/20 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-6 border-b border-kawaii-pink/10 flex items-center justify-between bg-kawaii-pink/5">
                    <h2 className="text-2xl font-black text-kawaii-text">Your Stash</h2>
                    <button
                        onClick={toggleCart}
                        className="p-2 hover:bg-kawaii-pink/10 rounded-full transition-colors"
                        aria-label="Close cart"
                    >
                        <X className="w-6 h-6 text-kawaii-text" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {items.length === 0 ? (
                        <div className="text-center text-gray-400 mt-10">
                            <p>Your cart is empty.</p>
                            <p className="text-sm">Go add some cute stuff!</p>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="flex gap-4 bg-gray-50 p-4 rounded-2xl border border-kawaii-pink/10">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-20 h-20 object-contain rounded-xl bg-white"
                                />
                                <div className="flex-1">
                                    <h3 className="font-bold text-kawaii-text">{item.name}</h3>
                                    <p className="text-kawaii-pink font-bold">${item.price.toFixed(2)}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-3 bg-white rounded-full px-3 py-1 border border-kawaii-pink/20">
                                            <button
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="text-kawaii-text hover:text-kawaii-pink transition-colors disabled:opacity-50"
                                                disabled={item.quantity <= 1}
                                                aria-label="Decrease quantity"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="text-sm font-bold text-kawaii-text w-4 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="text-kawaii-text hover:text-kawaii-pink transition-colors"
                                                aria-label="Increase quantity"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-red-400 hover:text-red-500 transition-colors"
                                            aria-label="Remove item"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 border-t border-kawaii-pink/10 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-500">Total</span>
                        <span className="text-2xl font-black text-kawaii-text">${total.toFixed(2)}</span>
                    </div>
                    <button
                        disabled={items.length === 0}
                        className="w-full bg-kawaii-pink text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-kawaii-yellow transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        CHECKOUT <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};
