-- Create payment system tables
CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  api_key_hash VARCHAR(255) NOT NULL,
  stacks_address VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  amount_satoshis BIGINT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  description TEXT,
  tx_hash VARCHAR(255),
  block_height BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert test merchant with proper API key hash
INSERT INTO merchants (name, email, api_key_hash, stacks_address)
SELECT 'Test Merchant', 'test@example.com', '$2b$10$rOvHPw5f.Uocr6mBwMhrSOBvYUoH.j0hn77YCE6qUwlO/ZAZP2ema', 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
WHERE NOT EXISTS (SELECT 1 FROM merchants WHERE email = 'test@example.com');
