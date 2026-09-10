package routes

import (
	"github.com/gofiber/fiber/v3"
	"github.com/moncef-an/ecom/internal/Categories/handler"
	models "github.com/moncef-an/ecom/internal/models"
	"github.com/moncef-an/ecom/internal/User/handlers"
	"github.com/moncef-an/ecom/internal/middleware"
)

func SetupRoutes(app *fiber.App, h *handlers.UserHandler,ch *handler.CategoryHandlerStruct){
	app.Post("/auth/register",h.Register)
	app.Post("/auth/login",h.Login)

    app.Get("/users/me", middleware.AuthRequired, h.GetMe)


	category := app.Group("/category")
	category.Get("",ch.GetAllCategory)

	category.Post("",middleware.AuthRequired,middleware.RequireRole(models.RoleAdmin),ch.CreateCategory)
	category.Delete("/:id",middleware.AuthRequired,middleware.RequireRole(models.RoleAdmin),ch.DeleteCategory)
	category.Patch("/:id",middleware.AuthRequired,middleware.RequireRole(models.RoleAdmin),ch.UpdateCategory)
}