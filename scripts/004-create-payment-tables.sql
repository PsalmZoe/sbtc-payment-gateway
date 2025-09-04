-- Create proper payment tables for the app
CREATE TABLE IF NOT EXISTS merchants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL,
    stacks_address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_intents (
    id VARCHAR(255) PRIMARY KEY,
    merchant_id INTEGER REFERENCES merchants(id),
    amount_satoshis BIGINT NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'sBTC',
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    customer_email VARCHAR(255),
    customer_name VARCHAR(255),
    success_url TEXT,
    cancel_url TEXT,
    expires_at TIMESTAMP,
    transaction_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert test merchant with proper API key hash
INSERT INTO merchants (name, email, api_key_hash, stacks_address) 
VALUES (
    'Test Merchant',
    'test@merchant.com',
    '$2b$10$rQ8K5O2GxmzKjB5Hn8F9/.123456789abcdefghijklmnopqrstuvwxyz',
    'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
) ON CONFLICT (email) DO UPDATE SET
    api_key_hash = EXCLUDED.api_key_hash,
    stacks_address = EXCLUDED.stacks_address;
