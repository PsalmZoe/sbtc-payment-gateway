#!/bin/bash
set -e

FAUCET_URL="https://stacks-node-api.testnet.stacks.co/extended/v1/faucets/stx"
BALANCE_URL="https://stacks-node-api.testnet.stacks.co/v2/accounts"
WALLET_FILE="stx-testnet-wallet.txt"

# --- STEP 1: Generate new keychain in JSON ---
echo "🔑 Generating new Stacks testnet keychain..."
KEYCHAIN_OUTPUT=$(stx make_keychain -t)

# Extract values with jq
MNEMONIC=$(echo "$KEYCHAIN_OUTPUT" | jq -r '.mnemonic')
ADDRESS=$(echo "$KEYCHAIN_OUTPUT" | jq -r '.keyInfo.address')
PRIVATE_KEY=$(echo "$KEYCHAIN_OUTPUT" | jq -r '.keyInfo.privateKey')

echo ""
echo "📬 Testnet Address: $ADDRESS"
echo "🔐 Private Key: $PRIVATE_KEY"
echo "📝 Mnemonic: $MNEMONIC"
echo ""

# --- STEP 1.5: Save wallet details to file ---
echo "💾 Saving wallet details to $WALLET_FILE ..."
cat > "$WALLET_FILE" <<EOL
Stacks Testnet Wallet
=====================
Mnemonic   : $MNEMONIC
Private Key: $PRIVATE_KEY
Address    : $ADDRESS
EOL

# --- STEP 2: Fund the address using faucet (query param style) ---
echo ""
echo "💸 Requesting faucet funds..."
curl -s -X POST "${FAUCET_URL}?address=${ADDRESS}" | jq .

# --- STEP 3: Check balance ---
echo ""
echo "⏳ Waiting ~20 seconds for faucet transaction to confirm..."
sleep 20

echo "💰 Checking account balance..."
curl -s "$BALANCE_URL/$ADDRESS" | jq .
