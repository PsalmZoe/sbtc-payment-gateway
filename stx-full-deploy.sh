set -euo pipefail

# -------- CONFIG --------
NODE="https://stacks-node-api.testnet.stacks.co"
CONTRACT_PATH="./contracts/payment-gateway.clar"
CONTRACT_NAME="payment-gateway"
FEE=${FEE:-10000}                    # in micro-STX (0.0001 STX)
KEY_JSON="./deployer-keys.json"      # machine-readable (kept for reuse)
KEY_TXT="./deployer-wallet.txt"      # human-readable backup with mnemonic

# -------- HELPERS --------
need() { command -v "$1" >/dev/null 2>&1 || { echo "❌ Missing dependency: $1"; exit 1; }; }
hex2dec() { printf "%d\n" "$1"; }    # converts 0x... -> decimal (µSTX)
get_acct() { curl -sS "$NODE/v2/accounts/$ADDRESS"; }

# -------- PRECHECKS --------
need stx
need jq
need curl
[ -f "$CONTRACT_PATH" ] || { echo "❌ Contract file not found at: $CONTRACT_PATH"; exit 1; }

echo "🔎 Checking node: $NODE"
curl -sS "$NODE/v2/info" | jq -r '.server_version, .network_id' >/dev/null || {
  echo "❌ Cannot reach Stacks testnet node."; exit 1;
}

# -------- CREATE / LOAD WALLET --------
if [ ! -f "$KEY_JSON" ]; then
  echo "🔑 Generating new testnet wallet..."
  stx make_keychain --testnet > "$KEY_JSON"

  MNEMONIC=$(jq -r '.mnemonic' "$KEY_JSON")
  PRIVKEY=$(jq -r '.keyInfo.privateKey' "$KEY_JSON")
  ADDRESS=$(jq -r '.keyInfo.address' "$KEY_JSON")

  echo "📝 Writing human-readable backup to $KEY_TXT"
  {
    echo "Mnemonic: $MNEMONIC"
    echo "Private Key: $PRIVKEY"
    echo "Address: $ADDRESS"
  } > "$KEY_TXT"
else
  echo "📦 Loading wallet from $KEY_JSON"
  MNEMONIC=$(jq -r '.mnemonic' "$KEY_JSON")
  PRIVKEY=$(jq -r '.keyInfo.privateKey' "$KEY_JSON")
  ADDRESS=$(jq -r '.keyInfo.address' "$KEY_JSON")
fi

echo "📬 Address: $ADDRESS"
echo "🔐 Private Key: $PRIVKEY"
echo "🧠 Mnemonic saved in: $KEY_TXT"

# -------- FUND IF NEEDED --------
BAL_HEX=$(get_acct | jq -r '.balance')
BAL_DEC=$(hex2dec "$BAL_HEX" || echo 0)
echo "💰 Current balance: ${BAL_DEC} µSTX"

if [ "$BAL_DEC" -eq 0 ]; then
  echo "💸 Requesting faucet funds..."
  FAUCET_RESP=$(curl -sS -X POST "$NODE/extended/v1/faucets/stx?address=$ADDRESS" || true)
  # Print as JSON if possible, otherwise raw (handles faucet errors nicely)
  echo "$FAUCET_RESP" | jq . 2>/dev/null || echo "$FAUCET_RESP"

  echo "⏳ Waiting for faucet confirmation..."
  for i in {1..40}; do
    sleep 3
    BAL_HEX=$(get_acct | jq -r '.balance')
    BAL_DEC=$(hex2dec "$BAL_HEX" || echo 0)
    printf "   • Check %02d: %s µSTX\r" "$i" "$BAL_DEC"
    if [ "$BAL_DEC" -gt 0 ]; then echo; break; fi
  done
  echo
  if [ "$BAL_DEC" -eq 0 ]; then
    echo "❌ Still unfunded. The faucet may be rate-limiting or lagging. Try again shortly or use the web faucet: https://explorer.hiro.so/testnet/faucet"
    exit 1
  fi
fi

# -------- NONCE --------
NONCE=$(get_acct | jq -r '.nonce')
echo "🔢 Nonce: $NONCE"
echo "🧾 Fee:  ${FEE} µSTX"

# -------- DEPLOY --------
echo "🚀 Deploying '$CONTRACT_NAME' from $ADDRESS..."
TX_OUTPUT=$(stx deploy_contract "$CONTRACT_PATH" "$CONTRACT_NAME" "$FEE" "$NONCE" "$PRIVKEY" 2>&1 || true)
echo "$TX_OUTPUT"

# stx output isn't strict JSON; grab the first 64-hex txid-looking thing
TXID=$(echo "$TX_OUTPUT" | grep -oE '0x[0-9a-f]{64}' | head -n1 || true)

if [ -n "$TXID" ]; then
  echo "🌐 Explorer: https://explorer.hiro.so/txid/$TXID?chain=testnet"
else
  echo "⚠️ Could not parse txid from output above (CLI formats vary)."
fi
