-- Update test merchant with proper API key hash for 'sk_test_mock_key'
-- This hash corresponds to the API key used in the dashboard
UPDATE merchants 
SET api_key_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE email = 'test@example.com';
