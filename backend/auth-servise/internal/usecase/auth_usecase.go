// auth_usecase.go
package usecase

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/Mandarinka0707/newRepoGOODarhit/internal/entity"
	"github.com/Mandarinka0707/newRepoGOODarhit/internal/repository"
	"github.com/golang-jwt/jwt"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
)

type AuthUsecaseInterface interface {
	Register(ctx context.Context, req *RegisterRequest) (*RegisterResponse, error)
	Login(ctx context.Context, req *LoginRequest) (*LoginResponse, error)
	ValidateToken(ctx context.Context, req *ValidateTokenRequest) (int64, error)
	GetUser(ctx context.Context, req *GetUserRequest) (*entity.User, error)
	GetUserByID(ctx context.Context, id int64) (*entity.User, error)
	GetTokenSecret() string
}

type authUsecase struct {
	userRepo repository.UserRepository
	config   *Config
	logger   *zap.Logger
}

func NewAuthUsecase(userRepo repository.UserRepository, config *Config, logger *zap.Logger) AuthUsecaseInterface {
	return &authUsecase{
		userRepo: userRepo,
		config:   config,
		logger:   logger,
	}
}

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
	Role     string `json:"role"`
}

type RegisterResponse struct {
	ID        int64     `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"createdAt"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string
	User  *entity.User
}

type ValidateTokenRequest struct {
	Token string `json:"token"`
}

type GetUserRequest struct {
	ID int64 `json:"id"`
}

type Config struct {
	TokenSecret     string
	TokenExpiration time.Duration
}

func (uc *authUsecase) Register(ctx context.Context, req *RegisterRequest) (*RegisterResponse, error) {
	uc.logger.Info("Register attempt")
	uc.logger.Debug("Register request", zap.Any("request", req))

	// Check if user already exists
	existingUser, err := uc.userRepo.GetByEmail(ctx, req.Email)
	if err == nil && existingUser != nil {
		return nil, fmt.Errorf("user with this email already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create user
	now := time.Now()
	user := &entity.User{
		Email:     req.Email,
		Password:  string(hashedPassword),
		Name:      req.Name,
		Role:      req.Role,
		CreatedAt: now,
		UpdatedAt: now,
	}

	fmt.Printf("Creating user with data: %+v\n", user)

	err = uc.userRepo.Create(ctx, user)
	if err != nil {
		fmt.Printf("Error creating user: %v\n", err)
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	fmt.Printf("Successfully registered user with ID: %d\n", user.ID)

	return &RegisterResponse{
		ID:        user.ID,
		Email:     user.Email,
		Name:      user.Name,
		Role:      user.Role,
		CreatedAt: user.CreatedAt,
	}, nil
}

func (uc *authUsecase) Login(ctx context.Context, req *LoginRequest) (*LoginResponse, error) {
	uc.logger.Info("Login attempt", zap.String("email", req.Email))

	user, err := uc.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, fmt.Errorf("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, fmt.Errorf("invalid credentials")
	}

	token, err := uc.generateToken(user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &LoginResponse{
		Token: token,
		User:  user,
	}, nil
}

func (uc *authUsecase) ValidateToken(ctx context.Context, req *ValidateTokenRequest) (int64, error) {
	token, err := jwt.Parse(req.Token, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(uc.config.TokenSecret), nil
	})

	if err != nil {
		return 0, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userID, ok := claims["user_id"].(float64)
		if !ok {
			return 0, errors.New("invalid token claims")
		}
		return int64(userID), nil
	}

	return 0, errors.New("invalid token")
}

func (uc *authUsecase) GetUser(ctx context.Context, req *GetUserRequest) (*entity.User, error) {
	return uc.userRepo.GetByID(ctx, req.ID)
}

func (uc *authUsecase) GetUserByID(ctx context.Context, id int64) (*entity.User, error) {
	fmt.Printf("Attempting to get user with ID: %d\n", id)

	user, err := uc.userRepo.GetByID(ctx, id)
	if err != nil {
		fmt.Printf("Error getting user by ID: %v\n", err)
		return nil, err
	}

	if user == nil {
		fmt.Printf("User not found with ID: %d\n", id)
		return nil, errors.New("user not found")
	}

	fmt.Printf("Successfully retrieved user with ID: %d\n", id)
	return user, nil
}

func (uc *authUsecase) GetTokenSecret() string {
	return uc.config.TokenSecret
}

func (uc *authUsecase) generateToken(userID int64) (string, error) {
	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(uc.config.TokenExpiration).Unix(),
	})

	tokenString, err := token.SignedString([]byte(uc.config.TokenSecret))
	if err != nil {
		return "", fmt.Errorf("error signing token: %w", err)
	}

	return tokenString, nil
}
