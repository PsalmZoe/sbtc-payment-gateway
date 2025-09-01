-- sBTC Payment Gateway Database Schema

-- Merchants table
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    api_key_hash VARCHAR(255) UNIQUE NOT NULL,
    webhook_url VARCHAR(500),
    webhook_secret VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment intents table
CREATE TABLE IF NOT EXISTS payment_intents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id BYTEA UNIQUE NOT NULL, -- 32-byte ID for smart contract
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    amount_sats BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'requires_payment',
    client_secret_hash VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}',
    tx_hash VARCHAR(66), -- Stacks transaction hash
    block_height BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table for webhook delivery
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(100) NOT NULL,
    payment_intent_id UUID REFERENCES payment_intents(id),
    data_json JSONB NOT NULL,
    delivered_at TIMESTAMP,
    delivery_attempts INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_intents_merchant ON payment_intents(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status);
CREATE INDEX IF NOT EXISTS idx_payment_intents_contract_id ON payment_intents(contract_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_delivered ON events(delivered_at);

-- Insert test merchant
INSERT INTO merchants (name, email, api_key_hash, webhook_url, webhook_secret) 
VALUES (
    'Test Merchant',
    'test@example.com',
    '$2b$10$example.hash.for.testing.purposes.only',
    'http://localhost:3001/webhooks',
    'whsec_test_secret_key'
) ON CONFLICT (email) DO NOTHING;
