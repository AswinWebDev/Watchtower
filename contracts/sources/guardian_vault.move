#[allow(lint(public_entry))]
module guardian::vault {
    use std::string::String;
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;

    /// Error codes
    const EInsufficientFunds: u64 = 0;
    const EExceedsDailyLimit: u64 = 1;
    const ENotOwner: u64 = 403;

    /// A struct representing an AI-generated policy rule
    public struct PolicyRule has store, drop, copy {
        action: String,
        target: String,
        limit_amount: u64,
    }

    /// The Guardian Vault owned by the user
    public struct SmartVault has key {
        id: UID,
        owner: address,
        balance: Balance<SUI>,
        rules: vector<PolicyRule>,
        daily_spent: u64,
    }

    /// Create a new protected vault for the caller
    public entry fun create_vault(ctx: &mut TxContext) {
        let vault = SmartVault {
            id: object::new(ctx),
            owner: ctx.sender(),
            balance: balance::zero(),
            rules: vector[],
            daily_spent: 0,
        };
        transfer::transfer(vault, ctx.sender());
    }

    /// Deposit OCT into the vault for protection
    public entry fun deposit(vault: &mut SmartVault, coin: Coin<SUI>, _ctx: &mut TxContext) {
        balance::join(&mut vault.balance, coin::into_balance(coin));
    }

    /// Add an AI-generated policy rule to the vault (owner only)
    public entry fun add_ai_policy(
        vault: &mut SmartVault,
        action: String,
        target: String,
        limit: u64,
        ctx: &mut TxContext
    ) {
        assert!(ctx.sender() == vault.owner, ENotOwner);
        let rule = PolicyRule {
            action,
            target,
            limit_amount: limit,
        };
        vault.rules.push_back(rule);
    }

    /// Supervised Transfer — checks all rules before allowing a spend
    public entry fun safe_transfer(
        vault: &mut SmartVault,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        assert!(ctx.sender() == vault.owner, ENotOwner);
        assert!(vault.balance.value() >= amount, EInsufficientFunds);

        let len = vault.rules.length();
        let mut i = 0;
        while (i < len) {
            let rule = &vault.rules[i];
            if (rule.limit_amount > 0) {
                assert!((vault.daily_spent + amount) <= rule.limit_amount, EExceedsDailyLimit);
            };
            i = i + 1;
        };

        vault.daily_spent = vault.daily_spent + amount;
        let coin_to_send = coin::from_balance(vault.balance.split(amount), ctx);
        transfer::public_transfer(coin_to_send, recipient);
    }

    /// Reset daily spending counter
    public entry fun reset_daily(vault: &mut SmartVault, ctx: &mut TxContext) {
        assert!(ctx.sender() == vault.owner, ENotOwner);
        vault.daily_spent = 0;
    }
}
