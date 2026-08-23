package routes

import (
	"github.com/gofiber/fiber/v3"
	"github.com/moncef-an/ecom/internal/User/handlers"
)

func SetupRoutes(app *fiber.App, h handlers.UserHandler){
	app.Post("/auth/register",h.Register)
	
}