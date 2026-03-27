import { SuiClient } from '@onelabs/sui/client';
import { Ed25519Keypair } from '@onelabs/sui/keypairs/ed25519';
import { Transaction } from '@onelabs/sui/transactions';
import { fromB64, toB64 } from '@onelabs/sui/utils';
import * as fs from 'fs';
import * as path from 'path';

const TESTNET_URL = 'https://rpc-testnet.onelabs.cc:443';

async function main() {
    console.log('🚀 Starting Guardian Vault deployment to OneChain Testnet...');

    // Initialize client
    const client = new SuiClient({ url: TESTNET_URL });
    console.log(`✅ Connected to: ${TESTNET_URL}`);

    // Load keypair from Sui keystore
    const keystorePath = path.join(process.env.HOME || '~', '.sui', 'sui_config', 'sui.keystore');
    const keystore = JSON.parse(fs.readFileSync(keystorePath, 'utf8'));
    
    if (keystore.length === 0) {
        console.error('❌ No keys in keystore');
        process.exit(1);
    }

    // Decode the base64 key — Sui keystore format: [scheme_flag + private_key]
    const rawKey = fromB64(keystore[0]);
    // First byte is the scheme flag (0 = ed25519), rest is the 32-byte secret key
    const secretKey = rawKey.slice(1);
    const keypair = Ed25519Keypair.fromSecretKey(secretKey);
    const address = keypair.getPublicKey().toSuiAddress();
    console.log(`📍 Deployer address: ${address}`);

    // Check balance
    const balance = await client.getBalance({ owner: address });
    console.log(`💰 Balance: ${parseInt(balance.totalBalance) / 1_000_000_000} OCT`);

    if (parseInt(balance.totalBalance) === 0) {
        console.error('❌ No OCT balance. Please fund this address first:');
        console.log(`   Address: ${address}`);
        console.log('   Use OneBox faucet: https://onebox.onelabs.cc/dashboard');
        process.exit(1);
    }

    // Read compiled bytecode
    const buildDir = path.join(__dirname, '..', 'build', 'watchtower_vault');
    const bytecodeDir = path.join(buildDir, 'bytecode_modules');
    
    const moduleFiles = fs.readdirSync(bytecodeDir).filter(f => f.endsWith('.mv'));
    if (moduleFiles.length === 0) {
        console.error('❌ No compiled modules found. Run: sui move build -e testnet');
        process.exit(1);
    }

    const modules = moduleFiles.map(f => {
        const bytes = fs.readFileSync(path.join(bytecodeDir, f));
        return toB64(new Uint8Array(bytes));
    });
    console.log(`📦 Found ${modules.length} module(s): ${moduleFiles.join(', ')}`);

    // Read dependencies from BuildInfo
    const buildInfoPath = path.join(buildDir, 'BuildInfo.yaml');
    const buildInfo = fs.readFileSync(buildInfoPath, 'utf8');
    
    // Extract dependency IDs from BuildInfo.yaml
    // Standard Sui framework dependencies
    const dependencies = [
        '0x0000000000000000000000000000000000000000000000000000000000000001', // MoveStdlib
        '0x0000000000000000000000000000000000000000000000000000000000000002', // Sui
    ];

    console.log('\n🔨 Publishing contract...');

    // Create publish transaction
    const tx = new Transaction();
    tx.setSender(address);
    
    const [upgradeCap] = tx.publish({
        modules,
        dependencies,
    });

    // Transfer the UpgradeCap to the deployer
    tx.transferObjects([upgradeCap], address);

    // Set gas budget
    tx.setGasBudget(100_000_000);

    try {
        const result = await client.signAndExecuteTransaction({
            signer: keypair,
            transaction: tx,
            options: {
                showEffects: true,
                showObjectChanges: true,
            }
        });

        console.log('\n✅ Deployment successful!');
        console.log(`📦 Transaction digest: ${result.digest}`);

        // Extract package ID
        const publishedChange = result.objectChanges?.find(
            (change) => change.type === 'published'
        );

        if (publishedChange && publishedChange.type === 'published') {
            const packageId = publishedChange.packageId;
            console.log(`🏗️  Package ID: ${packageId}`);

            // Save deployment info
            const deploymentInfo = {
                packageId,
                deploymentTx: result.digest,
                deployerAddress: address,
                network: 'onechain-testnet',
                rpcUrl: TESTNET_URL,
                deployedAt: new Date().toISOString(),
                modules: moduleFiles,
            };

            const outputPath = path.join(__dirname, '..', 'deployment-info.json');
            fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
            console.log(`\n📄 Deployment info saved to: ${outputPath}`);
            console.log('\n🎉 Guardian Vault is now live on OneChain Testnet!');
            console.log('\nNext steps:');
            console.log(`  1. Update frontend PACKAGE_ID to: ${packageId}`);
            console.log('  2. Call create_vault() from the user\'s wallet');
            console.log('  3. Deposit OCT into the vault');
            console.log('  4. Add AI policies via add_ai_policy()');
        } else {
            console.log('⚠️  Could not extract package ID from result');
            console.log('Full result:', JSON.stringify(result, null, 2));
        }
    } catch (error) {
        console.error('\n❌ Deployment failed:', error.message || error);
        if (error.message?.includes('Insufficient')) {
            console.log('💡 Need more OCT. Fund address:', address);
        }
        process.exit(1);
    }
}

main().catch(console.error);
