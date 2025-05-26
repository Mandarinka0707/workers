-- Создаем таблицу вакансий
CREATE TABLE vacancies (
    id SERIAL PRIMARY KEY,
    employer_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requirements TEXT,
    responsibilities TEXT,
    salary INTEGER NOT NULL,
    location VARCHAR(255) NOT NULL,
    employment_type VARCHAR(50) NOT NULL,
    company VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    skills TEXT[],
    education VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Создаем индексы
CREATE INDEX idx_vacancies_employer_id ON vacancies(employer_id);
CREATE INDEX idx_vacancies_status ON vacancies(status); 