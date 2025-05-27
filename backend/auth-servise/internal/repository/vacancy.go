package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/Mandarinka0707/newRepoGOODarhit/internal/entity"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

type VacancyRepository struct {
	db *sqlx.DB
}

func NewVacancyRepository(db *sqlx.DB) *VacancyRepository {
	return &VacancyRepository{db: db}
}

func (r *VacancyRepository) Create(ctx context.Context, vacancy *entity.Vacancy) error {
	fmt.Printf("Starting vacancy creation in repository\n")
	query := `
		INSERT INTO vacancies (
			employer_id, title, description, requirements, responsibilities,
			salary, location, employment_type, company, status, skills, education,
			created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
		) RETURNING id, created_at, updated_at`

	now := time.Now()
	vacancy.CreatedAt = now
	vacancy.UpdatedAt = now

	fmt.Printf("Executing query with values: %+v\n", vacancy)
	err := r.db.QueryRowContext(
		ctx,
		query,
		vacancy.EmployerID,
		vacancy.Title,
		vacancy.Description,
		vacancy.Requirements,
		vacancy.Responsibilities,
		vacancy.Salary,
		vacancy.Location,
		vacancy.EmploymentType,
		vacancy.Company,
		vacancy.Status,
		pq.Array(vacancy.Skills),
		vacancy.Education,
		now,
		now,
	).Scan(&vacancy.ID, &vacancy.CreatedAt, &vacancy.UpdatedAt)

	if err != nil {
		fmt.Printf("Error executing query: %v\n", err)
		return err
	}

	fmt.Printf("Vacancy created successfully with ID: %d\n", vacancy.ID)
	return nil
}

func (r *VacancyRepository) GetByID(ctx context.Context, id int64) (*entity.Vacancy, error) {
	fmt.Printf("Fetching vacancy with ID: %d\n", id)
	query := `
		SELECT id, employer_id, title, description, requirements, responsibilities,
			salary, location, employment_type, company, status, skills, education,
			created_at, updated_at
		FROM vacancies
		WHERE id = $1`

	var vacancy entity.Vacancy
	var skills []string
	err := r.db.QueryRowxContext(ctx, query, id).Scan(
		&vacancy.ID,
		&vacancy.EmployerID,
		&vacancy.Title,
		&vacancy.Description,
		&vacancy.Requirements,
		&vacancy.Responsibilities,
		&vacancy.Salary,
		&vacancy.Location,
		&vacancy.EmploymentType,
		&vacancy.Company,
		&vacancy.Status,
		pq.Array(&skills),
		&vacancy.Education,
		&vacancy.CreatedAt,
		&vacancy.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		fmt.Printf("No vacancy found with ID: %d\n", id)
		return nil, nil
	}
	if err != nil {
		fmt.Printf("Error fetching vacancy: %v\n", err)
		return nil, fmt.Errorf("failed to fetch vacancy: %w", err)
	}

	vacancy.Skills = skills
	fmt.Printf("Successfully fetched vacancy with ID: %d\n", id)
	return &vacancy, nil
}

