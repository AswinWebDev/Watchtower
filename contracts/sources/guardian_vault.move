module guardian::vault {
    use std::string::String;
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;

    /// Error codes
    const EInsufficientFunds: u64 = 0;
    const EExceedsDailyLimit: u64 = 1;
    const EContractBlocked: u64 = 2;

    /// A struct representing an AI-generated policy rule
    struct PolicyRule has store, drop {
        action: String,   // "BLOCK_CONTRACT", "SET_LIMIT"
        target: String,   // Contract address or category
        limit_amount: u64, // Limit in SUI MIST
    }

    /// The Guardian Vault owned by the user
    struct SmartVault has key {
        id: UID,
        owner: address,
        balance: Balance<SUI>,
        rules: vector<PolicyRule>,
        daily_spent: u64,
    }

    /// Create a new protected vault for the user
    public entry fun create_vault(ctx: &mut TxContext) {
        let vault = SmartVault {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            balance: balance::zero(),
            rules: vector::empty(),
            daily_spent: 0,
        };
        transfer::transfer(vault, tx_context::sender(ctx));
    }

    /// Deposit SUI into the vault
    public entry fun deposit(vault: &mut SmartVault, coin: Coin<SUI>, _ctx: &mut TxContext) {
        balance::join(&mut vault.balance, coin::into_balance(coin));
    }

    /// AI backend calls this to add a translated rule to the user's vault
    public entry fun add_ai_policy(
        vault: &mut SmartVault, 
        action: String, 
        target: String, 
        limit: u64, 
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == vault.owner, 403); // Only owner can add policy
        
        let rule = PolicyRule {
            action: action,
            target: target,
            limit_amount: limit
        };
        vector::push_back(&mut vault.rules, rule);
    }

    /// Supervised Transfer - The core mechanic. Checks rules before allowing a spend.
    public entry fun safe_transfer(
        vault: &mut SmartVault,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == vault.owner, 403);
        assert!(balance::value(&mut vault.balance) >= amount, EInsufficientFunds);

        // Very basic rule checking loop for the MVP
        let i = 0;
        let len = vector::length(&vault.rules);
        while (i < len) {
            let rule = vector::borrow(&vault.rules, i);
            
            // If there's a daily limit rule, enforce it
            // Note: In a production Move contract, we'd use 'hash' matching for strings to avoid runtime costs, 
            // but for this MVP we keep it conceptual to prove the architecture.
            if (rule.limit_amount > 0) {
                assert!((vault.daily_spent + amount) <= rule.limit_amount, EExceedsDailyLimit);
            };
            i = i + 1;
        };

        // If rules passed, execute transfer
        vault.daily_spent = vault.daily_spent + amount;
        let coin_to_send = coin::from_balance(balance::split(&mut vault.balance, amount), ctx);
        transfer::public_transfer(coin_to_send, recipient);
    }
}
