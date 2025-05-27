// controller/auth_http.go
package controller

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/Mandarinka0707/newRepoGOODarhit/internal/usecase"
	"github.com/gin-gonic/gin"
)

type HTTPAuthController struct {
	uc usecase.AuthUsecaseInterface
}

func NewHTTPAuthController(uc usecase.AuthUsecaseInterface) *HTTPAuthController {
	return &HTTPAuthController{uc: uc}
}

type HTTPRegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Name     string `json:"name" binding:"required"`
	Role     string `json:"role" binding:"required,oneof=jobseeker employer"`
}

type HTTPLoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Register регистрирует пользователя через HTTP
// @Summary Регистрация пользователя
// @Description Регистрирует нового пользователя
// @Tags auth
// @Accept json
// @Produce json
// @Param request body HTTPRegisterRequest true "Данные для регистрации"
// @Success 200 {object} map[string]interface{} "token"
// @Failure 400 {object} entity.ErrorResponse
// @Failure 500 {object} entity.ErrorResponse
// @Router /api/v1/auth/register [post]
func (c *HTTPAuthController) Register(ctx *gin.Context) {
	var req HTTPRegisterRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := c.uc.Register(ctx, &usecase.RegisterRequest{
		Email:    req.Email,
		Password: req.Password,
		Name:     req.Name,
		Role:     req.Role,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"id":        user.ID,
		"email":     user.Email,
		"name":      user.Name,
		"role":      user.Role,
		"createdAt": user.CreatedAt,
	})
}

// Login выполняет аутентификацию пользователя
// @Summary Аутентификация пользователя
// @Description Вход в систему с логином и паролем
// @Tags auth
// @Accept json
// @Produce json
// @Param request body HTTPLoginRequest true "Данные для входа"
// @Success 200 {object} map[string]interface{} "token"
// @Failure 400 {object} entity.ErrorResponse
// @Failure 500 {object} entity.ErrorResponse
// @Router /api/v1/auth/login [post]
func (c *HTTPAuthController) Login(ctx *gin.Context) {
	fmt.Printf("=== Login attempt started ===\n")

	var req HTTPLoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		fmt.Printf("Error binding JSON: %v\n", err)
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	fmt.Printf("Login request received for email: %s\n", req.Email)
	fmt.Printf("Request body: %+v\n", req)

	ucReq := &usecase.LoginRequest{
		Email:    req.Email,
		Password: req.Password,
	}

	fmt.Printf("Calling usecase.Login with input: %+v\n", ucReq)

	ucResp, err := c.uc.Login(ctx.Request.Context(), ucReq)
	if err != nil {
		fmt.Printf("Login error from usecase: %v\n", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	fmt.Printf("Login successful, token generated\n")
	ctx.JSON(http.StatusOK, gin.H{
		"token": ucResp.Token,
		"user":  ucResp.User,
	})
}

// GetUser получает информацию о пользователе
// @Summary Получить данные пользователя
// @Description Возвращает информацию о пользователе по ID
// @Tags auth
// @Accept json
// @Produce json
// @Param id path string true "ID пользователя"
// @Success 200 {object} map[string]interface{} "Данные пользователя"
// @Failure 404 {object} entity.ErrorResponse
// @Failure 500 {object} entity.ErrorResponse
// @Router /api/v1/auth/user/{id} [get]
func (ctrl *HTTPAuthController) GetUser(ctx *gin.Context) {
	userIDStr := ctx.Param("id")
	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	user, err := ctrl.uc.GetUser(ctx.Request.Context(), &usecase.GetUserRequest{ID: userID})
	if err != nil || user == nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"id":        user.ID,
		"email":     user.Email,
		"name":      user.Name,
		"role":      user.Role,
		"createdAt": user.CreatedAt,
		"updatedAt": user.UpdatedAt,
	})
}

func (c *HTTPAuthController) AuthMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		authHeader := ctx.GetHeader("Authorization")
		if authHeader == "" {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "authorization header is required"})
			ctx.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization header format"})
			ctx.Abort()
			return
		}

		token := parts[1]
		userID, err := c.uc.ValidateToken(ctx, &usecase.ValidateTokenRequest{Token: token})
		if err != nil {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			ctx.Abort()
			return
		}

		// Устанавливаем user_id в контекст
		ctx.Set("user_id", userID)
		ctx.Next()
	}
}

func (c *HTTPAuthController) GetProfile(ctx *gin.Context) {
	userID := ctx.GetInt64("user_id")
	if userID == 0 {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	user, err := c.uc.GetUserByID(ctx, userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get user profile"})
		return
	}

	if user == nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"id":        user.ID,
		"email":     user.Email,
		"name":      user.Name,
		"role":      user.Role,
		"createdAt": user.CreatedAt,
		"updatedAt": user.UpdatedAt,
	})
}

func (c *HTTPAuthController) Logout(ctx *gin.Context) {
	// В текущей реализации просто возвращаем успешный ответ
	ctx.JSON(http.StatusOK, gin.H{"message": "Successfully logged out"})
}

func (c *HTTPAuthController) UpdateProfile(ctx *gin.Context) {
	userID := ctx.GetInt64("user_id")
	if userID == 0 {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req struct {
		Name  string `json:"name"`
		Email string `json:"email"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := c.uc.GetUserByID(ctx, userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get user profile"})
		return
	}

	if user == nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	// Сохраняем текущие значения
	currentRole := user.Role
	currentPassword := user.Password

	// Обновляем только разрешенные поля
	user.Name = req.Name
	user.Email = req.Email
	// Восстанавливаем роль и пароль
	user.Role = currentRole
	user.Password = currentPassword

	// Обновляем пользователя в базе данных
	if err := c.uc.Update(ctx.Request.Context(), user); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update user"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"id":        user.ID,
		"email":     user.Email,
		"name":      user.Name,
		"role":      user.Role,
		"createdAt": user.CreatedAt,
		"updatedAt": user.UpdatedAt,
	})
}
