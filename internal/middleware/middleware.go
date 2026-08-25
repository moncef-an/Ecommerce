package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/moncef-an/ecom/internal/auth"
)

func AuthRequired(c fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "missing authorization header",
		})
	}
	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "invalid authorization header format",
		})
	}
	tokenString := parts[1]

	claims, err := auth.ValidateToken(tokenString)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "invalid or expired token",
		})
	}

	if claims["type"] != "access" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "invalid token type",
		})
	}
	userID := claims["user_id"].(string)
	c.Locals("user_id", userID)

	return c.Next()

}