package repository

import (
	"context"

	"github.com/Mandarinka0707/newRepoGOODarhit/internal/entity"
)

type UserRepositoryInterface interface {
	Create(ctx context.Context, user *entity.User) error
	GetByID(ctx context.Context, id int64) (*entity.User, error)
	GetByEmail(ctx context.Context, email string) (*entity.User, error)
	Update(ctx context.Context, user *entity.User) error
	Delete(ctx context.Context, id int64) error
}
