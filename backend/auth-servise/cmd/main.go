package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/Mandarinka0707/newRepoGOODarhit/internal/config"
	"github.com/Mandarinka0707/newRepoGOODarhit/internal/controller"
	"github.com/Mandarinka0707/newRepoGOODarhit/internal/middleware"
	"github.com/Mandarinka0707/newRepoGOODarhit/internal/repository"
	"github.com/Mandarinka0707/newRepoGOODarhit/internal/usecase"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/jmoiron/sqlx"
	_ "github.com/jmoiron/sqlx"
	"github.com/joho/godotenv"
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
	if err := godotenv.Load(); err != nil {
		log.Printf("No .env file found")
	}

	cfg, err := config.NewConfig()
	if err != nil {
		log.Fatalf("Config error: %s", err)
	}

	// Initialize logger
	logger, err := zap.NewProduction()
	if err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}
	defer logger.Sync()

	// Database connection
	db, err := sqlx.Connect("postgres", cfg.DBURL)
	if err != nil {
		logger.Fatal("Failed to connect to database", zap.Error(err))
	}
	defer db.Close()

	// Run migrations
	migrationsPath := os.Getenv("MIGRATIONS_PATH")
	if migrationsPath == "" {
		migrationsPath = "migrations"
	}
	if err := runMigrations(cfg.DBURL, migrationsPath, logger); err != nil {
		logger.Fatal("Failed to run migrations", zap.Error(err))
	}

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	vacancyRepo := repository.NewVacancyRepository(db)
	resumeRepo := repository.NewResumeRepository(db)
	applicationRepo := repository.NewApplicationRepository(db)

	// Initialize use cases
	authConfig := &usecase.Config{
		TokenSecret:     cfg.TokenSecret,
		TokenExpiration: time.Duration(cfg.TokenExpiration) * time.Second,
	}
	userConfig := &usecase.UserConfig{
		TokenSecret:     cfg.TokenSecret,
		TokenExpiration: time.Duration(cfg.TokenExpiration) * time.Second,
	}
	authUsecase := usecase.NewAuthUsecase(userRepo, authConfig, logger)
	userUsecase := usecase.NewUserUsecase(userRepo, userConfig)
	vacancyUsecase := usecase.NewVacancyUsecase(vacancyRepo, userRepo)
	resumeUsecase := usecase.NewResumeUsecase(resumeRepo, userRepo, applicationRepo)
	applicationUsecase := usecase.NewApplicationUsecase(applicationRepo, userRepo, vacancyRepo, resumeRepo)

	// Initialize controllers
	authController := controller.NewHTTPAuthController(authUsecase)
	userController := controller.NewUserController(userUsecase)
	vacancyController := controller.NewVacancyController(vacancyUsecase)
	resumeController := controller.NewResumeController(resumeUsecase)
	applicationController := controller.NewApplicationController(applicationUsecase)
	adminController := controller.NewAdminController(userUsecase, vacancyUsecase, resumeUsecase)

	// Initialize router
	router := gin.Default()

	// CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:4200", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

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
		users.Use(middleware.AuthMiddleware(cfg.TokenSecret))
		{
			users.GET("/me", userController.GetMe)
			users.PUT("/me", userController.UpdateMe)
		}

		// Vacancy routes
		vacancies := api.Group("/vacancies")
		vacancies.Use(middleware.AuthMiddleware(cfg.TokenSecret))
		{
			vacancies.POST("", vacancyController.Create)
			vacancies.GET("", vacancyController.GetAll)
			vacancies.GET("/:id", vacancyController.GetByID)
			vacancies.PUT("/:id", vacancyController.Update)
			vacancies.DELETE("/:id", vacancyController.Delete)
		}

		// Resume routes
		resumes := api.Group("/resumes")
		resumes.Use(middleware.AuthMiddleware(cfg.TokenSecret))
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
		applications.Use(middleware.AuthMiddleware(cfg.TokenSecret))
		{
			applications.POST("", applicationController.Create)
			applications.GET("", applicationController.GetAll)
			applications.GET("/:id", applicationController.GetByID)
			applications.PUT("/:id/status", applicationController.UpdateStatus)
		}

		// Admin routes
		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(cfg.TokenSecret))
		{
			admin.GET("/users", adminController.GetAllUsers)
			admin.DELETE("/users/:id", adminController.DeleteUser)
			admin.DELETE("/vacancies/:id", adminController.DeleteVacancy)
			admin.DELETE("/resumes/:id", adminController.DeleteResume)
			admin.GET("/stats/users", adminController.GetStats)
			admin.GET("/vacancies", adminController.GetAllVacancies)
			admin.GET("/resumes", adminController.GetAllResumes)
		}
	}

	// Swagger documentation
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Start server
	logger.Info("Starting server", zap.String("port", cfg.Port))
	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: router,
	}

	// Graceful shutdown
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Failed to start server", zap.Error(err))
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	logger.Info("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		logger.Fatal("Server forced to shutdown", zap.Error(err))
	}

	logger.Info("Server exiting")
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
