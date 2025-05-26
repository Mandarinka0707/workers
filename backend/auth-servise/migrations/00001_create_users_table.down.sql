-- Восстанавливаем внешние ключи
ALTER TABLE resumes
    DROP CONSTRAINT IF EXISTS resumes_user_id_fkey;

ALTER TABLE sessions
    DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;

-- Удаляем индексы
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_role;

-- Удаляем таблицу пользователей
DROP TABLE IF EXISTS users; 