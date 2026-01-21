import { type ReactNode } from 'react';
import { Header } from './Header';
import { Cart } from './Cart';

interface LayoutProps {
    children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="min-h-screen bg-kawaii-white text-kawaii-text font-sans selection:bg-kawaii-pink selection:text-white">
            <Header />
            <Cart />
            <main className="pt-16">
                {children}
            </main>
            <footer className="bg-white py-8 text-center text-gray-400 border-t border-kawaii-pink/10">
                <p>© 2025 ChaosGlitter. Stay Cute.</p>
            </footer>
        </div>
    );
};
