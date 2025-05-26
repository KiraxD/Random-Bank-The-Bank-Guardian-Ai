-- Create Reshob1 user
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
  'Reshob1', 
  'reshob.rc12345@gmail.com', 
  -- This is a bcrypt hash of '123456' with salt rounds 10
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Reshob', 
  'RC', 
  1000.00, 
  true, 
  NOW(), 
  NOW()
) 
ON CONFLICT (email) DO NOTHING
RETURNING id, username, email, balance;
