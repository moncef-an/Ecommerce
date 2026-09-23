package order

import (
	"errors"

	"github.com/gofiber/fiber/v3"
)

type OrderHandler struct {
	service *OrderService
}

func NewOrderHandler(service *OrderService) *OrderHandler {
	return &OrderHandler{
		service: service,
	}
}

func getUserID(c fiber.Ctx) (string, error) {
	userID, ok := c.Locals("userID").(string)
	if !ok || userID == "" {
		return "", fiber.NewError(fiber.StatusUnauthorized, "unauthorized access")
	}
	return userID, nil
}


func (h *OrderHandler) CreateOrder(c fiber.Ctx) error {
	userID, err := getUserID(c)
	if err != nil {
		return err
	}

	var input CreateOrderRequest
	if err := c.Bind().Body(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	if err := h.service.CreateOrder(c.Context(), input.ProductID, input.Quantity, userID); err != nil {
		switch {
		case errors.Is(err, ErrInvalidQuantity), errors.Is(err, ErrInsufficientStock):
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		case errors.Is(err, ErrProductsNotFound):
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
		default:
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create order"})
		}
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "order created successfully",
	})
}


func (h *OrderHandler) GetOrderByID(c fiber.Ctx) error {
	userID, err := getUserID(c)
	if err != nil {
		return err
	}

	orderID := c.Params("id")
	if orderID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "order id is required"})
	}

	order, err := h.service.GetOrderByID(c.Context(), orderID, userID)
	if err != nil {
		switch {
		case errors.Is(err, ErrUnauthorizedAccess):
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": err.Error()})
		case errors.Is(err, ErrOrderNotFound):
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
		default:
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to fetch order"})
		}
	}

	return c.Status(fiber.StatusOK).JSON(ToOrderResponse(order))
}


func (h *OrderHandler) GetUserOrders(c fiber.Ctx) error {
	userID, err := getUserID(c)
	if err != nil {
		return err
	}

	var query GetUserOrdersRequest
	if err := c.Bind().Query(&query); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid query parameters"})
	}

	orders, total, err := h.service.GetUserOrders(c.Context(), userID, query.Page, query.Limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to fetch orders"})
	}

	var responseList []OrderResponse
	for _, o := range orders {
		responseList = append(responseList, ToOrderResponse(&o))
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"data":  responseList,
		"total": total,
		"page":  query.Page,
		"limit": query.Limit,
	})
}


func (h *OrderHandler) CancelOrder(c fiber.Ctx) error {
	userID, err := getUserID(c)
	if err != nil {
		return err
	}

	orderID := c.Params("id")

	if err := h.service.CancelOrder(c.Context(), orderID, userID); err != nil {
		switch {
		case errors.Is(err, ErrUnauthorizedAccess):
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": err.Error()})
		case errors.Is(err, ErrCannotCancelOrder):
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		case errors.Is(err, ErrOrderNotFound):
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
		default:
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to cancel order"})
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "order cancelled successfully",
	})
}


func (h *OrderHandler) UpdateOrderStatus(c fiber.Ctx) error {
	orderID := c.Params("id")

	var input UpdateOrderStatusRequest
	if err := c.Bind().Body(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	if err := h.service.UpdateOrderStatus(c.Context(), orderID, input.Status); err != nil {
		if errors.Is(err, ErrOrderNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to update order status"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "order status updated successfully",
	})
}