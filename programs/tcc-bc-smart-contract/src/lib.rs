use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;

declare_id!("5ohR2uLsJrTTPWnxJa27pRSdWxfyiWmwmMvLZQV42fbR");

#[program]
pub mod tcc_bc_smart_contract {
    use super::*;

    pub fn create(ctx: Context<Create>, kwh_price: i32, total_ports: i8) -> ProgramResult {
        let hub = &mut ctx.accounts.hub;
        hub.usages = 0;
        hub.owner = *ctx.accounts.user.key;
        hub.kwh_price = kwh_price;
        hub.total_ports = total_ports;
        Ok(())
    }

    pub fn use_hub(ctx: Context<UseHub>, total_to_be_paid: u64) -> ProgramResult {
        let hub = &mut ctx.accounts.hub;

        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.hub.key(),
            total_to_be_paid.try_into().unwrap()
        );

        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.hub.to_account_info()
            ]
        );

        let updated_hub = &mut ctx.accounts.hub;
        updated_hub.balance += total_to_be_paid;
        updated_hub.usages += 1;

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> ProgramResult {
        let hub = &mut ctx.accounts.hub;
        let user = &mut ctx.accounts.user;

        if hub.owner != *user.key {
            return Err(ProgramError::IncorrectProgramId);
        }

        let balance = hub.balance;
        if balance <= 0 {
            return Err(ProgramError::InsufficientFunds);
        }

        **hub.to_account_info().try_borrow_mut_lamports()? -= balance;
        **user.to_account_info().try_borrow_mut_lamports()? += balance;

        let updated_hub = &mut ctx.accounts.hub;
        updated_hub.balance = 0;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Create<'info> {
    #[account(init, payer = user, space = 512)]
    pub hub: Account<'info, Hub>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UseHub<'info> {
    #[account(mut)]
    pub hub: Account<'info, Hub>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub hub: Account<'info, Hub>,

    #[account(mut)]
    pub user: Signer<'info>,
}

#[account]
pub struct Hub {
    pub usages: u64,
    pub owner: Pubkey,
    pub kwh_price: i32,
    pub total_ports: i8,
    pub balance: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("The user is not the owner of the hub.")]
    IncorrectProgramId,
    #[msg("Insufficient amount to withdraw.")]
    InsufficientFunds,
}