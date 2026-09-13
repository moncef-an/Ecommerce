package order

import (
	"context"
	

	"github.com/moncef-an/ecom/internal/models"
	"gorm.io/gorm"
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
func NewRepository(db *gorm.DB)OrderRepository{
	return &OrderRepoStruct{
		db: db,
	}
}

func(r *OrderRepoStruct)CreateOrder(ctx context.Context, order *models.Order) error{
	query := r.db.WithContext(ctx).Create(order)
	if query.Error !=nil{
		return query.Error
	}
	return nil
}

func(r *OrderRepoStruct) CreateOrderItems(ctx context.Context, items []models.OrderItem) error

func(r *OrderRepoStruct) GetOrderByID(ctx context.Context, orderID string) (*models.Order, error){
	var order *models.Order
	query := r.db.WithContext(ctx).First(order,orderID)

	if query.Error != nil {
		return nil,query.Error
	}

	return order, nil
}

func(r *OrderRepoStruct) GetUserOrders(ctx context.Context, userID string, limit, offset int) ([]models.Order, int64, error){
	var orders []models.Order
	var total int64

	query := r.db.WithContext(ctx).Preload("users").Model(&models.Order{})

	if err := query.Count(&total).Error; err != nil{
		return nil , 0 , err
	}
	return orders , total , nil
}

func(r *OrderRepoStruct) UpdateOrderStatus(ctx context.Context, orderID string, status models.OrderStatus) error{

}