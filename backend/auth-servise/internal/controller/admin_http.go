package controller

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/Mandarinka0707/newRepoGOODarhit/internal/usecase"
	"github.com/gin-gonic/gin"
)

type AdminController struct {
	userUsecase    usecase.UserUsecaseInterface
	vacancyUsecase usecase.VacancyUsecaseInterface
	resumeUsecase  usecase.ResumeUsecaseInterface
}

func NewAdminController(
	userUsecase usecase.UserUsecaseInterface,
	vacancyUsecase usecase.VacancyUsecaseInterface,
	resumeUsecase usecase.ResumeUsecaseInterface,
) *AdminController {
	return &AdminController{
		userUsecase:    userUsecase,
		vacancyUsecase: vacancyUsecase,
		resumeUsecase:  resumeUsecase,
	}
}

// GetAllUsers returns all users in the system
func (c *AdminController) GetAllUsers(ctx *gin.Context) {
	users, err := c.userUsecase.GetAll(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, users)
}

// DeleteUser deletes a user by ID
func (c *AdminController) DeleteUser(ctx *gin.Context) {
	id, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	if err := c.userUsecase.Delete(ctx, id); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.Status(http.StatusNoContent)
}

// DeleteVacancy deletes a vacancy by ID
func (c *AdminController) DeleteVacancy(ctx *gin.Context) {
	id, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid vacancy id"})
		return
	}

	// For admin, we pass 0 as employerID to bypass the ownership check
	if err := c.vacancyUsecase.Delete(ctx, id, 0); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.Status(http.StatusNoContent)
}

// DeleteResume deletes a resume by ID
func (c *AdminController) DeleteResume(ctx *gin.Context) {
	id, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid resume id"})
		return
	}

	if err := c.resumeUsecase.Delete(ctx, id); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.Status(http.StatusNoContent)
}

// GetUserStats returns statistics about users
func (c *AdminController) GetStats(ctx *gin.Context) {
	stats, err := c.userUsecase.GetStats(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, stats)
}

func (c *AdminController) GetAllVacancies(ctx *gin.Context) {
	fmt.Printf("AdminController.GetAllVacancies: Starting to fetch all vacancies\n")
	vacancies, err := c.vacancyUsecase.GetAll(ctx)
	if err != nil {
		fmt.Printf("AdminController.GetAllVacancies: Error fetching vacancies: %v\n", err)
		ctx.JSON(500, gin.H{"error": err.Error()})
		return
	}
	fmt.Printf("AdminController.GetAllVacancies: Successfully fetched %d vacancies\n", len(vacancies))
	ctx.JSON(200, vacancies)
}

func (c *AdminController) GetAllResumes(ctx *gin.Context) {
	resumes, err := c.resumeUsecase.GetAll(ctx)
	if err != nil {
		ctx.JSON(500, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(200, resumes)
}
