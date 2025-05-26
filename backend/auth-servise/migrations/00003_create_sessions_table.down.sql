-- Удаляем индексы
DROP INDEX IF EXISTS idx_sessions_token;
DROP INDEX IF EXISTS idx_sessions_user_id;

-- Удаляем таблицу сессий
DROP TABLE IF EXISTS sessions; 