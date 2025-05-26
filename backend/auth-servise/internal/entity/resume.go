package entity

import "time"

type Resume struct {
	ID          int64     `json:"id" db:"id"`
	UserID      int64     `json:"user_id" db:"user_id"`
	Title       string    `json:"title" db:"title"`
	Description string    `json:"description" db:"description"`
	Skills      []string  `json:"skills" db:"skills" swaggertype:"array,string"`
	Experience  string    `json:"experience" db:"experience"`
	Education   string    `json:"education" db:"education"`
	Status      string    `json:"status" db:"status"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}
