-- Add admin user
INSERT INTO users (name, email, password, role, created_at, updated_at)
VALUES (
    'Admin',
    'admin@example.com',
    '$2a$10$FY3.fx1KWgZtwpnJtLALkukGh0dgnaOhshYVO8qPvmpyEl2r.ObbC', -- password: admin123
    'admin',
    NOW(),
    NOW()
); 