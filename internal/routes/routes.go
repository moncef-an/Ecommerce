package routes

import (
	"github.com/gofiber/fiber/v3"
	"github.com/moncef-an/ecom/internal/categories"
	"github.com/moncef-an/ecom/internal/middleware"
	"github.com/moncef-an/ecom/internal/models"
	"github.com/moncef-an/ecom/internal/order"
	"github.com/moncef-an/ecom/internal/product"
	"github.com/moncef-an/ecom/internal/user"
)

func SetupRoutes(
	app *fiber.App,
	h *user.UserHandler,
	ch *categories.CategoryHandler,
	ph *product.ProductHandler,
	oh *order.OrderHandler,
) {
	// Auth & User Routes
	app.Post("/auth/register", h.Register)
	app.Post("/auth/login", h.Login)
	app.Get("/users/me", middleware.AuthRequired, h.GetMe)

	// Categories Routes
	category := app.Group("/category")
	category.Get("", ch.GetAllCategory)
	category.Post("", middleware.AuthRequired, middleware.RequireRole(models.RoleAdmin), ch.CreateCategory)
	category.Delete("/:id", middleware.AuthRequired, middleware.RequireRole(models.RoleAdmin), ch.DeleteCategory)
	category.Patch("/:id", middleware.AuthRequired, middleware.RequireRole(models.RoleAdmin), ch.UpdateCategory)

	// Products Routes
	productGroup := app.Group("/products")
	productGroup.Get("/", ph.ListProducts)
	productGroup.Post("/", middleware.AuthRequired, middleware.RequireRole(models.RoleSeller), ph.CreateProduct)
	productGroup.Patch("/:id", middleware.AuthRequired, middleware.RequireRole(models.RoleSeller), ph.UpdateProduct)
	productGroup.Delete("/:id", middleware.AuthRequired, middleware.RequireRole(models.RoleAdmin, models.RoleSeller), ph.DeleteProduct)

	// Orders Routes 
	ordersGroup := app.Group("/orders", middleware.AuthRequired)
	ordersGroup.Post("", oh.CreateOrder)
	ordersGroup.Get("", oh.GetUserOrders)
	ordersGroup.Get("/:id", oh.GetOrderByID)
	ordersGroup.Patch("/:id/cancel", oh.CancelOrder)

	// Admin Orders Routes 
	adminOrdersGroup := app.Group("/admin/orders", middleware.AuthRequired, middleware.RequireRole(models.RoleAdmin))
	adminOrdersGroup.Patch("/:id/status", oh.UpdateOrderStatus)
}