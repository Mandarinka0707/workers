package config

import (
	"os"
)

type Config struct {
	DBURL           string
	TokenSecret     string
	TokenExpiration int64
	Port            string
}

func NewConfig() (*Config, error) {
	config := &Config{
		DBURL:           getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/job_search_platform?sslmode=disable"),
		TokenSecret:     getEnv("JWT_SECRET", "your-secret-key"),
		TokenExpiration: 24 * 60 * 60, // 24 hours in seconds
		Port:            getEnv("PORT", "8080"),
	}
	return config, nil
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
