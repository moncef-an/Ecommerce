package models

import (
	"time"
)

type Product struct {
	ID          string `gorm:"type:varchar(36);primaryKey" json:"id"`
	Name        string    `gorm:"type:varchar(255);not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	Price       float64   `gorm:"type:decimal(10,2);not null;default:0.00" json:"price"`
	Stock       int       `gorm:"not null;default:0" json:"stock"`
	CategoryID  string `gorm:"type:varchar(36);not null" json:"category_id"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}