'use client';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function WalletButton() {
    return (
        <WalletMultiButton className="!bg-gradient-to-r !from-solana-purple !to-solana-green hover:!from-solana-green hover:!to-solana-purple !transition-all !duration-300 !rounded-full !font-semibold !shadow-lg hover:!shadow-glow !transform hover:!scale-105" />
    );
}