import { Link } from 'react-router-dom';

export const About = () => {
    return (
        <div className="pt-20">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-black text-kawaii-text mb-8 tracking-tight">
                        ABOUT <span className="text-kawaii-pink">CHAOS</span>
                    </h1>

                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-kawaii-pink/20 mb-12">
                        <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                            Welcome to ChaosGlitter, your one-stop shop for stickers that are equal parts cute and chaotic!
                            We believe that life is too short for boring surfaces.
                        </p>
                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            Our mission is simple: to spread joy, one sparkly sticker at a time. Whether you're a
                            journaling enthusiast, a laptop decorator, or just someone who likes collecting tiny
                            sticky art, we've got something to make you smile.
                        </p>
                        <div className="flex justify-center">
                            <Link
                                to="/products"
                                className="bg-kawaii-pink text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-kawaii-yellow hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl inline-block"
                            >
                                SHOP THE CUTENESS
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white/50 p-6 rounded-2xl backdrop-blur-sm h-full flex flex-col items-center text-center">
                            <div className="text-4xl mb-4">✨</div>
                            <h3 className="font-bold text-kawaii-text text-lg mb-2">Premium Quality</h3>
                            <p className="text-gray-500 leading-relaxed">Waterproof, weatherproof, and glitter-proof (okay, maybe not that last one).</p>
                        </div>
                        <div className="bg-white/50 p-6 rounded-2xl backdrop-blur-sm h-full flex flex-col items-center text-center">
                            <div className="text-4xl mb-4">🎨</div>
                            <h3 className="font-bold text-kawaii-text text-lg mb-2">Original Art</h3>
                            <p className="text-gray-500 leading-relaxed">Designed with love and a healthy dose of caffeine.</p>
                        </div>
                        <div className="bg-white/50 p-6 rounded-2xl backdrop-blur-sm h-full flex flex-col items-center text-center">
                            <div className="text-4xl mb-4">💖</div>
                            <h3 className="font-bold text-kawaii-text text-lg mb-2">Made with Love</h3>
                            <p className="text-gray-500 leading-relaxed">Every order is packed with care and good vibes.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
