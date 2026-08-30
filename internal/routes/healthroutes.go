package routes

import (
	"github.com/gofiber/fiber/v3"
	"github.com/moncef-an/ecom/internal/User/handlers"
	"github.com/moncef-an/ecom/internal/middleware"
)

func SetupRoutes(app *fiber.App, h *handlers.UserHandler){
	app.Post("/auth/register",h.Register)
	app.Post("/auth/login",h.Login)
	

    app.Get("/users/me", middleware.AuthRequired, h.GetMe)
}