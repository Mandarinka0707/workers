package repository

import (
	"context"
	"database/sql/driver"
	"fmt"
	"strings"
	"time"

	"github.com/Mandarinka0707/newRepoGOODarhit/internal/entity"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

// StringArray is a custom type that implements sql.Scanner and driver.Valuer
type StringArray []string

// Scan implements the sql.Scanner interface
func (a *StringArray) Scan(value interface{}) error {
	if value == nil {
		*a = StringArray{}
		return nil
	}

	switch v := value.(type) {
	case []byte:
		// Remove curly braces and split by comma
		str := strings.Trim(string(v), "{}")
		if str == "" {
			*a = StringArray{}
			return nil
		}
		*a = StringArray(strings.Split(str, ","))
		return nil
	case string:
		str := strings.Trim(v, "{}")
		if str == "" {
			*a = StringArray{}
			return nil
		}
		*a = StringArray(strings.Split(str, ","))
		return nil
	default:
		return fmt.Errorf("unsupported type: %T", value)
	}
}

// Value implements the driver.Valuer interface
func (a StringArray) Value() (driver.Value, error) {
	if len(a) == 0 {
		return "{}", nil
	}
	return "{" + strings.Join(a, ",") + "}", nil
}

type ResumeRepositoryInterface interface {
	Create(ctx context.Context, resume *entity.Resume) error
	GetResumeByID(ctx context.Context, id int64) (*entity.Resume, error)
	GetResumesByUserID(ctx context.Context, userID int64) ([]*entity.Resume, error)
	Update(ctx context.Context, resume *entity.Resume) error
	Delete(ctx context.Context, id int64) error
	GetAll() ([]*entity.Resume, error)
}

type ResumeRepository struct {
	db *sqlx.DB
}

func NewResumeRepository(db *sqlx.DB) *ResumeRepository {
	return &ResumeRepository{db: db}
}

func (r *ResumeRepository) Create(ctx context.Context, resume *entity.Resume) error {
	query := `
		INSERT INTO resumes (user_id, title, description, skills, experience, education, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id`

	now := time.Now()
	resume.CreatedAt = now
	resume.UpdatedAt = now

	err := r.db.QueryRowContext(
		ctx,
		query,
		resume.UserID,
		resume.Title,
		resume.Description,
		pq.Array(resume.Skills),
		resume.Experience,
		resume.Education,
		resume.Status,
		resume.CreatedAt,
		resume.UpdatedAt,
	).Scan(&resume.ID)

	if err != nil {
		return fmt.Errorf("failed to create resume: %w", err)
	}

	return nil
}

func (r *ResumeRepository) GetResumeByID(ctx context.Context, id int64) (*entity.Resume, error) {
	query := `
		SELECT 
			id, 
			user_id, 
			title, 
			description, 
			COALESCE(skills::text, '[]') as skills, 
			experience, 
			education, 
			status, 
			created_at, 
			updated_at
		FROM resumes
		WHERE id = $1`

	var resume entity.Resume
	var skillsStr string
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&resume.ID,
		&resume.UserID,
		&resume.Title,
		&resume.Description,
		&skillsStr,
		&resume.Experience,
		&resume.Education,
		&resume.Status,
		&resume.CreatedAt,
		&resume.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get resume: %w", err)
	}

	// Parse the JSONB string into a string array
	if skillsStr == "[]" {
		resume.Skills = []string{}
	} else {
		// Remove the square brackets and split by comma
		skillsStr = strings.Trim(skillsStr, "[]{}")
		if skillsStr != "" {
			// Split by comma and trim quotes and spaces
			skills := strings.Split(skillsStr, ",")
			for i, skill := range skills {
				skills[i] = strings.Trim(skill, `" `)
			}
			resume.Skills = skills
		} else {
			resume.Skills = []string{}
		}
	}

	return &resume, nil
}

