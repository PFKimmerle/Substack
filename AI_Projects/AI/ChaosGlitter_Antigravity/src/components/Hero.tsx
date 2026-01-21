import { Link } from 'react-router-dom';

export const Hero = () => {
    return (
        <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-kawaii-white">
            {/* Background Effects */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-kawaii-pink/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-kawaii-yellow/30 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 text-center px-4">
                <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter text-kawaii-text">
                    <span className="block mb-2">STICKERS THAT</span>
                    <span className="text-kawaii-pink drop-shadow-sm">
                        SPARK JOY
                    </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-500 mb-8 max-w-4xl mx-auto">
                    Super cute vinyl stickers for your laptop, journal, and happy place.
                </p>
                <Link
                    to="/products"
                    className="bg-kawaii-pink text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-kawaii-yellow hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl inline-block"
                    aria-label="Shop the cuteness collection"
                >
                    SHOP THE CUTENESS
                </Link>
            </div>
        </div>
    );
};
