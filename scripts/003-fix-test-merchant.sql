-- Fix the test merchant with proper API key hash and setup
-- This creates a working test merchant for development

-- First, delete any existing test merchant
DELETE FROM merchants WHERE email = 'test@example.com';

-- Insert a properly configured test merchant
-- API key: sk_test_51234567890abcdef (hash this for production)
INSERT INTO merchants (
    id,
    name, 
    email, 
    api_key_hash, 
    stacks_address,
    webhook_url, 
    webhook_secret,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Test Merchant',
    'test@example.com',
    '$2b$10$rOvHPw5f.Uocr6mBwMhrSOBvYUoH.j0hn77YCE6qUwlO/ZAZP2ema', -- bcrypt hash of 'sk_test_51234567890abcdef'
    'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    'http://localhost:3001/webhooks',
    'whsec_test_secret_key_for_development_only',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Verify the merchant was created
SELECT id, name, email, stacks_address FROM merchants WHERE email = 'test@example.com';
