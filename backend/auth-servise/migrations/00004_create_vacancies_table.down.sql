-- Удаляем индексы
DROP INDEX IF EXISTS idx_vacancies_employer_id;
DROP INDEX IF EXISTS idx_vacancies_status;

-- Удаляем таблицу вакансий
DROP TABLE IF EXISTS vacancies; 