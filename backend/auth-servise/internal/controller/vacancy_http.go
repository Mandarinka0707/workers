package controller

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/Mandarinka0707/newRepoGOODarhit/internal/entity"
	"github.com/Mandarinka0707/newRepoGOODarhit/internal/usecase"
	"github.com/gin-gonic/gin"
)

type VacancyController struct {
	uc usecase.VacancyUsecaseInterface
}

func NewVacancyController(uc usecase.VacancyUsecaseInterface) *VacancyController {
	return &VacancyController{uc: uc}
}

type CreateVacancyRequest struct {
	Title            string   `json:"title" binding:"required"`
	Description      string   `json:"description" binding:"required"`
	Requirements     string   `json:"requirements" binding:"required"`
	Responsibilities string   `json:"responsibilities" binding:"required"`
	Salary           int      `json:"salary" binding:"required"`
	Location         string   `json:"location" binding:"required"`
	EmploymentType   string   `json:"employmentType" binding:"required"`
	Company          string   `json:"company" binding:"required"`
	Skills           []string `json:"skills"`
	Education        string   `json:"education"`
}

type UpdateVacancyRequest struct {
	Title            string   `json:"title" binding:"required"`
	Description      string   `json:"description" binding:"required"`
	Requirements     string   `json:"requirements" binding:"required"`
	Responsibilities string   `json:"responsibilities" binding:"required"`
	Salary           int      `json:"salary" binding:"required"`
	Location         string   `json:"location" binding:"required"`
	EmploymentType   string   `json:"employmentType" binding:"required"`
	Company          string   `json:"company" binding:"required"`
	Skills           []string `json:"skills"`
	Education        string   `json:"education"`
	Status           string   `json:"status" binding:"required"`
}

// Create godoc
// @Summary Создать новую вакансию
// @Description Создает новую вакансию в системе
// @Tags vacancies
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param Authorization header string true "Bearer token"
// @Param request body CreateVacancyRequest true "Данные вакансии"
// @Success 201 {object} entity.Vacancy
// @Failure 400 {object} entity.ErrorResponse
// @Failure 401 {object} entity.ErrorResponse
// @Failure 403 {object} entity.ErrorResponse
// @Failure 500 {object} entity.ErrorResponse
// @Router /api/v1/vacancies [post]
func (c *VacancyController) Create(ctx *gin.Context) {
	var req CreateVacancyRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		fmt.Printf("Error binding JSON: %v\n", err)
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	employerID, exists := ctx.Get("user_id")
	if !exists {
		fmt.Printf("Unauthorized: user_id not found in context\n")
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	fmt.Printf("Creating vacancy for employer %v with data: %+v\n", employerID, req)

	vacancy := &entity.Vacancy{
		EmployerID:       employerID.(int64),
		Title:            req.Title,
		Description:      req.Description,
		Requirements:     req.Requirements,
		Responsibilities: req.Responsibilities,
		Salary:           req.Salary,
		Location:         req.Location,
		EmploymentType:   req.EmploymentType,
		Company:          req.Company,
		Status:           "active",
		Skills:           req.Skills,
		Education:        req.Education,
	}

	if err := c.uc.Create(ctx.Request.Context(), vacancy); err != nil {
		fmt.Printf("Error creating vacancy: %v\n", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to create vacancy: %v", err)})
		return
	}

	fmt.Printf("Successfully created vacancy with ID: %d\n", vacancy.ID)
	ctx.JSON(http.StatusCreated, vacancy)
}

// GetByID godoc
// @Summary Получить вакансию по ID
// @Description Возвращает информацию о вакансии по её ID
// @Tags vacancies
// @Accept json
// @Produce json
// @Param id path string true "ID вакансии"
// @Success 200 {object} entity.Vacancy
// @Failure 400 {object} entity.ErrorResponse
// @Failure 404 {object} entity.ErrorResponse
// @Failure 500 {object} entity.ErrorResponse
// @Router /api/v1/vacancies/{id} [get]
func (c *VacancyController) GetByID(ctx *gin.Context) {
	id, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	vacancy, err := c.uc.GetByID(ctx.Request.Context(), id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "vacancy not found"})
		return
	}

	ctx.JSON(http.StatusOK, vacancy)
}

