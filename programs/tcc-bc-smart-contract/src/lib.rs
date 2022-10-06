use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;

declare_id!("5ohR2uLsJrTTPWnxJa27pRSdWxfyiWmwmMvLZQV42fbR");

#[program]
pub mod tcc_bc_smart_contract {
    use super::*;

    pub fn create(ctx: Context<Create>, kwh_price: i32, total_ports: i8) -> ProgramResult {
        let hub = &mut ctx.accounts.hub;
        hub.usages = 0;
        hub.authority = *ctx.accounts.user.key;
        hub.kwh_price = kwh_price;
        hub.total_ports = total_ports;
        Ok(())
    }

    pub fn increment_usages(ctx: Context<IncrementUsages>) -> ProgramResult {
        let hub = &mut ctx.accounts.hub;
        hub.usages += 1;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Create<'info> {
    #[account(init, payer = user, space = 256)]
    pub hub: Account<'info, Hub>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct IncrementUsages<'info> {
    #[account(mut)]
    pub hub: Account<'info, Hub>,
}

#[account]
pub struct Hub {
    pub usages: u64,
    pub authority: Pubkey,
    pub kwh_price: i32,
    pub total_ports: i8,
}