package entity

import (
	"time"
)

type User struct {
	ID        int64     `json:"id" db:"id"`
	Email     string    `json:"email" db:"email"`
	Password  string    `json:"-" db:"password"`
	Name      string    `json:"name" db:"name"`
	Role      string    `json:"role" db:"role"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type UserRole string

const (
	RoleJobseeker UserRole = "jobseeker"
	RoleEmployer  UserRole = "employer"
	RoleAdmin     UserRole = "admin"
)

type UserStats struct {
	TotalUsers        int `json:"total_users"`
	TotalEmployers    int `json:"total_employers"`
	TotalJobseekers   int `json:"total_jobseekers"`
	TotalVacancies    int `json:"total_vacancies"`
	TotalResumes      int `json:"total_resumes"`
	TotalApplications int `json:"total_applications"`
}
