import type { Metadata } from "next";
import { SolanaWalletProvider } from "@/components/wallet-provider";
import "./globals.css";

export const metadata: Metadata = {
    title: "Solana dApp",
    description: "A custom Solana dApp generated for your prompt.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="dark">
            <body className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white antialiased">
                <SolanaWalletProvider>
                    {children}
                </SolanaWalletProvider>
            </body>
        </html>
    );
}