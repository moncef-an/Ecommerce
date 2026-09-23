package order

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/moncef-an/ecom/internal/models"
	products "github.com/moncef-an/ecom/internal/product"
)

var (
	ErrInvalidQuantity    = errors.New("quantity must be greater than zero")
	ErrInsufficientStock  = errors.New("insufficient stock for this product")
	ErrProductsNotFound    = errors.New("product not found")
	ErrUnauthorizedAccess = errors.New("unauthorized access to this order")
	ErrCannotCancelOrder  = errors.New("order cannot be cancelled in its current state")
	ErrInvalidOrderStatusTransition = errors.New("Invalid status transition !")
)

type OrderService struct {
	repo    OrderRepository
	product products.ProductRepoInterface
}

func NewOrderService(
	repo OrderRepository,
	productRepo products.ProductRepoInterface,
) *OrderService {
	return &OrderService{
		repo:    repo,
		product: productRepo,
	}
}

func (s *OrderService) CreateOrder(
	ctx context.Context,
	productID string,
	quantity int,
	userID string,
) error {
	if quantity <= 0 {
		return ErrInvalidQuantity
	}

	product, err := s.product.GetByID(ctx, productID)
	if err != nil {
		if errors.Is(err,products.ErrProductNotFound) {
			return ErrProductsNotFound
		}

		return fmt.Errorf("failed to fetch product: %w", err)
	}

	if product.Stock < quantity {
		return ErrInsufficientStock
	}

	orderID := uuid.NewString()

	item := models.OrderItem{
		ID:        uuid.NewString(),
		OrderID:   orderID,
		ProductID: product.ID,
		Quantity:  uint(quantity),
		Price:     product.Price,
	}

	order := &models.Order{
		ID:         orderID,
		UserID:     userID,
		Status:     models.OrderStatusPending,
		TotalPrice: product.Price * float64(quantity),
	}

	if err := s.repo.CreateOrder(
		ctx,
		order,
		[]models.OrderItem{item},
	); err != nil {
		return fmt.Errorf("failed to create order: %w", err)
	}

	return nil
}

func (s *OrderService) GetOrderByID(
	ctx context.Context,
	orderID string,
	userID string,
) (*models.Order, error) {
	order, err := s.repo.GetOrderByID(ctx, orderID)
	if err != nil {
		return nil, err
	}

	if order.UserID != userID {
		return nil, ErrUnauthorizedAccess
	}

	return order, nil
}

func (s *OrderService) GetUserOrders(
	ctx context.Context,
	userID string,
	page int,
	limit int,
) ([]models.Order, int64, error) {
	if page <= 0 {
		page = 1
	}

	if limit <= 0 || limit > 100 {
		limit = 10
	}

	offset := (page - 1) * limit

	return s.repo.GetUserOrders(
		ctx,
		userID,
		limit,
		offset,
	)
}

func (s *OrderService) CancelOrder(
	ctx context.Context,
	orderID string,
	userID string,
) error {
	order, err := s.repo.GetOrderByID(ctx, orderID)
	if err != nil {
		return err
	}

	if order.UserID != userID {
		return ErrUnauthorizedAccess
	}

	return s.repo.CancelPendingOrder(ctx, orderID)
}

func (s *OrderService)UpdateOrderStatus(ctx context.Context, orderId string ,newStatus models.OrderStatus)error{
	order,err := s.repo.GetOrderByID(ctx,orderId)
	if err != nil {
		return err 
	}

	if order.Status == newStatus{
		return nil
	}

	if !isValidStatusTransition(order.Status, newStatus){
		return ErrInvalidOrderStatusTransition
	}
	return s.repo.UpdateOrderStatus(ctx,orderId, newStatus)


}

func isValidStatusTransition (current , next models.OrderStatus)bool {
	switch current{
	case models.OrderStatusPending:
		return next == models.OrderStatusConfirmed || next == models.OrderStatusCancelled
	case models.OrderStatusConfirmed:
		return next == models.OrderStatusProcessing || next == models.OrderStatusCancelled
	case models.OrderStatusProcessing:
		return next == models.OrderStatusShipped
	case models.OrderStatusShipped:
		return next == models.OrderStatusDelivered
	default:
		return false
	}
}



