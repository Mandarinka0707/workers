package repository

import (
	"context"

	"github.com/Mandarinka0707/newRepoGOODarhit/internal/entity"
)

type VacancyRepositoryInterface interface {
	Create(ctx context.Context, vacancy *entity.Vacancy) error
	GetByID(ctx context.Context, id int64) (*entity.Vacancy, error)
	GetAll(ctx context.Context) ([]*entity.Vacancy, error)
	Update(ctx context.Context, vacancy *entity.Vacancy) error
	Delete(ctx context.Context, id int64) error
}
