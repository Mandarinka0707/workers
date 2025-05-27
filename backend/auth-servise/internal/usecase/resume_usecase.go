package usecase

import (
	"context"
	"fmt"

	"github.com/Mandarinka0707/newRepoGOODarhit/internal/entity"
	"github.com/Mandarinka0707/newRepoGOODarhit/internal/repository"
)

type ResumeUsecaseInterface interface {
	CreateResume(ctx context.Context, resume *entity.Resume) error
	GetResume(ctx context.Context, id int64) (*entity.Resume, error)
	GetUserResumes(ctx context.Context, userID int64) ([]*entity.Resume, error)
	UpdateResume(ctx context.Context, resume *entity.Resume) error
	DeleteResume(ctx context.Context, id int64) error
	GetAllResumes(ctx context.Context) ([]*entity.Resume, error)
	Delete(ctx context.Context, id int64) error
	GetAll(ctx context.Context) ([]*entity.Resume, error)
}

type ResumeUsecase struct {
	resumeRepo      repository.ResumeRepositoryInterface
	userRepo        repository.UserRepositoryInterface
	applicationRepo repository.ApplicationRepositoryInterface
}

func NewResumeUsecase(resumeRepo repository.ResumeRepositoryInterface, userRepo repository.UserRepositoryInterface, applicationRepo repository.ApplicationRepositoryInterface) *ResumeUsecase {
	return &ResumeUsecase{
		resumeRepo:      resumeRepo,
		userRepo:        userRepo,
		applicationRepo: applicationRepo,
	}
}

func (uc *ResumeUsecase) CreateResume(ctx context.Context, resume *entity.Resume) error {
	// Проверяем существование пользователя
	user, err := uc.userRepo.GetByID(ctx, resume.UserID)
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}
	if user == nil {
		return fmt.Errorf("user not found")
	}

	return uc.resumeRepo.Create(ctx, resume)
}

func (uc *ResumeUsecase) GetResume(ctx context.Context, id int64) (*entity.Resume, error) {
	fmt.Printf("Usecase: Getting resume with ID: %d\n", id)
	resume, err := uc.resumeRepo.GetResumeByID(ctx, id)
	if err != nil {
		fmt.Printf("Usecase: Error getting resume: %v\n", err)
		return nil, fmt.Errorf("failed to get resume: %w", err)
	}
	if resume == nil {
		fmt.Printf("Usecase: Resume not found with ID: %d\n", id)
		return nil, nil
	}
	fmt.Printf("Usecase: Successfully got resume: %+v\n", resume)
	return resume, nil
}

func (uc *ResumeUsecase) GetUserResumes(ctx context.Context, userID int64) ([]*entity.Resume, error) {
	return uc.resumeRepo.GetResumesByUserID(ctx, userID)
}

func (uc *ResumeUsecase) UpdateResume(ctx context.Context, resume *entity.Resume) error {
	return uc.resumeRepo.Update(ctx, resume)
}

func (uc *ResumeUsecase) DeleteResume(ctx context.Context, id int64) error {
	// First, delete all related applications
	if err := uc.applicationRepo.DeleteByResumeID(ctx, id); err != nil {
		return fmt.Errorf("failed to delete related applications: %w", err)
	}

	// Then delete the resume
	return uc.resumeRepo.Delete(ctx, id)
}

func (uc *ResumeUsecase) GetAllResumes(ctx context.Context) ([]*entity.Resume, error) {
	return uc.resumeRepo.GetAll()
}

func (u *ResumeUsecase) Delete(ctx context.Context, id int64) error {
	return u.resumeRepo.Delete(ctx, id)
}

func (uc *ResumeUsecase) GetAll(ctx context.Context) ([]*entity.Resume, error) {
	return uc.GetAllResumes(ctx)
}
