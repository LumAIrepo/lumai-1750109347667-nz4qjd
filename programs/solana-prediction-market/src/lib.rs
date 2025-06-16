use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("PredMkt1111111111111111111111111111111111111");

#[program]
pub mod solana_prediction_market {
    use super::*;

    pub fn initialize_market(
        ctx: Context<InitializeMarket>,
        question: String,
        description: String,
        outcomes: Vec<String>,
        end_time: i64,
        min_bet: u64,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        market.authority = ctx.accounts.authority.key();
        market.question = question;
        market.description = description;
        market.outcomes = outcomes.clone();
        market.outcome_pools = vec![0; outcomes.len()];
        market.total_pool = 0;
        market.end_time = end_time;
        market.min_bet = min_bet;
        market.resolved = false;
        market.winning_outcome = None;
        market.created_at = Clock::get()?.unix_timestamp;
        
        Ok(())
    }

    pub fn place_bet(
        ctx: Context<PlaceBet>,
        outcome_index: u8,
        amount: u64,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        let user_position = &mut ctx.accounts.user_position;
        
        require!(!market.resolved, ErrorCode::MarketResolved);
        require!(Clock::get()?.unix_timestamp < market.end_time, ErrorCode::MarketEnded);
        require!(amount >= market.min_bet, ErrorCode::BetTooSmall);
        require!((outcome_index as usize) < market.outcomes.len(), ErrorCode::InvalidOutcome);

        // Transfer tokens from user to market vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.market_vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        // Update market pools
        market.outcome_pools[outcome_index as usize] += amount;
        market.total_pool += amount;

        // Update user position
        if user_position.user == Pubkey::default() {
            user_position.user = ctx.accounts.user.key();
            user_position.market = market.key();
            user_position.bets = vec![0; market.outcomes.len()];
        }
        user_position.bets[outcome_index as usize] += amount;
        user_position.total_bet += amount;

        Ok(())
    }

    pub fn resolve_market(
        ctx: Context<ResolveMarket>,
        winning_outcome: u8,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        
        require!(market.authority == ctx.accounts.authority.key(), ErrorCode::Unauthorized);
        require!(!market.resolved, ErrorCode::MarketAlreadyResolved);
        require!(Clock::get()?.unix_timestamp >= market.end_time, ErrorCode::MarketNotEnded);
        require!((winning_outcome as usize) < market.outcomes.len(), ErrorCode::InvalidOutcome);

        market.resolved = true;
        market.winning_outcome = Some(winning_outcome);
        market.resolved_at = Some(Clock::get()?.unix_timestamp);

        Ok(())
    }

    pub fn claim_winnings(ctx: Context<ClaimWinnings>) -> Result<()> {
        let market = &ctx.accounts.market;
        let user_position = &mut ctx.accounts.user_position;
        
        require!(market.resolved, ErrorCode::MarketNotResolved);
        require!(!user_position.claimed, ErrorCode::AlreadyClaimed);
        
        if let Some(winning_outcome) = market.winning_outcome {
            let user_winning_bet = user_position.bets[winning_outcome as usize];
            if user_winning_bet > 0 {
                let winning_pool = market.outcome_pools[winning_outcome as usize];
                let payout = (user_winning_bet as u128 * market.total_pool as u128 / winning_pool as u128) as u64;
                
                // Transfer winnings from market vault to user
                let seeds = &[
                    b"market",
                    market.authority.as_ref(),
                    market.question.as_bytes(),
                    &[ctx.bumps.market_vault],
                ];
                let signer = &[&seeds[..]];
                
                let cpi_accounts = Transfer {
                    from: ctx.accounts.market_vault.to_account_info(),
                    to: ctx.accounts.user_token_account.to_account_info(),
                    authority: ctx.accounts.market_vault.to_account_info(),
                };
                let cpi_program = ctx.accounts.token_program.to_account_info();
                let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
                token::transfer(cpi_ctx, payout)?;
            }
        }
        
        user_position.claimed = true;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(question: String)]
pub struct InitializeMarket<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Market::INIT_SPACE,
        seeds = [b"market", authority.key().as_ref(), question.as_bytes()],
        bump
    )]
    pub market: Account<'info, Market>,
    
    #[account(
        init,
        payer = authority,
        token::mint = mint,
        token::authority = market_vault,
        seeds = [b"vault", market.key().as_ref()],
        bump
    )]
    pub market_vault: Account<'info, TokenAccount>,
    
    pub mint: Account<'info, anchor_spl::token::Mint>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserPosition::INIT_SPACE,
        seeds = [b"position", user.key().as_ref(), market.key().as_ref()],
        bump
    )]
    pub user_position: Account<'info, UserPosition>,
    
    #[account(mut)]
    pub market_vault: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
    pub market: Account<'info, Market>,
    
    #[account(
        mut,
        seeds = [b"position", user.key().as_ref(), market.key().as_ref()],
        bump
    )]
    pub user_position: Account<'info, UserPosition>,
    
    #[account(
        mut,
        seeds = [b"vault", market.key().as_ref()],
        bump
    )]
    pub market_vault: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[account]
#[derive(InitSpace)]
pub struct Market {
    pub authority: Pubkey,
    #[max_len(200)]
    pub question: String,
    #[max_len(500)]
    pub description: String,
    #[max_len(10, 50)]
    pub outcomes: Vec<String>,
    #[max_len(10)]
    pub outcome_pools: Vec<u64>,
    pub total_pool: u64,
    pub end_time: i64,
    pub min_bet: u64,
    pub resolved: bool,
    pub winning_outcome: Option<u8>,
    pub created_at: i64,
    pub resolved_at: Option<i64>,
}

#[account]
#[derive(InitSpace)]
pub struct UserPosition {
    pub user: Pubkey,
    pub market: Pubkey,
    #[max_len(10)]
    pub bets: Vec<u64>,
    pub total_bet: u64,
    pub claimed: bool,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Market has already been resolved")]
    MarketResolved,
    #[msg("Market has ended")]
    MarketEnded,
    #[msg("Bet amount is too small")]
    BetTooSmall,
    #[msg("Invalid outcome index")]
    InvalidOutcome,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Market already resolved")]
    MarketAlreadyResolved,
    #[msg("Market has not ended yet")]
    MarketNotEnded,
    #[msg("Market not resolved")]
    MarketNotResolved,
    #[msg("Winnings already claimed")]
    AlreadyClaimed,
}