package models

import (
	"time"
)

type Category struct {
	ID        string    `gorm:"type:varchar(36);primaryKey" json:"id"`
	Name      string    `gorm:"type:varchar(100);not null;unique" json:"name"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}
