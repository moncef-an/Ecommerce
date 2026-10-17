package order

import (
	"context"
	"errors"

	"github.com/moncef-an/ecom/internal/models"
)

var (
	ErrInvalidInput  = errors.New("invalid input data")
	ErrInvalidStatus = errors.New("invalid order status")
)

type Service interface {
	Checkout(ctx context.Context, userID string) (*models.Order, error)
	GetUserOrders(ctx context.Context, userID string) ([]models.Order, error)
	GetOrderByID(ctx context.Context, id string) (*models.Order, error)
	UpdateOrderStatus(ctx context.Context, id string, status models.OrderStatus) error
	CancelOrder(ctx context.Context, id string, userID string) error
	CreateOrder(ctx context.Context, order *models.Order) error
}

type orderService struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &orderService{
		repo: repo,
	}
}

func (s *orderService) Checkout(ctx context.Context, userID string) (*models.Order, error) {
	if userID == "" {
		return nil, ErrInvalidInput
	}


	return s.repo.Checkout(ctx, userID)
}

func (s *orderService) GetUserOrders(ctx context.Context, userID string) ([]models.Order, error) {
	if userID == "" {
		return nil, ErrInvalidInput
	}

	return s.repo.GetUserOrders(ctx, userID)
}

func (s *orderService) GetOrderByID(ctx context.Context, id string) (*models.Order, error) {
	if id == "" {
		return nil, ErrInvalidInput
	}

	return s.repo.GetOrderByID(ctx, id)
}

func (s *orderService) UpdateOrderStatus(ctx context.Context, id string, status models.OrderStatus) error {
	if id == "" {
		return ErrInvalidInput
	}

	if !isValidStatus(status) {
		return ErrInvalidStatus
	}

	return s.repo.UpdateOrderStatus(ctx, id, string(status))
}

func (s *orderService) CancelOrder(ctx context.Context, id string, userID string) error {
	if id == "" || userID == "" {
		return ErrInvalidInput
	}

	return s.repo.CancelOrder(ctx, id, userID)
}

func (s *orderService) CreateOrder(ctx context.Context, order *models.Order) error {
	if order == nil || order.UserID == "" {
		return ErrInvalidInput
	}

	return s.repo.CreateOrder(ctx, order)
}

func isValidStatus(status models.OrderStatus) bool {
	switch status {
	case models.OrderStatusPending,
		models.OrderStatusConfirmed,
		models.OrderStatusProcessing,
		models.OrderStatusShipped,
		models.OrderStatusDelivered,
		models.OrderStatusCancelled:
		return true
	default:
		return false
	}
}