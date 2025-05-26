package entity

import "time"

type Vacancy struct {
	ID               int64     `db:"id"`
	EmployerID       int64     `db:"employer_id"`
	Title            string    `db:"title"`
	Description      string    `db:"description"`
	Requirements     string    `db:"requirements"`
	Responsibilities string    `db:"responsibilities"`
	Salary           int       `db:"salary"`
	Location         string    `db:"location"`
	EmploymentType   string    `db:"employment_type"`
	Company          string    `db:"company"`
	Status           string    `db:"status"`
	Skills           []string  `db:"skills"`
	Education        string    `db:"education"`
	CreatedAt        time.Time `db:"created_at"`
	UpdatedAt        time.Time `db:"updated_at"`
}
