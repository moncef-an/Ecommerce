package order

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/moncef-an/ecom/internal/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

var (
	ErrOrderNotFound     = errors.New("order not found")
	ErrCartIsEmpty       = errors.New("cart is empty")
	ErrProductNotFound   = errors.New("product not found")
	ErrInsufficientStock = errors.New("insufficient product stock")
	ErrOrderCannotBeCancelled = errors.New("order cannot be cancelled")

)

type Repository interface {
	CreateOrder(ctx context.Context, order *models.Order) error
	GetUserOrders(ctx context.Context, userID string) ([]models.Order, error)
	GetOrderByID(ctx context.Context, id string) (*models.Order, error)
	UpdateOrderStatus(ctx context.Context, id string, status string) error
	CancelOrder(ctx context.Context, id string, userID string) error
	Checkout(ctx context.Context, userID string) (*models.Order, error)
}

type OrderRepoStruct struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &OrderRepoStruct{
		db: db,
	}
}

func (r *OrderRepoStruct) CreateOrder(ctx context.Context, order *models.Order) error {
	return r.db.WithContext(ctx).Create(order).Error
}

func (r *OrderRepoStruct) GetUserOrders(ctx context.Context, userID string) ([]models.Order, error) {
	var orders []models.Order
	err := r.db.WithContext(ctx).
		Preload("Items.Product").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&orders).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get user orders: %w", err)
	}
	return orders, nil
}

func (r *OrderRepoStruct) GetOrderByID(ctx context.Context, id string) (*models.Order, error) {
	var order models.Order
	err := r.db.WithContext(ctx).
		Preload("Items.Product").
		Where("id = ?", id).
		First(&order).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrOrderNotFound
		}
		return nil, fmt.Errorf("failed to get order: %w", err)
	}
	return &order, nil
}

func (r *OrderRepoStruct) UpdateOrderStatus(ctx context.Context, id string, status string) error {
	res := r.db.WithContext(ctx).
		Model(&models.Order{}).
		Where("id = ?", id).
		Update("status", status)
	if res.Error != nil {
		return fmt.Errorf("failed to update order status: %w", res.Error)
	}
	if res.RowsAffected == 0 {
		return ErrOrderNotFound
	}
	return nil
}

func (r *OrderRepoStruct) CancelOrder(ctx context.Context, id string, userID string) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var existingOrder models.Order
		if err := tx.Preload("Items").
			Where("id = ? AND user_id = ?", id, userID).
			First(&existingOrder).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ErrOrderNotFound
			}
			return err
		}

		
		if existingOrder.Status != models.OrderStatusPending { 
			return ErrOrderCannotBeCancelled
		}

	
		for _, item := range existingOrder.Items {
			err := tx.Model(&models.Product{}).
				Where("id = ?", item.ProductID).
				UpdateColumn("stock", gorm.Expr("stock + ?", item.Quantity)).Error
			if err != nil {
				return err
			}
		}

		
		err := tx.Model(&existingOrder).
			Update("status", models.OrderStatusCancelled).Error 
		if err != nil {
			return err
		}
		return nil
	})
}

func (r *OrderRepoStruct) Checkout(ctx context.Context, userID string) (*models.Order, error) {
	var createdOrder models.Order

	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
	
		var cart models.Cart
		if err := tx.Where("user_id = ?", userID).First(&cart).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ErrCartIsEmpty
			}
			return fmt.Errorf("failed to find cart: %w", err)
		}

		var cartItems []models.CartItem
		if err := tx.Where("cart_id = ?", cart.ID).Find(&cartItems).Error; err != nil {
			return fmt.Errorf("failed to fetch cart items: %w", err)
		}

		if len(cartItems) == 0 {
			return ErrCartIsEmpty
		}

		var totalPrice float64
		orderID := uuid.NewString()
		orderItems := make([]models.OrderItem, 0, len(cartItems))

		for _, item := range cartItems {
			var product models.Product

			
			err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
				Where("id = ?", item.ProductID).
				First(&product).Error

			if err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					return fmt.Errorf("%w: product ID %s", ErrProductNotFound, item.ProductID)
				}
				return fmt.Errorf("failed to lock product %s: %w", item.ProductID, err)
			}

			if product.Stock < item.Quantity {
				return fmt.Errorf("%w: %s (available: %d, requested: %d)",
					ErrInsufficientStock, product.Name, product.Stock, item.Quantity)
			}


			subtotal := product.Price * float64(item.Quantity)
			totalPrice += subtotal

			orderItems = append(orderItems, models.OrderItem{
				ID:        uuid.NewString(),
				OrderID:   orderID,
				ProductID: product.ID,
				Quantity:  uint(item.Quantity),
				Price:     product.Price,
			})
		}

	
		createdOrder = models.Order{
			ID:         orderID,
			UserID:     userID,
			Status:     models.OrderStatusPending,
			TotalPrice: totalPrice,
			Items:      orderItems,
		}

		if err := tx.Create(&createdOrder).Error; err != nil {
			return fmt.Errorf("failed to create order: %w", err)
		}


		for _, item := range orderItems {
			res := tx.Model(&models.Product{}).
				Where("id = ? AND stock >= ?", item.ProductID, item.Quantity).
				Update("stock", gorm.Expr("stock - ?", item.Quantity))

			if res.Error != nil {
				return fmt.Errorf("failed to update stock for product %s: %w", item.ProductID, res.Error)
			}

			if res.RowsAffected == 0 {
				return fmt.Errorf("%w: stock changed concurrently for product %s", ErrInsufficientStock, item.ProductID)
			}
		}

		if err := tx.Where("cart_id = ?", cart.ID).Delete(&models.CartItem{}).Error; err != nil {
			return fmt.Errorf("failed to clear cart items: %w", err)
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return &createdOrder, nil
}