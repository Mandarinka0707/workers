package controller

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/Mandarinka0707/newRepoGOODarhit/internal/entity"
	"github.com/Mandarinka0707/newRepoGOODarhit/internal/usecase"
	"github.com/gin-gonic/gin"
)

type ResumeController struct {
	uc usecase.ResumeUsecaseInterface
}

func NewResumeController(uc usecase.ResumeUsecaseInterface) *ResumeController {
	return &ResumeController{uc: uc}
}

type CreateResumeRequest struct {
	Title       string   `json:"title" binding:"required"`
	Description string   `json:"description" binding:"required"`
	Skills      []string `json:"skills" binding:"required"`
	Experience  string   `json:"experience" binding:"required"`
	Education   string   `json:"education" binding:"required"`
}

type UpdateResumeRequest struct {
	Title       string   `json:"title" binding:"required"`
	Description string   `json:"description" binding:"required"`
	Skills      []string `json:"skills" binding:"required"`
	Experience  string   `json:"experience" binding:"required"`
	Education   string   `json:"education" binding:"required"`
	Status      string   `json:"status" binding:"required"`
}

func (c *ResumeController) CreateResume(ctx *gin.Context) {
	var req CreateResumeRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	resume := &entity.Resume{
		UserID:      userID.(int64),
		Title:       req.Title,
		Description: req.Description,
		Skills:      req.Skills,
		Experience:  req.Experience,
		Education:   req.Education,
		Status:      "active",
	}

	if err := c.uc.CreateResume(ctx, resume); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, resume)
}

func (c *ResumeController) GetResume(ctx *gin.Context) {
	id, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		fmt.Printf("Error parsing resume ID: %v\n", err)
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	fmt.Printf("Fetching resume with ID: %d\n", id)
	resume, err := c.uc.GetResume(ctx, id)
	if err != nil {
		fmt.Printf("Error fetching resume: %v\n", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to get resume: %v", err)})
		return
	}
	if resume == nil {
		fmt.Printf("Resume not found with ID: %d\n", id)
		ctx.JSON(http.StatusNotFound, gin.H{"error": "resume not found"})
		return
	}

	fmt.Printf("Successfully fetched resume: %+v\n", resume)
	ctx.JSON(http.StatusOK, resume)
}

func (c *ResumeController) GetUserResumes(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	resumes, err := c.uc.GetUserResumes(ctx, userID.(int64))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, resumes)
}

func (c *ResumeController) UpdateResume(ctx *gin.Context) {
	id, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req CreateResumeRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	resume := &entity.Resume{
		ID:          id,
		UserID:      userID.(int64),
		Title:       req.Title,
		Description: req.Description,
		Skills:      req.Skills,
		Experience:  req.Experience,
		Education:   req.Education,
		Status:      "active",
	}

	if err := c.uc.UpdateResume(ctx, resume); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, resume)
}

func (c *ResumeController) DeleteResume(ctx *gin.Context) {
	id, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := c.uc.DeleteResume(ctx, id); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "resume deleted successfully"})
}

func (c *ResumeController) GetAllResumes(ctx *gin.Context) {
	resumes, err := c.uc.GetAllResumes(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to get resumes: %v", err)})
		return
	}

	ctx.JSON(http.StatusOK, resumes)
}
