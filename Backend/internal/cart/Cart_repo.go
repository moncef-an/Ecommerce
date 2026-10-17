package cart

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/moncef-an/ecom/internal/models"
	"gorm.io/gorm"
)

var (
	ErrCartNotFound     = errors.New("cart not found")
	ErrCartItemNotFound = errors.New("cart item not found")
	ErrProductNotFound  = errors.New("product not found")
)

type CartRepository interface {
	GetCartByUserID(ctx context.Context, userID string) (*models.Cart, error)
	AddItem(ctx context.Context, userID string, productID string, quantity int) error
	UpdateItemQuantity(ctx context.Context, userID string, cartItemID string, quantity int) error
	RemoveItem(ctx context.Context, userID string, cartItemID string) error
	ClearCart(ctx context.Context, userID string) error
}

type CartRepoStruct struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) CartRepository {
	return &CartRepoStruct{
		db: db,
	}
}

func (r *CartRepoStruct) GetCartByUserID(ctx context.Context, userID string) (*models.Cart, error) {
	var cart models.Cart

	err := r.db.WithContext(ctx).
		Preload("Items.Product").
		Where("user_id = ?", userID).
		First(&cart).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCartNotFound
		}
		return nil, fmt.Errorf("failed to get cart: %w", err)
	}

	return &cart, nil
}

func (r *CartRepoStruct) AddItem(ctx context.Context, userID string, productID string, quantity int) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {

		var product models.Product
		if err := tx.Where("id = ?", productID).First(&product).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ErrProductNotFound
			}
			return fmt.Errorf("failed to check product: %w", err)
		}

		var cart models.Cart
		err := tx.Where("user_id = ?", userID).First(&cart).Error
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				cart = models.Cart{
					ID:     uuid.NewString(),
					UserID: userID,
				}
				if err := tx.Create(&cart).Error; err != nil {
					return fmt.Errorf("failed to create cart: %w", err)
				}
			} else {
				return fmt.Errorf("failed to find cart: %w", err)
			}
		}

		var cartItem models.CartItem
		err = tx.Where("cart_id = ? AND product_id = ?", cart.ID, productID).First(&cartItem).Error

		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				newItem := models.CartItem{
					ID:        uuid.NewString(),
					CartID:    cart.ID,
					ProductID: productID,
					Quantity:  quantity,
				}
				if err := tx.Create(&newItem).Error; err != nil {
					return fmt.Errorf("failed to add cart item: %w", err)
				}
			} else {
				return fmt.Errorf("failed to query cart item: %w", err)
			}
		} else {
			if err := tx.Model(&cartItem).Update("quantity", gorm.Expr("quantity + ?", quantity)).Error; err != nil {
				return fmt.Errorf("failed to update cart item quantity: %w", err)
			}
		}

		return nil
	})
}

func (r *CartRepoStruct) UpdateItemQuantity(ctx context.Context, userID string, cartItemID string, quantity int) error {
	result := r.db.WithContext(ctx).
		Model(&models.CartItem{}).
		Where("id = ? AND cart_id IN (SELECT id FROM carts WHERE user_id = ?)", cartItemID, userID).
		Update("quantity", quantity)

	if result.Error != nil {
		return fmt.Errorf("failed to update cart item quantity: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return ErrCartItemNotFound
	}

	return nil
}

func (r *CartRepoStruct) RemoveItem(ctx context.Context, userID string, cartItemID string) error {
	result := r.db.WithContext(ctx).
		Where("id = ? AND cart_id IN (SELECT id FROM carts WHERE user_id = ?)", cartItemID, userID).
		Delete(&models.CartItem{})

	if result.Error != nil {
		return fmt.Errorf("failed to remove cart item: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return ErrCartItemNotFound
	}

	return nil
}

func (r *CartRepoStruct) ClearCart(ctx context.Context, userID string) error {
	if err := r.db.WithContext(ctx).
		Where("cart_id IN (SELECT id FROM carts WHERE user_id = ?)", userID).
		Delete(&models.CartItem{}).Error; err != nil {
		return fmt.Errorf("failed to clear cart: %w", err)
	}

	return nil
}