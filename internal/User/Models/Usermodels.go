package models

import (
	"time"
)

type Role string

const (
	RoleUser   Role = "USER"
	RoleSeller Role = "SELLER"
	RoleAdmin  Role = "ADMIN"
)

type User struct {
	ID           string    `json:"id" gorm:"type:varchar(36);primaryKey"`
	Name         string    `json:"name" gorm:"type:varchar(255);not null"`
	Email        string    `json:"email" gorm:"type:varchar(255);unique;not null"`
	PasswordHash string    `json:"-" gorm:"column:password_hash;type:varchar(255);not null"`
	Role         Role      `json:"role" gorm:"type:enum('USER', 'SELLER', 'ADMIN');default:'USER';not null"`
	CreatedAt    time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt    time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}