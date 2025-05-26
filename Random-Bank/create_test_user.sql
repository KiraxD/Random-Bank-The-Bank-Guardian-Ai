-- Create test user
INSERT INTO users (
  id, 
  username, 
  email, 
  password, 
  "firstName", 
  "lastName", 
  balance, 
  "isActive", 
  "createdAt", 
  "updatedAt"
) 
VALUES (
  gen_random_uuid(), 
  'testuser', 
  'test@example.com', 
  -- This is a bcrypt hash of 'test123' with salt rounds 10
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Test', 
  'User', 
  1000.00, 
  true, 
  NOW(), 
  NOW()
) 
RETURNING id, username, email, balance;
