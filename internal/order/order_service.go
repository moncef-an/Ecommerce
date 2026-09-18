package order

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/moncef-an/ecom/internal/models"
	"github.com/moncef-an/ecom/internal/product"
)
var (
	ErrInvalidQuantity   = errors.New("quantity must be greater than zero")
	ErrInsufficientStock = errors.New("insufficient stock for this product")
	ErrProductNotFound   = errors.New("product not found")
)

type OrderService struct {
	repo OrderRepository
	product product.ProductRepository
}

func NewOrderService(repo OrderRepository,p product.ProductRepository,userID string) *OrderService {
	return &OrderService{
		repo: repo,
		product: p,
	}
}

func (s *OrderService) CreateOrder(ctx context.Context, productID string , quantity int, userID string) error {
	if quantity <= 0 {
		return ErrInvalidQuantity
	}
	product , err := s.product.GetByID(ctx,productID)
	if err != nil { 
		return fmt.Errorf("failed to fetch product: %w", err)
	}
	if product == nil {
		return ErrProductNotFound
	}

	if product.Stock < quantity {
		return ErrInsufficientStock
	}
	orderID := uuid.New().String()
	itemPrice:= product.Price
	totalPrice:= float64(quantity)* product.Price

	orderItem := models.OrderItem{
		ID:        uuid.New().String(),
		OrderID:   orderID,
		ProductID: productID,
		Quantity:  uint(quantity),
		Price:     itemPrice,
	}
	order := &models.Order{
		ID:         orderID,
		UserID:     userID,
		Status:     models.OrderStatusPending,
		TotalPrice: totalPrice,
		Items:      []models.OrderItem{orderItem},
	}

	if err := s.repo.CreateOrder(ctx, order); err != nil {
		return fmt.Errorf("failed to save order: %w", err)
	}

	return nil
	
}

