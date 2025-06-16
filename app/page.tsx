'use client';
import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '@/components/wallet-button';
import { useProgram } from '@/hooks/use-program';
import { motion } from 'framer-motion';
import { Sparkles, Users, Zap, Shield, ArrowRight, Star } from 'lucide-react';

export default function HomePage() {
    const { connected, publicKey } = useWallet();
    const { userProfile, appState, createUserProfile, initialize, loading } = useProgram();
    const [username, setUsername] = useState('');
    const [showCreateProfile, setShowCreateProfile] = useState(false);

    useEffect(() => {
        if (connected && !userProfile) {
            setShowCreateProfile(true);
        }
    }, [connected, userProfile]);

    const handleCreateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;
        
        try {
            await createUserProfile(username);
            setShowCreateProfile(false);
            setUsername('');
        } catch (error) {
            console.error('Error creating profile:', error);
        }
    };

    if (!connected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
                </div>

                {/* Navigation */}
                <nav className="relative z-10 bg-black/20 backdrop-blur-md border-b border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-2">
                                <Sparkles className="h-8 w-8 text-solana-purple" />
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent">
                                    Solana dApp
                                </h1>
                            </div>
                            <WalletButton />
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)]">
                    <div className="text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-8"
                        >
                            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold text-white leading-tight">
                                Welcome to{' '}
                                <span className="bg-gradient-to-r from-solana-purple via-solana-pink to-solana-green bg-clip-text text-transparent animate-pulse">
                                    Solana dApp
                                </span>
                            </h1>
                            
                            <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                                A custom Solana dApp generated for your prompt.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
                                <WalletButton />
                                <button className="btn-secondary group">
                                    Learn More
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>

                        {/* Feature Cards */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24"
                        >
                            <div className="card group hover:bg-white/15">
                                <Zap className="h-12 w-12 text-solana-green mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold text-white mb-2">Lightning Fast</h3>
                                <p className="text-gray-300">Built on Solana for instant transactions and low fees</p>
                            </div>
                            
                            <div className="card group hover:bg-white/15">
                                <Shield className="h-12 w-12 text-solana-purple mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold text-white mb-2">Secure & Reliable</h3>
                                <p className="text-gray-300">Enterprise-grade security with decentralized architecture</p>
                            </div>
                            
                            <div className="card group hover:bg-white/15">
                                <Users className="h-12 w-12 text-solana-pink mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold text-white mb-2">Community Driven</h3>
                                <p className="text-gray-300">Join thousands of users in our growing ecosystem</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
            {/* Navigation */}
            <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <Sparkles className="h-8 w-8 text-solana-purple" />
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent">
                                Solana dApp
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            {userProfile && (
                                <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-md">
                                    <Star className="h-4 w-4 text-yellow-400" />
                                    <span className="text-white font-medium">{userProfile.username}</span>
                                </div>
                            )}
                            <WalletButton />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {showCreateProfile ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md mx-auto"
                    >
                        <div className="card">
                            <div className="text-center mb-6">
                                <Sparkles className="h-12 w-12 text-solana-purple mx-auto mb-4" />
                                <h2 className="text-3xl font-bold text-white mb-2">Create Your Profile</h2>
                                <p className="text-gray-300">Join the community and get started</p>
                            </div>
                            
                            <form onSubmit={handleCreateProfile} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Choose a username
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="input-field"
                                        maxLength={50}
                                        required
                                    />
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={loading || !username.trim()}
                                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Creating Profile...</span>
                                        </div>
                                    ) : (
                                        'Create Profile'
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                ) : (
                    <div className="space-y-12">
                        {/* Dashboard Header */}
                        <div className="text-center">
                            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
                                Welcome Back!
                            </h2>
                            <p className="text-xl text-gray-300">
                                Ready to explore Solana dApp?
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="card text-center"
                            >
                                <Users className="h-8 w-8 text-solana-purple mx-auto mb-3" />
                                <h3 className="text-2xl font-bold text-white mb-1">
                                    {appState?.totalUsers?.toString() || '0'}
                                </h3>
                                <p className="text-gray-400">Total Users</p>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="card text-center"
                            >
                                <Zap className="h-8 w-8 text-solana-green mx-auto mb-3" />
                                <h3 className="text-2xl font-bold text-white mb-1">Fast</h3>
                                <p className="text-gray-400">Transaction Speed</p>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="card text-center"
                            >
                                <Shield className="h-8 w-8 text-solana-pink mx-auto mb-3" />
                                <h3 className="text-2xl font-bold text-white mb-1">Secure</h3>
                                <p className="text-gray-400">Blockchain Security</p>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="card text-center"
                            >
                                <Star className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
                                <h3 className="text-2xl font-bold text-white mb-1">Active</h3>
                                <p className="text-gray-400">Your Status</p>
                            </motion.div>
                        </div>

                        {/* Profile Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="card max-w-2xl mx-auto"
                        >
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="w-16 h-16 bg-gradient-to-r from-solana-purple to-solana-green rounded-full flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white">
                                        {userProfile?.username?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">{userProfile?.username}</h3>
                                    <p className="text-gray-400">
                                        Member since {userProfile?.createdAt ? new Date(userProfile.createdAt * 1000).toLocaleDateString() : 'Unknown'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <h4 className="text-lg font-semibold text-white mb-2">Wallet Address</h4>
                                <p className="text-gray-300 font-mono text-sm break-all">
                                    {publicKey?.toString()}
                                </p>
                            </div>
                        </motion.div>

                        {/* App State */}
                        {!appState && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="card text-center max-w-md mx-auto"
                            >
                                <h3 className="text-xl font-bold text-white mb-4">Initialize Application</h3>
                                <p className="text-gray-300 mb-6">
                                    The application needs to be initialized before you can use all features.
                                </p>
                                <button
                                    onClick={initialize}
                                    disabled={loading}
                                    className="btn-primary disabled:opacity-50"
                                >
                                    {loading ? 'Initializing...' : 'Initialize App'}
                                </button>
                            </motion.div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}