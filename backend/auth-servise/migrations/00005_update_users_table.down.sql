-- Удаляем внешние ключи
ALTER TABLE resumes DROP CONSTRAINT IF EXISTS resumes_user_id_fkey;
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;
ALTER TABLE vacancies DROP CONSTRAINT IF EXISTS vacancies_employer_id_fkey;

-- Обновляем структуру таблицы users
ALTER TABLE users
    ALTER COLUMN name DROP NOT NULL,
    ALTER COLUMN name DROP DEFAULT;

-- Восстанавливаем внешние ключи
ALTER TABLE resumes ADD CONSTRAINT resumes_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE sessions ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE vacancies ADD CONSTRAINT vacancies_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE; 