// GetAll godoc
// @Summary Получить все вакансии
// @Description Возвращает список всех вакансий
// @Tags vacancies
// @Accept json
// @Produce json
// @Success 200 {array} entity.Vacancy
// @Failure 500 {object} entity.ErrorResponse
// @Router /api/v1/vacancies [get]
func (c *VacancyController) GetAll(ctx *gin.Context) {
	fmt.Printf("Starting to fetch all vacancies\n")
	vacancies, err := c.uc.GetAll(ctx.Request.Context())
	if err != nil {
		fmt.Printf("Error in GetAll controller: %v\n", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("failed to get vacancies: %v", err),
		})
		return
	}

	fmt.Printf("Successfully fetched %d vacancies\n", len(vacancies))
	ctx.JSON(http.StatusOK, vacancies)
}

// Update godoc
// @Summary Обновить вакансию
// @Description Обновляет существующую вакансию
// @Tags vacancies
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param Authorization header string true "Bearer token"
// @Param id path string true "ID вакансии"
// @Param request body UpdateVacancyRequest true "Данные вакансии"
// @Success 200 {object} entity.Vacancy
// @Failure 400 {object} entity.ErrorResponse
// @Failure 401 {object} entity.ErrorResponse
// @Failure 403 {object} entity.ErrorResponse
// @Failure 404 {object} entity.ErrorResponse
// @Failure 500 {object} entity.ErrorResponse
// @Router /api/v1/vacancies/{id} [put]
func (c *VacancyController) Update(ctx *gin.Context) {
	id, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req UpdateVacancyRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		fmt.Printf("Error binding JSON: %v\n", err)
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	employerID, exists := ctx.Get("user_id")
	if !exists {
		fmt.Printf("Unauthorized: user_id not found in context\n")
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	fmt.Printf("Updating vacancy %d for employer %v with data: %+v\n", id, employerID, req)

	vacancy := &entity.Vacancy{
		ID:               id,
		EmployerID:       employerID.(int64),
		Title:            req.Title,
		Description:      req.Description,
		Requirements:     req.Requirements,
		Responsibilities: req.Responsibilities,
		Salary:           req.Salary,
		Location:         req.Location,
		EmploymentType:   req.EmploymentType,
		Company:          req.Company,
		Status:           req.Status,
		Skills:           req.Skills,
		Education:        req.Education,
	}

	if err := c.uc.Update(ctx.Request.Context(), vacancy); err != nil {
		fmt.Printf("Error updating vacancy: %v\n", err)
		if err == usecase.ErrPermissionDenied {
			ctx.JSON(http.StatusForbidden, gin.H{"error": "permission denied"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to update vacancy: %v", err)})
		return
	}

	fmt.Printf("Successfully updated vacancy with ID: %d\n", vacancy.ID)
	ctx.JSON(http.StatusOK, vacancy)
}

func (c *VacancyController) Delete(ctx *gin.Context) {
	id, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	employerID, exists := ctx.Get("user_id")
	if !exists {
		fmt.Printf("Unauthorized: user_id not found in context\n")
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	fmt.Printf("Deleting vacancy %d for employer %v\n", id, employerID)

	if err := c.uc.Delete(ctx.Request.Context(), id, employerID.(int64)); err != nil {
		fmt.Printf("Error deleting vacancy: %v\n", err)
		if err == usecase.ErrPermissionDenied {
			ctx.JSON(http.StatusForbidden, gin.H{"error": "permission denied"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to delete vacancy: %v", err)})
		return
	}

	fmt.Printf("Successfully deleted vacancy with ID: %d\n", id)
	ctx.JSON(http.StatusOK, gin.H{"message": "vacancy deleted successfully"})
}
