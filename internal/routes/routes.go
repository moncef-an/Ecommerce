package routes

import (
	"github.com/gofiber/fiber/v3"
	"github.com/moncef-an/ecom/internal/Categories/handler"
	models "github.com/moncef-an/ecom/internal/models"
	"github.com/moncef-an/ecom/internal/User/handlers"
	"github.com/moncef-an/ecom/internal/middleware"
	ProductHandler "github.com/moncef-an/ecom/internal/Product/handler"
	
)

func SetupRoutes(app *fiber.App, h *handlers.UserHandler,ch *handler.CategoryHandlerStruct,ph *ProductHandler.ProductHandler){
	app.Post("/auth/register",h.Register)
	app.Post("/auth/login",h.Login)

    app.Get("/users/me", middleware.AuthRequired, h.GetMe)


	category := app.Group("/category")
	category.Get("",ch.GetAllCategory)

	category.Post("",middleware.AuthRequired,middleware.RequireRole(models.RoleAdmin),ch.CreateCategory)
	category.Delete("/:id",middleware.AuthRequired,middleware.RequireRole(models.RoleAdmin),ch.DeleteCategory)
	category.Patch("/:id",middleware.AuthRequired,middleware.RequireRole(models.RoleAdmin),ch.UpdateCategory)


	product := app.Group("/products")


	product.Get("/", ph.ListProducts)

	product.Post("/",middleware.AuthRequired,middleware.RequireRole(models.RoleSeller),ph.CreateProduct)
	product.Patch("/:id",middleware.AuthRequired,middleware.RequireRole(models.RoleSeller),ph.UpdateProduct)
	product.Delete("/:id",middleware.AuthRequired,middleware.RequireRole(models.RoleAdmin,models.RoleSeller),ph.DeleteProduct)


}