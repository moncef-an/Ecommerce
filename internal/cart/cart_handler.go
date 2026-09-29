package cart

import (
	"errors"

	"github.com/gofiber/fiber/v3"
)

type CartHandler struct {
	service *CartService
}

func NewCartHandler(service *CartService) *CartHandler {
	return &CartHandler{
		service: service,
	}
}

// RegisterRoutes تسجيل جميع الـ Endpoints الخاصة بالسلة
func (h *CartHandler) RegisterRoutes(router fiber.Router, authMiddleware fiber.Handler) {
	cart := router.Group("/cart", authMiddleware)

	cart.Get("/", h.GetCart)
	cart.Post("/items", h.AddItem)
	cart.Patch("/items/:id", h.UpdateItemQuantity)
	cart.Delete("/items/:id", h.RemoveItem)
	cart.Delete("/", h.ClearCart)
}

// GET /cart
func (h *CartHandler) GetCart(c fiber.Ctx) error {
	user_id, ok := c.Locals("user_id").(string)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}

	cart, err := h.service.GetCart(c.Context(), user_id)
	if err != nil {
		return h.mapError(c, err)
	}

	return c.Status(fiber.StatusOK).JSON(ToCartResponse(cart))
}

// POST /cart/items
func (h *CartHandler) AddItem(c fiber.Ctx) error {
	user_id, ok := c.Locals("user_id").(string)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}

	var req AddItemRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	if err := h.service.AddItem(c.Context(), user_id, req.ProductID, req.Quantity); err != nil {
		return h.mapError(c, err)
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "item added to cart successfully",
	})
}

// PATCH /cart/items/:id
func (h *CartHandler) UpdateItemQuantity(c fiber.Ctx) error {
	user_id, ok := c.Locals("user_id").(string)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}
	cartItemID := c.Params("id")

	var req UpdateItemQuantityRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	if err := h.service.UpdateItemQuantity(c.Context(), user_id, cartItemID, req.Quantity); err != nil {
		return h.mapError(c, err)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "cart item updated successfully",
	})
}

// DELETE /cart/items/:id
func (h *CartHandler) RemoveItem(c fiber.Ctx) error {
	user_id, ok := c.Locals("user_id").(string)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}
	cartItemID := c.Params("id")

	if err := h.service.RemoveItem(c.Context(), user_id, cartItemID); err != nil {
		return h.mapError(c, err)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "cart item removed successfully",
	})
}

// DELETE /cart
func (h *CartHandler) ClearCart(c fiber.Ctx) error {
	user_id, ok := c.Locals("user_id").(string)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}

	if err := h.service.ClearCart(c.Context(), user_id); err != nil {
		return h.mapError(c, err)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "cart cleared successfully",
	})
}

// mapError تحويل أخطاء الـ Service إلى HTTP Status Codes
func (h *CartHandler) mapError(c fiber.Ctx, err error) error {
	switch {
	case errors.Is(err, ErrInvalidQuantity):
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	case errors.Is(err, ErrProductNotFound), errors.Is(err, ErrCartItemNotFound):
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	default:
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal server error"})
	}
}