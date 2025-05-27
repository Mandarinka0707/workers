package entity

import "time"

type Application struct {
	ID             int64     `json:"id" db:"id"`
	UserID         int64     `json:"user_id" db:"user_id"`
	VacancyID      int64     `json:"vacancy_id" db:"vacancy_id"`
	ResumeID       int64     `json:"resume_id" db:"resume_id"`
	Status         string    `json:"status" db:"status"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time `json:"updated_at" db:"updated_at"`
	ApplicantName  string    `json:"applicant_name" db:"-"`
	ApplicantEmail string    `json:"applicant_email" db:"-"`
	Resume         *Resume   `json:"resume,omitempty" db:"-"`
}
