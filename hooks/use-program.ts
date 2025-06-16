'use client';
import { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { ProgramClient } from '@/lib/program-client';
import toast from 'react-hot-toast';

export function useProgram() {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [client, setClient] = useState<ProgramClient | null>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [appState, setAppState] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (wallet.publicKey && wallet.signTransaction && wallet.signAllTransactions) {
            const programClient = new ProgramClient(connection, wallet as any);
            setClient(programClient);
        } else {
            setClient(null);
        }
    }, [connection, wallet]);

    const loadUserProfile = useCallback(async () => {
        if (!client) return;
        
        try {
            const profile = await client.getUserProfile();
            setUserProfile(profile);
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }, [client]);

    const loadAppState = useCallback(async () => {
        if (!client) return;
        
        try {
            const state = await client.getAppState();
            setAppState(state);
        } catch (error) {
            console.error('Error loading app state:', error);
        }
    }, [client]);

    const createUserProfile = useCallback(async (username: string) => {
        if (!client) return;
        
        setLoading(true);
        try {
            const tx = await client.createUserProfile(username);
            toast.success('Profile created successfully!');
            await loadUserProfile();
            return tx;
        } catch (error: any) {
            toast.error('Failed to create profile: ' + error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [client, loadUserProfile]);

    const initialize = useCallback(async () => {
        if (!client) return;
        
        setLoading(true);
        try {
            const tx = await client.initialize();
            toast.success('Application initialized!');
            await loadAppState();
            return tx;
        } catch (error: any) {
            toast.error('Failed to initialize: ' + error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [client, loadAppState]);

    useEffect(() => {
        if (client) {
            loadUserProfile();
            loadAppState();
        }
    }, [client, loadUserProfile, loadAppState]);

    return {
        client,
        userProfile,
        appState,
        loading,
        createUserProfile,
        initialize,
        loadUserProfile,
        loadAppState,
    };
}