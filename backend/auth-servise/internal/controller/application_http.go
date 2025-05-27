package controller

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/Mandarinka0707/newRepoGOODarhit/internal/entity"
	"github.com/Mandarinka0707/newRepoGOODarhit/internal/usecase"
	"github.com/gin-gonic/gin"
)

type ApplicationController struct {
	applicationUsecase usecase.ApplicationUsecaseInterface
}

func NewApplicationController(applicationUsecase usecase.ApplicationUsecaseInterface) *ApplicationController {
	return &ApplicationController{
		applicationUsecase: applicationUsecase,
	}
}

type CreateApplicationRequest struct {
	VacancyID int64 `json:"vacancy_id" binding:"required"`
	ResumeID  int64 `json:"resume_id" binding:"required"`
}

func (c *ApplicationController) Create(ctx *gin.Context) {
	var req CreateApplicationRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		fmt.Printf("Error binding JSON: %v\n", err)
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fmt.Printf("Received create application request: %+v\n", req)

	userID, exists := ctx.Get("user_id")
	if !exists {
		fmt.Println("User ID not found in context")
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	fmt.Printf("User ID from context: %v\n", userID)

	application := &entity.Application{
		UserID:    userID.(int64),
		VacancyID: req.VacancyID,
		ResumeID:  req.ResumeID,
		Status:    "pending",
	}

	fmt.Printf("Creating application: %+v\n", application)

	if err := c.applicationUsecase.Create(ctx, application); err != nil {
		fmt.Printf("Error creating application: %v\n", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	fmt.Printf("Application created successfully: %+v\n", application)
	ctx.JSON(http.StatusCreated, application)
}

func (c *ApplicationController) GetByID(ctx *gin.Context) {
	id, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	application, err := c.applicationUsecase.GetByID(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if application == nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "application not found"})
		return
	}

	ctx.JSON(http.StatusOK, application)
}

func (c *ApplicationController) GetAll(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// Получаем параметры запроса
	employerID := ctx.Query("employer_id")
	vacancyIDs := ctx.Query("vacancy_ids")

	var applications []*entity.Application
	var err error

	if employerID != "" {
		// Если указан employer_id, получаем отклики для вакансий работодателя
		employerIDInt, err := strconv.ParseInt(employerID, 10, 64)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid employer_id"})
			return
		}

		var vacancyIDsInt []int64
		if vacancyIDs != "" {
			// Если указаны vacancy_ids, разбиваем строку на массив
			for _, id := range strings.Split(vacancyIDs, ",") {
				idInt, err := strconv.ParseInt(strings.TrimSpace(id), 10, 64)
				if err != nil {
					ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid vacancy_ids"})
					return
				}
				vacancyIDsInt = append(vacancyIDsInt, idInt)
			}
		}

		applications, err = c.applicationUsecase.GetByEmployerID(ctx, employerIDInt, vacancyIDsInt)
	} else {
		// Иначе получаем отклики текущего пользователя
		applications, err = c.applicationUsecase.GetAll(ctx, userID.(int64))
	}

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, applications)
}

type UpdateStatusRequest struct {
	Status string `json:"status" binding:"required"`
}

func (c *ApplicationController) UpdateStatus(ctx *gin.Context) {
	id, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req UpdateStatusRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if err := c.applicationUsecase.UpdateStatus(ctx, id, userID.(int64), req.Status); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "status updated successfully"})
}
