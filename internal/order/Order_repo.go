package order

import (
	"context"
	"errors"
	"fmt"

	"github.com/moncef-an/ecom/internal/models"
	"gorm.io/gorm"
)

var ErrOrderNotFound = errors.New("order not found")

type OrderRepository interface {
	CreateOrder(ctx context.Context, order *models.Order, items []models.OrderItem) error
	GetOrderByID(ctx context.Context, orderID string) (*models.Order, error)
	GetUserOrders(ctx context.Context, userID string, limit, offset int) ([]models.Order, int64, error)
	UpdateOrderStatus(ctx context.Context, orderID string, status models.OrderStatus) error
	CancelPendingOrder(ctx context.Context, orderID string) error
}

type OrderRepoStruct struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) OrderRepository {
	return &OrderRepoStruct{
		db: db,
	}
}

func (r *OrderRepoStruct) CreateOrder(
	ctx context.Context,
	order *models.Order,
	items []models.OrderItem,
) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(order).Error; err != nil {
			return fmt.Errorf("failed to create order: %w", err)
		}

		if len(items) > 0 {
			if err := tx.Create(&items).Error; err != nil {
				return fmt.Errorf("failed to create order items: %w", err)
			}
		}

		for _, item := range items {
			result := tx.Model(&models.Product{}).
				Where("id = ? AND stock >= ?", item.ProductID, item.Quantity).
				Update("stock", gorm.Expr("stock - ?", item.Quantity))

			if result.Error != nil {
				return fmt.Errorf("failed to update stock: %w", result.Error)
			}

			if result.RowsAffected == 0 {
				return fmt.Errorf("insufficient stock or product not found: %s", item.ProductID)
			}
		}

		return nil
	})
}

func (r *OrderRepoStruct) GetOrderByID(
	ctx context.Context,
	orderID string,
) (*models.Order, error) {
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

func (r *OrderRepoStruct) GetUserOrders(
	ctx context.Context,
	userID string,
	limit int,
	offset int,
) ([]models.Order, int64, error) {
	var orders []models.Order
	var total int64

	query := r.db.WithContext(ctx).
		Model(&models.Order{}).
		Where("user_id = ?", userID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count user orders: %w", err)
	}

	if err := query.
		Preload("Items").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&orders).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to fetch user orders: %w", err)
	}

	return orders, total, nil
}

func (r *OrderRepoStruct) UpdateOrderStatus(
	ctx context.Context,
	orderID string,
	status models.OrderStatus,
) error {
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

func (r *OrderRepoStruct) CancelPendingOrder(ctx context.Context, orderID string) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		res := tx.Model(&models.Order{}).
			Where("id = ? AND status = ?", orderID, models.OrderStatusPending).
			Update("status", models.OrderStatusCancelled)
		if res.Error != nil {
			return fmt.Errorf("failed to cancel order: %w", res.Error)
		}
		if res.RowsAffected == 0 {
			return ErrCannotCancelOrder
		}

		var items []models.OrderItem
		if err := tx.Where("order_id = ?", orderID).Find(&items).Error; err != nil {
			return fmt.Errorf("failed to load order items: %w", err)
		}

		for _, item := range items {
			err := tx.Model(&models.Product{}).
				Where("id = ?", item.ProductID).
				Update("stock", gorm.Expr("stock + ?", item.Quantity)).Error
			if err != nil {
				return fmt.Errorf("failed to restock product %s: %w", item.ProductID, err)
			}
		}

		return nil
	})
}