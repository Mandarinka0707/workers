package usecase

import (
	"context"
	"errors"
	"fmt"

	"github.com/Mandarinka0707/newRepoGOODarhit/internal/entity"
	"github.com/Mandarinka0707/newRepoGOODarhit/internal/repository"
)

var (
	ErrPermissionDenied = errors.New("permission denied")
)

type VacancyUsecaseInterface interface {
	Create(ctx context.Context, vacancy *entity.Vacancy) error
	GetByID(ctx context.Context, id int64) (*entity.Vacancy, error)
	GetAll(ctx context.Context) ([]*entity.Vacancy, error)
	Update(ctx context.Context, vacancy *entity.Vacancy) error
	Delete(ctx context.Context, id int64, employerID int64) error
}

type VacancyUsecase struct {
	vacancyRepo repository.VacancyRepositoryInterface
	userRepo    repository.UserRepositoryInterface
}

func NewVacancyUsecase(vacancyRepo repository.VacancyRepositoryInterface, userRepo repository.UserRepositoryInterface) *VacancyUsecase {
	return &VacancyUsecase{
		vacancyRepo: vacancyRepo,
		userRepo:    userRepo,
	}
}

func (uc *VacancyUsecase) Create(ctx context.Context, vacancy *entity.Vacancy) error {
	fmt.Printf("Checking user with ID %d\n", vacancy.EmployerID)
	user, err := uc.userRepo.GetByID(ctx, vacancy.EmployerID)
	if err != nil {
		fmt.Printf("Error getting user: %v\n", err)
		return err
	}
	if user == nil {
		fmt.Printf("User not found: %d\n", vacancy.EmployerID)
		return ErrPermissionDenied
	}

	fmt.Printf("User found: %+v\n", user)
	if user.Role != "employer" {
		fmt.Printf("User role is not employer: %s\n", user.Role)
		return ErrPermissionDenied
	}

	fmt.Printf("Creating vacancy in repository\n")
	err = uc.vacancyRepo.Create(ctx, vacancy)
	if err != nil {
		fmt.Printf("Error creating vacancy in repository: %v\n", err)
		return err
	}

	fmt.Printf("Vacancy created successfully\n")
	return nil
}

func (uc *VacancyUsecase) GetByID(ctx context.Context, id int64) (*entity.Vacancy, error) {
	return uc.vacancyRepo.GetByID(ctx, id)
}

func (uc *VacancyUsecase) GetAll(ctx context.Context) ([]*entity.Vacancy, error) {
	fmt.Printf("Starting to fetch all vacancies in usecase\n")
	vacancies, err := uc.vacancyRepo.GetAll(ctx)
	if err != nil {
		fmt.Printf("Error in GetAll usecase: %v\n", err)
		return nil, fmt.Errorf("failed to get vacancies: %w", err)
	}
	fmt.Printf("Successfully fetched %d vacancies in usecase\n", len(vacancies))
	return vacancies, nil
}

func (uc *VacancyUsecase) Update(ctx context.Context, vacancy *entity.Vacancy) error {
	fmt.Printf("Starting vacancy update in usecase for ID: %d\n", vacancy.ID)

	// Проверяем существование вакансии
	existingVacancy, err := uc.vacancyRepo.GetByID(ctx, vacancy.ID)
	if err != nil {
		fmt.Printf("Error getting existing vacancy: %v\n", err)
		return err
	}
	if existingVacancy == nil {
		fmt.Printf("Vacancy not found: %d\n", vacancy.ID)
		return fmt.Errorf("vacancy not found")
	}

	// Проверяем права доступа
	if existingVacancy.EmployerID != vacancy.EmployerID {
		fmt.Printf("Permission denied: employer ID mismatch\n")
		return ErrPermissionDenied
	}

	// Проверяем существование работодателя
	user, err := uc.userRepo.GetByID(ctx, vacancy.EmployerID)
	if err != nil {
		fmt.Printf("Error getting user: %v\n", err)
		return err
	}
	if user == nil {
		fmt.Printf("User not found: %d\n", vacancy.EmployerID)
		return ErrPermissionDenied
	}

	if user.Role != "employer" {
		fmt.Printf("User role is not employer: %s\n", user.Role)
		return ErrPermissionDenied
	}

	fmt.Printf("Updating vacancy in repository\n")
	err = uc.vacancyRepo.Update(ctx, vacancy)
	if err != nil {
		fmt.Printf("Error updating vacancy in repository: %v\n", err)
		return err
	}

	fmt.Printf("Vacancy updated successfully\n")
	return nil
}

func (uc *VacancyUsecase) Delete(ctx context.Context, id int64, employerID int64) error {
	fmt.Printf("Starting vacancy deletion in usecase for ID: %d\n", id)

	// Проверяем существование вакансии
	existingVacancy, err := uc.vacancyRepo.GetByID(ctx, id)
	if err != nil {
		fmt.Printf("Error getting existing vacancy: %v\n", err)
		return err
	}
	if existingVacancy == nil {
		fmt.Printf("Vacancy not found: %d\n", id)
		return fmt.Errorf("vacancy not found")
	}

	// Проверяем права доступа
	if existingVacancy.EmployerID != employerID {
		fmt.Printf("Permission denied: employer ID mismatch\n")
		return ErrPermissionDenied
	}

	// Проверяем существование работодателя
	user, err := uc.userRepo.GetByID(ctx, employerID)
	if err != nil {
		fmt.Printf("Error getting user: %v\n", err)
		return err
	}
	if user == nil {
		fmt.Printf("User not found: %d\n", employerID)
		return ErrPermissionDenied
	}

	if user.Role != "employer" {
		fmt.Printf("User role is not employer: %s\n", user.Role)
		return ErrPermissionDenied
	}

	fmt.Printf("Deleting vacancy in repository\n")
	err = uc.vacancyRepo.Delete(ctx, id)
	if err != nil {
		fmt.Printf("Error deleting vacancy in repository: %v\n", err)
		return err
	}

	fmt.Printf("Vacancy deleted successfully\n")
	return nil
}
