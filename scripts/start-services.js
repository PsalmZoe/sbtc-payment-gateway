// Production deployment script - run with: node scripts/start-services.js

console.log("📋 sBTC Payment Gateway - Production Setup Guide")
console.log("=".repeat(50))

console.log("\n🔧 Required Environment Variables:")
console.log("- DATABASE_URL: PostgreSQL connection string")
console.log("- SBTC_SECRET_KEY: Your sBTC Gateway secret key")
console.log("- SBTC_WEBHOOK_SECRET: Webhook signature secret")
console.log("- CONTRACT_ADDRESS: Deployed smart contract address")
console.log("- STACKS_PRIVATE_KEY: Private key for contract interactions")

console.log("\n🚀 Deployment Steps:")
console.log("1. Set up environment variables")
console.log("2. Run database migrations: npm run db:migrate")
console.log("3. Deploy smart contract to Stacks network")
console.log("4. Start the application: npm run start")

console.log("\n📡 Optional Services:")
console.log("- Blockchain watcher for real-time events")
console.log("- Webhook retry service for failed deliveries")
console.log("- Background job processing")

console.log("\n✅ Setup complete! Visit your application URL to test.")
