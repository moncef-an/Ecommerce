package cart

import "github.com/moncef-an/ecom/internal/models"


type AddItemRequest struct {
	ProductID string `json:"product_id" validate:"required"`
	Quantity  int    `json:"quantity" validate:"required,gt=0"`
}

type UpdateItemQuantityRequest struct {
	Quantity int `json:"quantity" validate:"required,gt=0"`
}


type CartItemResponse struct {
	ID        string  `json:"id"`
	ProductID string  `json:"product_id"`
	Name      string  `json:"name,omitempty"`
	Price     float64 `json:"price,omitempty"`
	Quantity  int     `json:"quantity"`
	Subtotal  float64 `json:"subtotal"`
}

type CartResponse struct {
	ID         string             `json:"id,omitempty"`
	UserID     string             `json:"user_id"`
	Items      []CartItemResponse `json:"items"`
	TotalPrice float64            `json:"total_price"`
}

func ToCartResponse(cart *models.Cart) CartResponse {
	itemsResponse := make([]CartItemResponse, 0, len(cart.Items))
	var totalPrice float64

	for _, item := range cart.Items {
		var name string
		var price float64

		if item.Product.ID != "" {
			name = item.Product.Name
			price = item.Product.Price
		}

		subtotal := price * float64(item.Quantity)
		totalPrice += subtotal

		itemsResponse = append(itemsResponse, CartItemResponse{
			ID:        item.ID,
			ProductID: item.ProductID,
			Name:      name,
			Price:     price,
			Quantity:  item.Quantity,
			Subtotal:  subtotal,
		})
	}

	return CartResponse{
		ID:         cart.ID,
		UserID:     cart.UserID,
		Items:      itemsResponse,
		TotalPrice: totalPrice,
	}
}