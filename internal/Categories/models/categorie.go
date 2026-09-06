package models

import (
	"github.com/moncef-an/ecom/internal/Product/models"
	"time"
)

type Category struct {
	ID        string `gorm:"type:varchar(36);primaryKey" json:"id"`
	Name      string    `gorm:"type:varchar(255);not null" json:"name"`
	Products  []models.Product `gorm:"foreignKey:CategoryID" json:"products,omitempty"` 
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
