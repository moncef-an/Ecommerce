package cart

import (
	"context"
	"errors"
	"fmt"

	"github.com/moncef-an/ecom/internal/models"
)

var (
	ErrInvalidQuantity = errors.New("quantity must be greater than zero")
)

type CartService struct {
	repo CartRepository
}

func NewCartService(repo CartRepository) *CartService {
	return &CartService{
		repo: repo,
	}
}

func (s *CartService) GetCart(ctx context.Context, userID string) (*models.Cart, error) {
	cart, err := s.repo.GetCartByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, ErrCartNotFound) {
			return &models.Cart{
				UserID: userID,
				Items:  []models.CartItem{},
			}, nil
		}
		return nil, fmt.Errorf("failed to fetch cart: %w", err)
	}

	return cart, nil
}

func (s *CartService) AddItem(ctx context.Context, userID string, productID string, quantity int) error {
	if quantity <= 0 {
		return ErrInvalidQuantity
	}

	return s.repo.AddItem(ctx, userID, productID, quantity)
}


func (s *CartService) UpdateItemQuantity(ctx context.Context, userID string, cartItemID string, quantity int) error {
	if quantity <= 0 {
		return ErrInvalidQuantity
	}

	return s.repo.UpdateItemQuantity(ctx, userID, cartItemID, quantity)
}


func (s *CartService) RemoveItem(ctx context.Context, userID string, cartItemID string) error {
	return s.repo.RemoveItem(ctx, userID, cartItemID)
}


func (s *CartService) ClearCart(ctx context.Context, userID string) error {
	return s.repo.ClearCart(ctx, userID)
}