func (r *ResumeRepository) GetResumesByUserID(ctx context.Context, userID int64) ([]*entity.Resume, error) {
	query := `
		SELECT 
			id, 
			user_id, 
			title, 
			description, 
			COALESCE(skills::text, '[]') as skills, 
			experience, 
			education, 
			status, 
			created_at, 
			updated_at
		FROM resumes
		WHERE user_id = $1
		ORDER BY created_at DESC`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get resumes: %w", err)
	}
	defer rows.Close()

	var resumes []*entity.Resume
	for rows.Next() {
		var resume entity.Resume
		var skillsStr string
		err := rows.Scan(
			&resume.ID,
			&resume.UserID,
			&resume.Title,
			&resume.Description,
			&skillsStr,
			&resume.Experience,
			&resume.Education,
			&resume.Status,
			&resume.CreatedAt,
			&resume.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan resume row: %w", err)
		}

		// Parse the skills string into a string array
		if skillsStr == "[]" {
			resume.Skills = []string{}
		} else {
			// Remove the square brackets and split by comma
			skillsStr = strings.Trim(skillsStr, "[]{}")
			if skillsStr != "" {
				// Split by comma and trim quotes and spaces
				skills := strings.Split(skillsStr, ",")
				for i, skill := range skills {
					skills[i] = strings.Trim(skill, `" `)
				}
				resume.Skills = skills
			} else {
				resume.Skills = []string{}
			}
		}

		resumes = append(resumes, &resume)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating resume rows: %w", err)
	}

	return resumes, nil
}

func (r *ResumeRepository) Update(ctx context.Context, resume *entity.Resume) error {
	query := `
		UPDATE resumes
		SET title = $1, description = $2, skills = $3, experience = $4, education = $5, status = $6, updated_at = $7
		WHERE id = $8`

	resume.UpdatedAt = time.Now()

	result, err := r.db.ExecContext(
		ctx,
		query,
		resume.Title,
		resume.Description,
		pq.Array(resume.Skills),
		resume.Experience,
		resume.Education,
		resume.Status,
		resume.UpdatedAt,
		resume.ID,
	)
	if err != nil {
		return fmt.Errorf("failed to update resume: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rowsAffected == 0 {
		return fmt.Errorf("resume not found")
	}

	return nil
}

func (r *ResumeRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM resumes WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete resume: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rowsAffected == 0 {
		return fmt.Errorf("resume not found")
	}

	return nil
}

func (r *ResumeRepository) GetAll() ([]*entity.Resume, error) {
	query := `
		SELECT 
			id, 
			user_id, 
			title, 
			description, 
			COALESCE(skills::text, '[]') as skills, 
			experience, 
			education, 
			status, 
			created_at, 
			updated_at
		FROM resumes
		ORDER BY created_at DESC`

	rows, err := r.db.QueryContext(context.Background(), query)
	if err != nil {
		return nil, fmt.Errorf("failed to get resumes: %w", err)
	}
	defer rows.Close()

	var resumes []*entity.Resume
	for rows.Next() {
		var resume entity.Resume
		var skillsStr string
		err := rows.Scan(
			&resume.ID,
			&resume.UserID,
			&resume.Title,
			&resume.Description,
			&skillsStr,
			&resume.Experience,
			&resume.Education,
			&resume.Status,
			&resume.CreatedAt,
			&resume.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan resume: %w", err)
		}

		// Parse the JSONB string into a string array
		if skillsStr == "[]" {
			resume.Skills = []string{}
		} else {
			// Remove the square brackets and split by comma
			skillsStr = strings.Trim(skillsStr, "[]{}")
			if skillsStr != "" {
				// Split by comma and trim quotes and spaces
				skills := strings.Split(skillsStr, ",")
				for i, skill := range skills {
					skills[i] = strings.Trim(skill, `" `)
				}
				resume.Skills = skills
			} else {
				resume.Skills = []string{}
			}
		}

		resumes = append(resumes, &resume)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating resume rows: %w", err)
	}

	return resumes, nil
}
