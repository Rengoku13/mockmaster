
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { X, Loader2, Mail, Lock, Github } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        console.log('Attempting auth...');
        console.log('Env URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);

        try {
            if (isLogin) {
                // Mock Login for Demo (if keys are missing or fails)
                const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL;

                if (isDemo) {
                    console.log('Running in Demo Mode');
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Fake delay
                    onLoginSuccess?.({ email: email || 'demo@mockmaster.com', id: 'demo-user' });
                    onClose();
                    return;
                }

                console.log('Calling Supabase SignIn...');
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) {
                    console.error('Supabase Error:', error);
                    throw error;
                }
                console.log('Supabase Success:', data);
                onClose();
            } else {
                const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL;
                if (isDemo) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    setMessage('Demo Account created! You can now Sign In.');
                    setIsLogin(true);
                    return;
                }

                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage('Check your email for the confirmation link!');
            }
        } catch (err: any) {
            console.error('Auth Exception:', err);
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-sm text-slate-400 mb-6">
                    {isLogin ? 'Sign in to access Pro features.' : 'Join MockMaster to save schemas and export CSVs.'}
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
                        {message}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-300">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-white focus:outline-none focus:border-indigo-500 transition"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-300">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-white focus:outline-none focus:border-indigo-500 transition"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-400">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline"
                    >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </div>
            </div>
        </div>
    );
}