func (r *VacancyRepository) GetAll(ctx context.Context) ([]*entity.Vacancy, error) {
	fmt.Printf("Starting to fetch all vacancies in repository\n")
	var vacancies []*entity.Vacancy
	query := `
		SELECT id, employer_id, title, description, requirements, responsibilities,
			salary, location, employment_type, company, status, skills, education,
			created_at, updated_at
		FROM vacancies
		ORDER BY created_at DESC`

	rows, err := r.db.QueryxContext(ctx, query)
	if err != nil {
		fmt.Printf("Error executing query: %v\n", err)
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var vacancy entity.Vacancy
		var skills []string
		err := rows.Scan(
			&vacancy.ID,
			&vacancy.EmployerID,
			&vacancy.Title,
			&vacancy.Description,
			&vacancy.Requirements,
			&vacancy.Responsibilities,
			&vacancy.Salary,
			&vacancy.Location,
			&vacancy.EmploymentType,
			&vacancy.Company,
			&vacancy.Status,
			pq.Array(&skills),
			&vacancy.Education,
			&vacancy.CreatedAt,
			&vacancy.UpdatedAt,
		)
		if err != nil {
			fmt.Printf("Error scanning row: %v\n", err)
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}
		vacancy.Skills = skills
		vacancies = append(vacancies, &vacancy)
	}

	if err = rows.Err(); err != nil {
		fmt.Printf("Error iterating rows: %v\n", err)
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	fmt.Printf("Successfully fetched %d vacancies from repository\n", len(vacancies))
	return vacancies, nil
}

func (r *VacancyRepository) Update(ctx context.Context, vacancy *entity.Vacancy) error {
	fmt.Printf("Starting vacancy update in repository for ID: %d\n", vacancy.ID)
	query := `
		UPDATE vacancies 
		SET title = $1, description = $2, requirements = $3, responsibilities = $4,
			salary = $5, location = $6, employment_type = $7, company = $8,
			status = $9, skills = $10, education = $11, updated_at = $12
		WHERE id = $13 AND employer_id = $14
		RETURNING updated_at`

	vacancy.UpdatedAt = time.Now()

	fmt.Printf("Executing update query with values: %+v\n", vacancy)
	err := r.db.QueryRowContext(
		ctx,
		query,
		vacancy.Title,
		vacancy.Description,
		vacancy.Requirements,
		vacancy.Responsibilities,
		vacancy.Salary,
		vacancy.Location,
		vacancy.EmploymentType,
		vacancy.Company,
		vacancy.Status,
		pq.Array(vacancy.Skills),
		vacancy.Education,
		vacancy.UpdatedAt,
		vacancy.ID,
		vacancy.EmployerID,
	).Scan(&vacancy.UpdatedAt)

	if err != nil {
		fmt.Printf("Error updating vacancy: %v\n", err)
		return fmt.Errorf("failed to update vacancy: %w", err)
	}

	fmt.Printf("Successfully updated vacancy with ID: %d\n", vacancy.ID)
	return nil
}

func (r *VacancyRepository) Delete(ctx context.Context, id int64) error {
	fmt.Printf("Starting vacancy deletion in repository for ID: %d\n", id)
	query := `DELETE FROM vacancies WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		fmt.Printf("Error deleting vacancy: %v\n", err)
		return fmt.Errorf("failed to delete vacancy: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		fmt.Printf("Error getting rows affected: %v\n", err)
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		fmt.Printf("No vacancy found with ID: %d\n", id)
		return fmt.Errorf("vacancy not found")
	}

	fmt.Printf("Successfully deleted vacancy with ID: %d\n", id)
	return nil
}

func (r *VacancyRepository) GetByEmployerID(ctx context.Context, employerID int64) ([]*entity.Vacancy, error) {
	fmt.Printf("Fetching vacancies for employer ID: %d\n", employerID)
	query := `
		SELECT id, employer_id, title, description, requirements, responsibilities,
			salary, location, employment_type, company, status, skills, education,
			created_at, updated_at
		FROM vacancies
		WHERE employer_id = $1
		ORDER BY created_at DESC`

	var vacancies []*entity.Vacancy
	rows, err := r.db.QueryxContext(ctx, query, employerID)
	if err != nil {
		fmt.Printf("Error executing query: %v\n", err)
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var vacancy entity.Vacancy
		var skills []string
		err := rows.Scan(
			&vacancy.ID,
			&vacancy.EmployerID,
			&vacancy.Title,
			&vacancy.Description,
			&vacancy.Requirements,
			&vacancy.Responsibilities,
			&vacancy.Salary,
			&vacancy.Location,
			&vacancy.EmploymentType,
			&vacancy.Company,
			&vacancy.Status,
			pq.Array(&skills),
			&vacancy.Education,
			&vacancy.CreatedAt,
			&vacancy.UpdatedAt,
		)
		if err != nil {
			fmt.Printf("Error scanning row: %v\n", err)
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}
		vacancy.Skills = skills
		vacancies = append(vacancies, &vacancy)
	}

	if err = rows.Err(); err != nil {
		fmt.Printf("Error iterating rows: %v\n", err)
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	fmt.Printf("Successfully fetched %d vacancies for employer ID: %d\n", len(vacancies), employerID)
	return vacancies, nil
}
