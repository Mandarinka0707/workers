package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/Mandarinka0707/newRepoGOODarhit/internal/controller"
	"github.com/Mandarinka0707/newRepoGOODarhit/internal/middleware"
	"github.com/Mandarinka0707/newRepoGOODarhit/internal/repository"
	"github.com/Mandarinka0707/newRepoGOODarhit/internal/usecase"
	"github.com/gin-gonic/gin"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/jmoiron/sqlx"
	_ "github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"go.uber.org/zap"
)

// @title           Auth Service API
// @version         1.0
// @description     Authentication and authorization service for the forum
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.url    http://www.swagger.io/support
// @contact.email  support@swagger.io

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:8080

// @securityDefinitions.basic  BasicAuth
// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name Authorization
var (
	httpPort        = flag.String("http-port", ":8080", "HTTP server port")
	dbURL           = flag.String("db-url", "postgres://postgres:postgres@localhost:5432/job_search_platform?sslmode=disable", "Database URL")
	migrationsPath  = flag.String("migrations-path", "../migrations", "Path to migrations")
	tokenExpiration = flag.Duration("token-expiration", 24*time.Hour, "JWT token expiration")
	logLevel        = flag.String("log-level", "info", "Logging level")
)

func main() {
	// Initialize logger
	logger, err := zap.NewProduction()
	if err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}
	defer logger.Sync()

	// Database connection
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5432/job_search_platform?sslmode=disable"
	}

	db, err := sqlx.Connect("postgres", dbURL)
	if err != nil {
		logger.Fatal("Failed to connect to database", zap.Error(err))
	}
	defer db.Close()

	// Run migrations
	migrationsPath := os.Getenv("MIGRATIONS_PATH")
	if migrationsPath == "" {
		migrationsPath = "../migrations"
	}
	if err := runMigrations(dbURL, migrationsPath, logger); err != nil {
		logger.Fatal("Failed to run migrations", zap.Error(err))
	}

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	vacancyRepo := repository.NewVacancyRepository(db)
	resumeRepo := repository.NewResumeRepository(db)
	applicationRepo := repository.NewApplicationRepository(db)

	// Initialize use cases
	tokenSecret := os.Getenv("JWT_SECRET")
	if tokenSecret == "" {
		tokenSecret = "your-secret-key"
	}

	authConfig := &usecase.Config{
		TokenSecret:     tokenSecret,
		TokenExpiration: 24 * time.Hour,
	}
	userConfig := &usecase.UserConfig{
		TokenSecret:     tokenSecret,
		TokenExpiration: 24 * time.Hour,
	}
	authUsecase := usecase.NewAuthUsecase(userRepo, authConfig, logger)
	userUsecase := usecase.NewUserUsecase(userRepo, userConfig)
	vacancyUsecase := usecase.NewVacancyUsecase(vacancyRepo, userRepo)
	resumeUsecase := usecase.NewResumeUsecase(resumeRepo, userRepo)
	applicationUsecase := usecase.NewApplicationUsecase(applicationRepo, userRepo, vacancyRepo, resumeRepo)

	// Initialize controllers
	authController := controller.NewHTTPAuthController(authUsecase)
	userController := controller.NewUserController(userUsecase)
	vacancyController := controller.NewVacancyController(vacancyUsecase)
	resumeController := controller.NewResumeController(resumeUsecase)
	applicationController := controller.NewApplicationController(applicationUsecase)

	// Initialize router
	router := gin.Default()

	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// API routes
	api := router.Group("/api/v1")
	{
		// Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authController.Register)
			auth.POST("/login", authController.Login)
		}

		// User routes
		users := api.Group("/users")
		users.Use(middleware.AuthMiddleware(tokenSecret))
		{
			users.GET("/me", userController.GetMe)
			users.PUT("/me", userController.UpdateMe)
		}

		// Vacancy routes
		vacancies := api.Group("/vacancies")
		vacancies.Use(middleware.AuthMiddleware(tokenSecret))
		{
			vacancies.POST("", vacancyController.Create)
			vacancies.GET("", vacancyController.GetAll)
			vacancies.GET("/:id", vacancyController.GetByID)
			vacancies.PUT("/:id", vacancyController.Update)
			vacancies.DELETE("/:id", vacancyController.Delete)
		}

		// Resume routes
		resumes := api.Group("/resumes")
		resumes.Use(middleware.AuthMiddleware(tokenSecret))
		{
			resumes.POST("", resumeController.CreateResume)
			resumes.GET("", resumeController.GetAllResumes)
			resumes.GET("/my", resumeController.GetUserResumes)
			resumes.GET("/:id", resumeController.GetResume)
			resumes.PUT("/:id", resumeController.UpdateResume)
			resumes.DELETE("/:id", resumeController.DeleteResume)
		}

		// Application routes
		applications := api.Group("/applications")
		applications.Use(middleware.AuthMiddleware(tokenSecret))
		{
			applications.POST("", applicationController.Create)
			applications.GET("", applicationController.GetAll)
			applications.GET("/:id", applicationController.GetByID)
			applications.PUT("/:id/status", applicationController.UpdateStatus)
		}
	}

	// Swagger documentation
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	logger.Info("Starting server", zap.String("port", port))
	if err := router.Run(":" + port); err != nil {
		logger.Fatal("Failed to start server", zap.Error(err))
	}
}

func runMigrations(dbURL, migrationsPath string, logger *zap.Logger) error {
	m, err := migrate.New(
		"file://"+migrationsPath,
		dbURL,
	)
	if err != nil {
		return fmt.Errorf("failed to create migrate instance: %w", err)
	}
	defer m.Close()

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	return nil
}
