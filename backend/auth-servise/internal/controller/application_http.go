package controller

import (
	"net/http"
	"strconv"

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
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	application := &entity.Application{
		UserID:    userID.(int64),
		VacancyID: req.VacancyID,
		ResumeID:  req.ResumeID,
		Status:    "pending",
	}

	if err := c.applicationUsecase.Create(ctx, application); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

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

	applications, err := c.applicationUsecase.GetAll(ctx, userID.(int64))
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
