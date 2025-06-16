import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import idl from './idl.json';

export class ProgramClient {
    private program: Program;
    private provider: AnchorProvider;

    constructor(connection: Connection, wallet: AnchorWallet) {
        this.provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
        this.program = new Program(idl as any, new PublicKey(idl.metadata.address), this.provider);
    }

    async initialize(): Promise<string> {
        const [appStatePda] = PublicKey.findProgramAddressSync(
            [Buffer.from('app_state')],
            this.program.programId
        );

        const tx = await this.program.methods
            .initialize()
            .accounts({
                appState: appStatePda,
                authority: this.provider.wallet.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        return tx;
    }

    async createUserProfile(username: string): Promise<string> {
        const [userProfilePda] = PublicKey.findProgramAddressSync(
            [Buffer.from('user_profile'), this.provider.wallet.publicKey.toBuffer()],
            this.program.programId
        );

        const [appStatePda] = PublicKey.findProgramAddressSync(
            [Buffer.from('app_state')],
            this.program.programId
        );

        const tx = await this.program.methods
            .createUserProfile(username)
            .accounts({
                userProfile: userProfilePda,
                appState: appStatePda,
                authority: this.provider.wallet.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        return tx;
    }

    async getUserProfile(): Promise<any> {
        const [userProfilePda] = PublicKey.findProgramAddressSync(
            [Buffer.from('user_profile'), this.provider.wallet.publicKey.toBuffer()],
            this.program.programId
        );

        try {
            return await this.program.account.userProfile.fetch(userProfilePda);
        } catch (error) {
            return null;
        }
    }

    async getAppState(): Promise<any> {
        const [appStatePda] = PublicKey.findProgramAddressSync(
            [Buffer.from('app_state')],
            this.program.programId
        );

        try {
            return await this.program.account.appState.fetch(appStatePda);
        } catch (error) {
            return null;
        }
    }
}
