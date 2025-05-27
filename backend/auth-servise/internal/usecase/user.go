package usecase

import (
	"context"
	"errors"
	"time"

	"github.com/Mandarinka0707/newRepoGOODarhit/internal/entity"
	"github.com/Mandarinka0707/newRepoGOODarhit/internal/repository"
	"github.com/golang-jwt/jwt"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrUserNotFound       = errors.New("user not found")
	ErrInvalidCredentials = errors.New("invalid credentials")
)

type UserUsecaseInterface interface {
	Register(ctx context.Context, user *entity.User) error
	Login(ctx context.Context, email, password string) (string, error)
	Logout(ctx context.Context, token string) error
	GetByID(ctx context.Context, id int64) (*entity.User, error)
	Update(ctx context.Context, user *entity.User) error
	Delete(ctx context.Context, id int64) error
	GetAll(ctx context.Context) ([]*entity.User, error)
	GetStats(ctx context.Context) (*entity.UserStats, error)
}

type UserUsecase struct {
	userRepo repository.UserRepositoryInterface
	config   *UserConfig
}

type UserConfig struct {
	TokenSecret     string
	TokenExpiration time.Duration
}

func NewUserUsecase(userRepo repository.UserRepositoryInterface, config *UserConfig) *UserUsecase {
	return &UserUsecase{
		userRepo: userRepo,
		config:   config,
	}
}

func (uc *UserUsecase) Register(ctx context.Context, user *entity.User) error {
	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user.Password = string(hashedPassword)

	// Set timestamps
	now := time.Now()
	user.CreatedAt = now
	user.UpdatedAt = now

	return uc.userRepo.Create(ctx, user)
}

func (uc *UserUsecase) Login(ctx context.Context, email, password string) (string, error) {
	user, err := uc.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return "", err
	}
	if user == nil {
		return "", ErrUserNotFound
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return "", ErrInvalidCredentials
	}

	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"role":    user.Role,
		"exp":     time.Now().Add(uc.config.TokenExpiration).Unix(),
	})

	tokenString, err := token.SignedString([]byte(uc.config.TokenSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func (uc *UserUsecase) Logout(ctx context.Context, token string) error {
	// In a real implementation, we would invalidate the token
	// For now, we'll just return nil
	return nil
}

func (uc *UserUsecase) GetByID(ctx context.Context, id int64) (*entity.User, error) {
	user, err := uc.userRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrUserNotFound
	}
	return user, nil
}

func (uc *UserUsecase) Update(ctx context.Context, user *entity.User) error {
	// Set updated timestamp
	user.UpdatedAt = time.Now()
	return uc.userRepo.Update(ctx, user)
}

func (u *UserUsecase) Delete(ctx context.Context, id int64) error {
	return u.userRepo.Delete(ctx, id)
}

func (u *UserUsecase) GetAll(ctx context.Context) ([]*entity.User, error) {
	return u.userRepo.GetAll(ctx)
}

func (u *UserUsecase) GetStats(ctx context.Context) (*entity.UserStats, error) {
	users, err := u.userRepo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	stats := &entity.UserStats{
		TotalUsers:      len(users),
		TotalEmployers:  0,
		TotalJobseekers: 0,
	}

	for _, user := range users {
		switch user.Role {
		case "employer":
			stats.TotalEmployers++
		case "jobseeker":
			stats.TotalJobseekers++
		}
	}

	return stats, nil
}
