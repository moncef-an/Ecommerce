package routes

import (
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/moncef-an/ecom/internal/cart"
	"github.com/moncef-an/ecom/internal/categories"
	"github.com/moncef-an/ecom/internal/middleware"
	"github.com/moncef-an/ecom/internal/models"
	"github.com/moncef-an/ecom/internal/order"
	"github.com/moncef-an/ecom/internal/product"
	"github.com/moncef-an/ecom/internal/user"
)

func SetupRoutes(
	app *fiber.App,
	userHandler *user.UserHandler,
	categoryHandler *categories.CategoryHandler,
	productHandler *product.ProductHandler,
	orderHandler *order.Handler,
	cartHandler *cart.CartHandler,
	rateLimiter middleware.RateLimiter,
) {
	api := app.Group("/api/v1")

	// 1. Auth & User Routes

	auth := api.Group("/auth")

	auth.Post(
		"/register",
		middleware.RateLimitMiddleware(
			rateLimiter,
			"register",
			3,
			time.Minute,
		),
		userHandler.Register,
	)

	auth.Post(
		"/login",
		middleware.RateLimitMiddleware(
			rateLimiter,
			"login",
			5,
			time.Minute,
		),
		userHandler.Login,
	)

	// 2. Categories Routes

	categoriesGroup := api.Group("/categories")

	categoriesGroup.Get(
		"",
		categoryHandler.GetAllCategory,
	)

	adminCategories := categoriesGroup.Group(
		"",
		middleware.AuthRequired,
		middleware.RequireRole(models.RoleAdmin),
	)

	adminCategories.Post(
		"",
		categoryHandler.CreateCategory,
	)

	adminCategories.Patch(
		"/:id",
		categoryHandler.UpdateCategory,
	)

	adminCategories.Delete(
		"/:id",
		categoryHandler.DeleteCategory,
	)

	// 3. Products Routes

	productsGroup := api.Group("/products")

	productsGroup.Get(
		"",
		productHandler.ListProducts,
	)

	sellerProducts := productsGroup.Group(
		"",
		middleware.AuthRequired,
		middleware.RequireRole(models.RoleSeller),
	)

	sellerProducts.Post(
		"",
		productHandler.CreateProduct,
	)

	sellerProducts.Patch(
		"/:id",
		productHandler.UpdateProduct,
	)

	productsGroup.Delete(
		"/:id",
		middleware.AuthRequired,
		middleware.RequireRole(
			models.RoleAdmin,
			models.RoleSeller,
		),
		productHandler.DeleteProduct,
	)

	// 4. Cart Routes

	cartGroup := api.Group(
		"/cart",
		middleware.AuthRequired,
	)

	cartGroup.Get(
		"",
		cartHandler.GetCart,
	)

	cartGroup.Post(
		"/items",
		cartHandler.AddItem,
	)

	cartGroup.Patch(
		"/items/:id",
		cartHandler.UpdateItemQuantity,
	)

	cartGroup.Delete(
		"/items/:id",
		cartHandler.RemoveItem,
	)

	cartGroup.Delete(
		"",
		cartHandler.ClearCart,
	)

	// 5. Orders Routes

	ordersGroup := api.Group(
		"/orders",
		middleware.AuthRequired,
	)

	ordersGroup.Post(
		"/checkout",
		orderHandler.Checkout,
	)

	ordersGroup.Get(
		"",
		orderHandler.GetUserOrders,
	)

	ordersGroup.Get(
		"/:id",
		orderHandler.GetOrderByID,
	)

	ordersGroup.Patch(
		"/:id/cancel",
		orderHandler.CancelOrder,
	)

	// 6. Admin Orders Routes

	adminOrdersGroup := api.Group(
		"/admin/orders",
		middleware.AuthRequired,
		middleware.RequireRole(models.RoleAdmin),
	)

	adminOrdersGroup.Patch(
		"/:id/status",
		orderHandler.UpdateOrderStatus,
	)
}