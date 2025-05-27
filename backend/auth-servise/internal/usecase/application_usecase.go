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
	GetByEmployerID(ctx context.Context, employerID int64, vacancyIDs []int64) ([]*entity.Application, error)
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
	fmt.Printf("ApplicationUsecase.Create called with application: %+v\n", application)

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
		fmt.Printf("Error getting vacancy: %v\n", err)
		return fmt.Errorf("failed to get vacancy: %w", err)
	}
	if vacancy == nil {
		fmt.Printf("Vacancy not found with ID: %d\n", application.VacancyID)
		return fmt.Errorf("vacancy not found")
	}

	fmt.Printf("Found vacancy: %+v\n", vacancy)

	// Проверяем существование резюме
	resume, err := uc.resumeRepo.GetResumeByID(ctx, application.ResumeID)
	if err != nil {
		fmt.Printf("Error getting resume: %v\n", err)
		return fmt.Errorf("failed to get resume: %w", err)
	}
	if resume == nil {
		fmt.Printf("Resume not found with ID: %d\n", application.ResumeID)
		return fmt.Errorf("resume not found")
	}

	fmt.Printf("Found resume: %+v\n", resume)

	// Проверяем, что резюме принадлежит пользователю
	if resume.UserID != application.UserID {
		fmt.Printf("Resume user ID (%d) does not match application user ID (%d)\n", resume.UserID, application.UserID)
		return fmt.Errorf("resume does not belong to user")
	}

	// Проверяем, что пользователь еще не откликался на эту вакансию
	existingApplications, err := uc.applicationRepo.GetAll(ctx, application.UserID)
	if err != nil {
		fmt.Printf("Error getting existing applications: %v\n", err)
		return fmt.Errorf("failed to get existing applications: %w", err)
	}

	for _, existingApp := range existingApplications {
		if existingApp.VacancyID == application.VacancyID {
			fmt.Printf("User already has an application for this vacancy: %+v\n", existingApp)
			return fmt.Errorf("user already applied for this vacancy")
		}
	}

	fmt.Printf("No existing application found, creating new one\n")

	// Создаем отклик
	if err := uc.applicationRepo.Create(ctx, application); err != nil {
		fmt.Printf("Error creating application in repository: %v\n", err)
		return fmt.Errorf("failed to create application: %w", err)
	}

	fmt.Printf("Application created successfully: %+v\n", application)
	return nil
}

func (uc *ApplicationUsecase) GetByID(ctx context.Context, id int64) (*entity.Application, error) {
	return uc.applicationRepo.GetByID(ctx, id)
}

func (uc *ApplicationUsecase) GetAll(ctx context.Context, userID int64) ([]*entity.Application, error) {
	return uc.applicationRepo.GetAll(ctx, userID)
}

func (uc *ApplicationUsecase) GetByEmployerID(ctx context.Context, employerID int64, vacancyIDs []int64) ([]*entity.Application, error) {
	fmt.Printf("GetByEmployerID: Starting with employerID=%d, vacancyIDs=%v\n", employerID, vacancyIDs)

	// Получаем все вакансии работодателя
	vacancies, err := uc.vacancyRepo.GetByEmployerID(ctx, employerID)
	if err != nil {
		return nil, fmt.Errorf("failed to get employer vacancies: %w", err)
	}
	fmt.Printf("GetByEmployerID: Found %d vacancies for employer\n", len(vacancies))

	// Если указаны конкретные vacancy_ids, фильтруем вакансии
	if len(vacancyIDs) > 0 {
		filteredVacancies := make([]*entity.Vacancy, 0)
		for _, v := range vacancies {
			for _, id := range vacancyIDs {
				if v.ID == id {
					filteredVacancies = append(filteredVacancies, v)
					break
				}
			}
		}
		vacancies = filteredVacancies
		fmt.Printf("GetByEmployerID: Filtered to %d vacancies\n", len(vacancies))
	}

	// Получаем все отклики для этих вакансий
	var allApplications []*entity.Application
	for _, vacancy := range vacancies {
		fmt.Printf("GetByEmployerID: Getting applications for vacancy ID=%d\n", vacancy.ID)
		applications, err := uc.applicationRepo.GetByVacancyID(ctx, vacancy.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to get applications for vacancy %d: %w", vacancy.ID, err)
		}
		fmt.Printf("GetByEmployerID: Found %d applications for vacancy ID=%d\n", len(applications), vacancy.ID)
		allApplications = append(allApplications, applications...)
	}
	fmt.Printf("GetByEmployerID: Total applications found: %d\n", len(allApplications))

	// Получаем информацию о пользователях для каждого отклика
	for _, application := range allApplications {
		user, err := uc.userRepo.GetByID(ctx, application.UserID)
		if err != nil {
			return nil, fmt.Errorf("failed to get user info for application %d: %w", application.ID, err)
		}
		if user != nil {
			application.ApplicantName = user.Name
			application.ApplicantEmail = user.Email
		}

		// Получаем информацию о резюме
		resume, err := uc.resumeRepo.GetResumeByID(ctx, application.ResumeID)
		if err != nil {
			return nil, fmt.Errorf("failed to get resume info for application %d: %w", application.ID, err)
		}
		if resume != nil {
			application.Resume = resume
		}
	}

	return allApplications, nil
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
