#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, token::Client as TokenClient, Env,
    Address, Symbol, Bytes, BytesN,
};

/// Persisted escrow state
#[contracttype]
#[derive(Clone)]
pub struct Escrow {
    pub sender: Address,
    pub asset: Address,
    pub amount: i128,
    pub pin_hash: BytesN<32>,
    pub expiry: u64,
    pub claimed: bool,
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /// Create a new escrow. `sender` must have signed this call.
    pub fn create_escrow(
        env: Env,
        sender: Address,
        payment_id: Symbol,
        asset: Address,
        pin_hash_input: BytesN<32>,
        amount: i128,
        expiry: u64,
    ) {
        // Auth check
        sender.require_auth();

        // Prevent duplicate IDs
        if env.storage().instance().has(&payment_id) {
            panic!("Escrow with this payment_id already exists");
        }

        // Store state
        let escrow = Escrow {
            sender: sender.clone(),
            asset: asset.clone(),
            amount,
            pin_hash: pin_hash_input,
            expiry,
            claimed: false,
        };
        env.storage().instance().set(&payment_id, &escrow);

        // Lock tokens into contract
        let client = TokenClient::new(&env, &asset);
        client.transfer(&sender, &env.current_contract_address(), &amount);

        // Emit event
        env.events().publish(
            (Symbol::new(&env, "EscrowCreated"),),
            (payment_id, sender, asset, amount, expiry),
        );
    }

    /// Claim funds by presenting the correct PIN preimage.
    pub fn claim_escrow(
        env: Env,
        claimant: Address,
        payment_id: Symbol,
        pin_preimage: BytesN<32>,
    ) {
        // Auth check
        claimant.require_auth();

        // Load state
        let mut escrow: Escrow =
            env.storage().instance().get(&payment_id).expect("Escrow not found");
        if escrow.claimed {
            panic!("Already claimed");
        }

        // Hash the preimage & compare
        let pre_bytes: Bytes = Bytes::from_array(&env, &pin_preimage.to_array());
        let hash_obj = env.crypto().sha256(&pre_bytes);
        let computed_hash: BytesN<32> = hash_obj.into();
        if computed_hash != escrow.pin_hash {
            panic!("Invalid PIN");
        }

        // Transfer out
        let client = TokenClient::new(&env, &escrow.asset);
        client.transfer(&env.current_contract_address(), &claimant, &escrow.amount);

        // Mark claimed
        escrow.claimed = true;
        env.storage().instance().set(&payment_id, &escrow);

        // Emit event
        env.events().publish(
            (Symbol::new(&env, "EscrowClaimed"),),
            (payment_id, claimant),
        );
    }

    /// Refund to the original sender after expiry.
    pub fn refund_escrow(
        env: Env,
        sender: Address,
        payment_id: Symbol,
    ) {
        // Auth check
        sender.require_auth();

        // Load & validate
        let mut escrow: Escrow =
            env.storage().instance().get(&payment_id).expect("Escrow not found");
        if env.ledger().timestamp() < escrow.expiry {
            panic!("Not expired yet");
        }
        if escrow.claimed {
            panic!("Already claimed, cannot refund");
        }
        if sender != escrow.sender {
            panic!("Only original sender can refund");
        }

        // Transfer back
        let client = TokenClient::new(&env, &escrow.asset);
        client.transfer(&env.current_contract_address(), &sender, &escrow.amount);

        // Mark refunded
        escrow.claimed = true;
        env.storage().instance().set(&payment_id, &escrow);

        // Emit event
        env.events().publish(
            (Symbol::new(&env, "EscrowRefunded"),),
            (payment_id,),
        );
    }

    /// Read-only view: returns `Some(Escrow)` or `None`
    pub fn get_escrow(env: Env, payment_id: Symbol) -> Option<Escrow> {
        env.storage().instance().get(&payment_id)
    }
}