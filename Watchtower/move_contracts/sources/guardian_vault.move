module watchtower::guardian_vault {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::timestamp;
    
    /// User hasn't initialized a vault.
    const E_VAULT_NOT_INITIALIZED: u64 = 1;
    /// Policy limit exceeded.
    const E_LIMIT_EXCEEDED: u64 = 2;
    /// Unauthorized caller.
    const E_NOT_AUTHORIZED: u64 = 3;

    struct Vault<phantom CoinType> has key {
        balance: coin::Coin<CoinType>,
    }

    struct SpendingPolicy has key, store {
        daily_limit: u64,
        spent_today: u64,
        last_reset_day: u64,
        is_active: bool,
    }

    /// Initialize the vault for an end-user on OneChain.
    public entry fun initialize<CoinType>(account: &signer) {
        let addr = signer::address_of(account);
        if (!exists<Vault<CoinType>>(addr)) {
            move_to(account, Vault<CoinType> {
                balance: coin::zero<CoinType>(),
            });
            move_to(account, SpendingPolicy {
                daily_limit: 0,
                spent_today: 0,
                last_reset_day: today(),
                is_active: false,
            });
        }
    }

    /// The AI agent sets the policy by submitting a signed payload.
    /// In an enterprise setup, this requires oracle signatures or multi-sig, 
    /// but for this MVP, we map it directly to the user's explicit intent.
    public entry fun set_policy(account: &signer, limit: u64) acquires SpendingPolicy {
        let policy = borrow_global_mut<SpendingPolicy>(signer::address_of(account));
        policy.daily_limit = limit;
        policy.is_active = true;
    }

    /// User deposits into the Watchtower vault.
    public entry fun deposit<CoinType>(account: &signer, amount: u64) acquires Vault {
        let coins = coin::withdraw<CoinType>(account, amount);
        let vault = borrow_global_mut<Vault<CoinType>>(signer::address_of(account));
        coin::merge(&mut vault.balance, coins);
    }

    /// The guarded spend function. Integrates deeply with OnePlay or OneDEX.
    /// The contract inherently blocks any transfer that violates the AI-defined policy.
    public entry fun guarded_spend<CoinType>(account: &signer, destination: address, amount: u64) acquires Vault, SpendingPolicy {
        let addr = signer::address_of(account);
        assert!(exists<Vault<CoinType>>(addr), E_VAULT_NOT_INITIALIZED);

        let policy = borrow_global_mut<SpendingPolicy>(addr);
        let current_day = today();
        
        // Autonomous rollover logic
        if (policy.last_reset_day < current_day) {
            policy.spent_today = 0;
            policy.last_reset_day = current_day;
        };

        // Enforce Limits dynamically
        if (policy.is_active) {
            assert!(policy.spent_today + amount <= policy.daily_limit, E_LIMIT_EXCEEDED);
        };

        // Transfer funds physically
        let vault = borrow_global_mut<Vault<CoinType>>(addr);
        let extracted_coins = coin::extract(&mut vault.balance, amount);
        coin::deposit<CoinType>(destination, extracted_coins);
        
        policy.spent_today = policy.spent_today + amount;
    }

    /// Helper to grab the day index
    fun today(): u64 {
        timestamp::now_seconds() / 86400
    }
}
