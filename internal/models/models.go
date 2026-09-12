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

type Product struct {
	ID          string    `gorm:"type:varchar(36);primaryKey" json:"id"`
	Name        string    `gorm:"type:varchar(255);not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	Price       float64   `gorm:"type:decimal(10,2);not null;default:0.00" json:"price"`
	Stock       int       `gorm:"not null;default:0" json:"stock"`
	CategoryID  string    `gorm:"type:varchar(36);not null" json:"category_id"`
	SellerID    string    `gorm:"type:varchar(36);not null" json:"seller_id"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	Category Category `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Seller   User     `gorm:"foreignKey:SellerID" json:"seller,omitempty"`
}

type Category struct {
	ID        string    `gorm:"type:varchar(36);primaryKey" json:"id"`
	Name      string    `gorm:"type:varchar(255);not null" json:"name"`
	Products  []Product `gorm:"foreignKey:CategoryID" json:"products,omitempty"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

type User struct {
	ID           string    `gorm:"type:varchar(36);primaryKey" json:"id"`
	Name         string    `gorm:"type:varchar(255);not null" json:"name"`
	Email        string    `gorm:"type:varchar(255);unique;not null" json:"email"`
	PasswordHash string    `gorm:"column:password_hash;type:varchar(255);not null" json:"-"`
	Role         Role      `gorm:"type:varchar(20);default:'USER';not null" json:"role"`
	Products     []Product `gorm:"foreignKey:SellerID" json:"products,omitempty"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

type Order struct {
	ID         string    `json:"id" gorm:"type:varchar(36);primaryKey"`
	UserID     string    `json:"user_id" gorm:"type:varchar(36);not null;index"`
	Status     string    `json:"status" gorm:"type:varchar(36);not null;default:'PENDING'"`
	TotalPrice float64   `json:"total_price" gorm:"type:decimal(10,2);not null"`
	CreatedAt  time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt  time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}
type OrderItem struct {
	ID        string  `json:"id" gorm:"type:varchar(36);primaryKey"`
	OrderID   string  `json:"order_id" gorm:"type:varchar(36);not null;index"`
	ProductID string  `json:"product_id" gorm:"type:varchar(36);not null;index"`
	Quantity  uint    `json:"quantity" gorm:"not null"`
	Price     float64 `json:"price" gorm:"type:decimal(10,2);not null"`
}