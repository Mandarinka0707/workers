package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/Mandarinka0707/newRepoGOODarhit/internal/entity"
	"github.com/jmoiron/sqlx"
)

type ApplicationRepositoryInterface interface {
	Create(ctx context.Context, application *entity.Application) error
	GetByID(ctx context.Context, id int64) (*entity.Application, error)
	GetAll(ctx context.Context, userID int64) ([]*entity.Application, error)
	GetByVacancyID(ctx context.Context, vacancyID int64) ([]*entity.Application, error)
	Update(ctx context.Context, application *entity.Application) error
	Delete(ctx context.Context, id int64) error
	DeleteByResumeID(ctx context.Context, resumeID int64) error
}

type ApplicationRepository struct {
	db *sqlx.DB
}

func NewApplicationRepository(db *sqlx.DB) *ApplicationRepository {
	return &ApplicationRepository{db: db}
}

func (r *ApplicationRepository) Create(ctx context.Context, application *entity.Application) error {
	fmt.Printf("ApplicationRepository.Create called with application: %+v\n", application)

	query := `
		INSERT INTO applications (user_id, vacancy_id, resume_id, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id`

	now := time.Now()
	application.CreatedAt = now
	application.UpdatedAt = now

	fmt.Printf("Executing query with values: %+v\n", map[string]interface{}{
		"user_id":    application.UserID,
		"vacancy_id": application.VacancyID,
		"resume_id":  application.ResumeID,
		"status":     application.Status,
		"created_at": application.CreatedAt,
		"updated_at": application.UpdatedAt,
	})

	err := r.db.QueryRowContext(
		ctx,
		query,
		application.UserID,
		application.VacancyID,
		application.ResumeID,
		application.Status,
		application.CreatedAt,
		application.UpdatedAt,
	).Scan(&application.ID)

	if err != nil {
		fmt.Printf("Error creating application in database: %v\n", err)
		return fmt.Errorf("failed to create application: %w", err)
	}

	fmt.Printf("Application created successfully with ID: %d\n", application.ID)
	return nil
}

func (r *ApplicationRepository) GetByID(ctx context.Context, id int64) (*entity.Application, error) {
	query := `
		SELECT id, user_id, vacancy_id, resume_id, status, created_at, updated_at
		FROM applications
		WHERE id = $1`

	application := &entity.Application{}
	err := r.db.GetContext(ctx, application, query, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get application: %w", err)
	}

	return application, nil
}

func (r *ApplicationRepository) GetAll(ctx context.Context, userID int64) ([]*entity.Application, error) {
	query := `
		SELECT id, user_id, vacancy_id, resume_id, status, created_at, updated_at
		FROM applications
		WHERE user_id = $1
		ORDER BY created_at DESC`

	var applications []*entity.Application
	err := r.db.SelectContext(ctx, &applications, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get applications: %w", err)
	}

	return applications, nil
}

func (r *ApplicationRepository) GetByVacancyID(ctx context.Context, vacancyID int64) ([]*entity.Application, error) {
	fmt.Printf("GetByVacancyID: Starting query for vacancy ID=%d\n", vacancyID)
	query := `
		SELECT id, user_id, vacancy_id, resume_id, status, created_at, updated_at
		FROM applications
		WHERE vacancy_id = $1
		ORDER BY created_at DESC`

	var applications []*entity.Application
	err := r.db.SelectContext(ctx, &applications, query, vacancyID)
	if err != nil {
		fmt.Printf("GetByVacancyID: Error executing query: %v\n", err)
		return nil, fmt.Errorf("failed to get applications by vacancy ID: %w", err)
	}

	fmt.Printf("GetByVacancyID: Found %d applications for vacancy ID=%d\n", len(applications), vacancyID)
	return applications, nil
}

func (r *ApplicationRepository) Update(ctx context.Context, application *entity.Application) error {
	query := `
		UPDATE applications
		SET status = $1, updated_at = $2
		WHERE id = $3`

	application.UpdatedAt = time.Now()

	result, err := r.db.ExecContext(
		ctx,
		query,
		application.Status,
		application.UpdatedAt,
		application.ID,
	)
	if err != nil {
		return fmt.Errorf("failed to update application: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rowsAffected == 0 {
		return fmt.Errorf("application not found")
	}

	return nil
}

func (r *ApplicationRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM applications WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete application: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rowsAffected == 0 {
		return fmt.Errorf("application not found")
	}

	return nil
}

func (r *ApplicationRepository) DeleteByResumeID(ctx context.Context, resumeID int64) error {
	query := `DELETE FROM applications WHERE resume_id = $1`

	result, err := r.db.ExecContext(ctx, query, resumeID)
	if err != nil {
		return fmt.Errorf("failed to delete applications by resume ID: %w", err)
	}

	_, err = result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	return nil
}
