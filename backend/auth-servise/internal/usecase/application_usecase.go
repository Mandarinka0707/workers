package usecase

import (
	"context"
	"fmt"

	"github.com/Mandarinka0707/newRepoGOODarhit/internal/entity"
	"github.com/Mandarinka0707/newRepoGOODarhit/internal/repository"
)

type ApplicationUsecaseInterface interface {
	Create(ctx context.Context, application *entity.Application) error
	GetByID(ctx context.Context, id int64) (*entity.Application, error)
	GetAll(ctx context.Context, userID int64) ([]*entity.Application, error)
	UpdateStatus(ctx context.Context, id int64, userID int64, status string) error
}

type ApplicationUsecase struct {
	applicationRepo repository.ApplicationRepositoryInterface
	userRepo        repository.UserRepositoryInterface
	vacancyRepo     repository.VacancyRepositoryInterface
	resumeRepo      repository.ResumeRepositoryInterface
}

func NewApplicationUsecase(
	applicationRepo repository.ApplicationRepositoryInterface,
	userRepo repository.UserRepositoryInterface,
	vacancyRepo repository.VacancyRepositoryInterface,
	resumeRepo repository.ResumeRepositoryInterface,
) *ApplicationUsecase {
	return &ApplicationUsecase{
		applicationRepo: applicationRepo,
		userRepo:        userRepo,
		vacancyRepo:     vacancyRepo,
		resumeRepo:      resumeRepo,
	}
}

func (uc *ApplicationUsecase) Create(ctx context.Context, application *entity.Application) error {
	// Проверяем существование пользователя
	user, err := uc.userRepo.GetByID(ctx, application.UserID)
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}
	if user == nil {
		return fmt.Errorf("user not found")
	}

	// Проверяем существование вакансии
	vacancy, err := uc.vacancyRepo.GetByID(ctx, application.VacancyID)
	if err != nil {
		return fmt.Errorf("failed to get vacancy: %w", err)
	}
	if vacancy == nil {
		return fmt.Errorf("vacancy not found")
	}

	// Проверяем существование резюме
	resume, err := uc.resumeRepo.GetResumeByID(ctx, application.ResumeID)
	if err != nil {
		return fmt.Errorf("failed to get resume: %w", err)
	}
	if resume == nil {
		return fmt.Errorf("resume not found")
	}

	// Проверяем, что резюме принадлежит пользователю
	if resume.UserID != application.UserID {
		return fmt.Errorf("resume does not belong to user")
	}

	return uc.applicationRepo.Create(ctx, application)
}

func (uc *ApplicationUsecase) GetByID(ctx context.Context, id int64) (*entity.Application, error) {
	return uc.applicationRepo.GetByID(ctx, id)
}

func (uc *ApplicationUsecase) GetAll(ctx context.Context, userID int64) ([]*entity.Application, error) {
	return uc.applicationRepo.GetAll(ctx, userID)
}

func (uc *ApplicationUsecase) UpdateStatus(ctx context.Context, id int64, userID int64, status string) error {
	application, err := uc.applicationRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get application: %w", err)
	}
	if application == nil {
		return fmt.Errorf("application not found")
	}

	// Проверяем, что пользователь имеет право обновлять статус
	// (либо это работодатель, создавший вакансию, либо соискатель, создавший отклик)
	vacancy, err := uc.vacancyRepo.GetByID(ctx, application.VacancyID)
	if err != nil {
		return fmt.Errorf("failed to get vacancy: %w", err)
	}
	if vacancy == nil {
		return fmt.Errorf("vacancy not found")
	}

	user, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}
	if user == nil {
		return fmt.Errorf("user not found")
	}

	if user.Role == "employer" && vacancy.EmployerID != userID {
		return fmt.Errorf("permission denied: not the vacancy owner")
	}
	if user.Role == "jobseeker" && application.UserID != userID {
		return fmt.Errorf("permission denied: not the application owner")
	}

	application.Status = status
	return uc.applicationRepo.Update(ctx, application)
}
