package routes

import "github.com/gofiber/fiber/v3"

func SetupRoutes(app *fiber.App){
	app.Get("/api/health",func (c fiber.Ctx)error  {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"Status":"ok",
		})
	})
}