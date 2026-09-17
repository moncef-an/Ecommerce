package order

import (
	"context"
	"errors"
	"fmt"

	"github.com/moncef-an/ecom/internal/models"
	"gorm.io/gorm"
)


var (
	ErrOrderNotFound = errors.New("order not found")
)

type OrderRepository interface {
	CreateOrder(ctx context.Context, order *models.Order) error
	CreateOrderItems(ctx context.Context, items []models.OrderItem) error

	GetOrderByID(ctx context.Context, orderID string) (*models.Order, error)
	GetUserOrders(ctx context.Context, userID string, limit, offset int) ([]models.Order, int64, error)

	UpdateOrderStatus(ctx context.Context, orderID string, status models.OrderStatus) error
}

type OrderRepoStruct struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) OrderRepository {
	return &OrderRepoStruct{
		db: db,
	}
}

func (r *OrderRepoStruct) CreateOrder(ctx context.Context, order *models.Order) error {
	if err := r.db.WithContext(ctx).Create(order).Error; err != nil {
		return fmt.Errorf("failed to create order: %w", err)
	}
	return nil
}

func (r *OrderRepoStruct) CreateOrderItems(ctx context.Context, items []models.OrderItem) error {
	if len(items) == 0 {
		return nil
	}

	if err := r.db.WithContext(ctx).Create(&items).Error; err != nil {
		return fmt.Errorf("failed to create order items: %w", err)
	}

	return nil
}

func (r *OrderRepoStruct) GetOrderByID(ctx context.Context, orderID string) (*models.Order, error) {
	var order models.Order

	err := r.db.WithContext(ctx).
		Preload("Items").
		Where("id = ?", orderID).
		First(&order).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrOrderNotFound
		}
		return nil, fmt.Errorf("failed to get order: %w", err)
	}

	return &order, nil
}

func (r *OrderRepoStruct) GetUserOrders(ctx context.Context, userID string, limit, offset int) ([]models.Order, int64, error) {
	var orders []models.Order
	var total int64

	baseQuery := r.db.WithContext(ctx).Model(&models.Order{}).Where("user_id = ?", userID)

	if err := baseQuery.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count user orders: %w", err)
	}

	err := baseQuery.
		Preload("Items").
		Limit(limit).
		Offset(offset).
		Order("created_at DESC").
		Find(&orders).Error

	if err != nil {
		return nil, 0, fmt.Errorf("failed to fetch user orders: %w", err)
	}

	return orders, total, nil
}

func (r *OrderRepoStruct) UpdateOrderStatus(ctx context.Context, orderID string, status models.OrderStatus) error {
	result := r.db.WithContext(ctx).
		Model(&models.Order{}).
		Where("id = ?", orderID).
		Update("status", status)

	if result.Error != nil {
		return fmt.Errorf("failed to update order status: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return ErrOrderNotFound
	}

	return nil
}