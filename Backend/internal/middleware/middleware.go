package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/moncef-an/ecom/internal/models"
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
	userID, ok := claims["user_id"].(string)
	if !ok || userID == "" {
    	return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
    		"error": "invalid token claims",
    	})
	}

	userRole,ok :=claims["role"].(string)
	if !ok || userRole == ""{
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
    		"error": "invalid token claims",
    	})
	}

	c.Locals("role",userRole)

	c.Locals("user_id", userID)

	return c.Next()

}

func RequireRole(allowedRoles ...models.Role)fiber.Handler{
	return func(c fiber.Ctx)error{
		role := c.Locals("role")
		if role == nil{
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Forbidden: user role context is missing",
			})
		}
		var userRole models.Role
		switch r := role.(type) {
		case models.Role:
			userRole = r
		case string:
			userRole = models.Role(r)
		default:
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Forbidden: invalid role format",
			})
		}
		for _, allowedRole := range allowedRoles {
			if userRole == allowedRole {
				return c.Next() 
			}
		}
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Forbidden: you do not have permission to access this resource",
		})
	}
}