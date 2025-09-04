-- Add stacks_address column to merchants table
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS stacks_address VARCHAR(255);

-- Update the test merchant with a stacks address
UPDATE merchants 
SET stacks_address = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM' 
WHERE email = 'test@example.com';
