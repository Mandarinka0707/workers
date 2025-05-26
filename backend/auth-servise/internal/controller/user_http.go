package controller

import (
	"net/http"

	"github.com/Mandarinka0707/newRepoGOODarhit/internal/entity"
	"github.com/Mandarinka0707/newRepoGOODarhit/internal/usecase"
	"github.com/gin-gonic/gin"
)

type UserController struct {
	uc usecase.UserUsecaseInterface
}

func NewUserController(uc usecase.UserUsecaseInterface) *UserController {
	return &UserController{uc: uc}
}

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Name     string `json:"name" binding:"required"`
	Role     string `json:"role" binding:"required,oneof=employer jobseeker"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Register godoc
// @Summary Регистрация нового пользователя
// @Description Создает нового пользователя в системе
// @Tags auth
// @Accept json
// @Produce json
// @Param request body RegisterRequest true "Данные пользователя"
// @Success 201 {object} entity.User
// @Failure 400 {object} entity.ErrorResponse
// @Failure 500 {object} entity.ErrorResponse
// @Router /api/v1/auth/register [post]
func (c *UserController) Register(ctx *gin.Context) {
	var req RegisterRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user := &entity.User{
		Email:    req.Email,
		Password: req.Password,
		Name:     req.Name,
		Role:     req.Role,
	}

	if err := c.uc.Register(ctx.Request.Context(), user); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to register user"})
		return
	}

	ctx.JSON(http.StatusCreated, user)
}

// Login godoc
// @Summary Вход в систему
// @Description Аутентифицирует пользователя
// @Tags auth
// @Accept json
// @Produce json
// @Param request body LoginRequest true "Данные для входа"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} entity.ErrorResponse
// @Failure 401 {object} entity.ErrorResponse
// @Failure 500 {object} entity.ErrorResponse
// @Router /api/v1/auth/login [post]
func (c *UserController) Login(ctx *gin.Context) {
	var req LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	token, err := c.uc.Login(ctx.Request.Context(), req.Email, req.Password)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"token": token})
}

// Logout godoc
// @Summary Выход из системы
// @Description Деактивирует текущий токен пользователя
// @Tags auth
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param Authorization header string true "Bearer token"
// @Success 200 {object} map[string]string
// @Failure 401 {object} entity.ErrorResponse
// @Failure 500 {object} entity.ErrorResponse
// @Router /api/v1/auth/logout [post]
func (c *UserController) Logout(ctx *gin.Context) {
	token := ctx.GetHeader("Authorization")
	if token == "" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if err := c.uc.Logout(ctx.Request.Context(), token); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to logout"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "successfully logged out"})
}

// GetMe godoc
// @Summary Получить информацию о текущем пользователе
// @Description Возвращает информацию о текущем авторизованном пользователе
// @Tags users
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param Authorization header string true "Bearer token"
// @Success 200 {object} entity.User
// @Failure 401 {object} entity.ErrorResponse
// @Failure 500 {object} entity.ErrorResponse
// @Router /api/v1/users/me [get]
func (c *UserController) GetMe(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	user, err := c.uc.GetByID(ctx.Request.Context(), userID.(int64))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get user"})
		return
	}

	ctx.JSON(http.StatusOK, user)
}

// UpdateMe godoc
// @Summary Обновить информацию о текущем пользователе
// @Description Обновляет информацию о текущем авторизованном пользователе
// @Tags users
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param Authorization header string true "Bearer token"
// @Param request body entity.User true "Данные пользователя"
// @Success 200 {object} entity.User
// @Failure 400 {object} entity.ErrorResponse
// @Failure 401 {object} entity.ErrorResponse
// @Failure 500 {object} entity.ErrorResponse
// @Router /api/v1/users/me [put]
func (c *UserController) UpdateMe(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var user entity.User
	if err := ctx.ShouldBindJSON(&user); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user.ID = userID.(int64)
	if err := c.uc.Update(ctx.Request.Context(), &user); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update user"})
		return
	}

	ctx.JSON(http.StatusOK, user)
}
