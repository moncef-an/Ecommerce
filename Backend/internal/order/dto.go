package order

import "github.com/moncef-an/ecom/internal/models"

type CreateOrderRequest struct {
	ProductID string `json:"product_id"`
	Quantity  int    `json:"quantity"`
}

type UpdateOrderStatusRequest struct {
	Status models.OrderStatus `json:"status"`
}

type GetUserOrdersRequest struct {
	Page  int `query:"page"`
	Limit int `query:"limit"`
}

type OrderItemResponse struct {
	ID        string  `json:"id"`
	ProductID string  `json:"product_id"`
	Quantity  uint    `json:"quantity"`
	Price     float64 `json:"price"`
}

type OrderResponse struct {
	ID         string              `json:"id"`
	UserID     string              `json:"user_id"`
	Status     models.OrderStatus  `json:"status"`
	TotalPrice float64             `json:"total_price"`
	Items      []OrderItemResponse `json:"items,omitempty"`
	CreatedAt  string              `json:"created_at"`
}


func ToOrderResponse(order *models.Order) OrderResponse {
	var items []OrderItemResponse
	for _, item := range order.Items {
		items = append(items, OrderItemResponse{
			ID:        item.ID,
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     item.Price,
		})
	}

	return OrderResponse{
		ID:         order.ID,
		UserID:     order.UserID,
		Status:     order.Status,
		TotalPrice: order.TotalPrice,
		Items:      items,
		CreatedAt:  order.CreatedAt.Format("2006-01-02 15:04:05"),
	}
}