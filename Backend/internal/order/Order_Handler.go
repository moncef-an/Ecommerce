package order

import (
	"errors"

	"github.com/gofiber/fiber/v3"
	"github.com/moncef-an/ecom/internal/models"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{
		service: service,
	}
}

type UpdateStatusRequest struct {
	Status models.OrderStatus `json:"status"`
}


func (h *Handler) Checkout(c fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "unauthorized",
		})
	}

	order, err := h.service.Checkout(c.Context(), userID)
	if err != nil {
		return handleError(c, err)
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "order created successfully",
		"data":    order,
	})
}


func (h *Handler) GetUserOrders(c fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "unauthorized",
		})
	}

	orders, err := h.service.GetUserOrders(c.Context(), userID)
	if err != nil {
		return handleError(c, err)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"data": orders,
	})
}

func (h *Handler) GetOrderByID(c fiber.Ctx) error {
	orderID := c.Params("id")
	if orderID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "order id is required",
		})
	}

	order, err := h.service.GetOrderByID(c.Context(), orderID)
	if err != nil {
		return handleError(c, err)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"data": order,
	})
}

func (h *Handler) CancelOrder(c fiber.Ctx) error {
	orderID := c.Params("id")
	userID, ok := c.Locals("user_id").(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "unauthorized",
		})
	}

	err := h.service.CancelOrder(c.Context(), orderID, userID)
	if err != nil {
		return handleError(c, err)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "order cancelled successfully",
	})
}


func (h *Handler) UpdateOrderStatus(c fiber.Ctx) error {
	orderID := c.Params("id")

	var req UpdateStatusRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	err := h.service.UpdateOrderStatus(c.Context(), orderID, req.Status)
	if err != nil {
		return handleError(c, err)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "order status updated successfully",
	})
}


func handleError(c fiber.Ctx, err error) error {
	switch {
	case errors.Is(err, ErrInvalidInput), errors.Is(err, ErrInvalidStatus):
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})


	case errors.Is(err, ErrCartIsEmpty):
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cart is empty"})

	case errors.Is(err, ErrInsufficientStock):
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "insufficient product stock"})

	case errors.Is(err, ErrProductNotFound):
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "product not found"})

	case errors.Is(err, ErrOrderNotFound):
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "order not found"})

	default:
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "internal server error",
		})
	}
}