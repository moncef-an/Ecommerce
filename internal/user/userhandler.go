package user

import (
	"errors"
	"fmt"

	"github.com/gofiber/fiber/v3"
)

type UserHandler struct {
	UserService *UserService
}

func NewUserHandler(s *UserService) *UserHandler {
	return &UserHandler{
		UserService: s,
	}
}

func (h *UserHandler) Register(c fiber.Ctx) error {
	var input RegisterReq

	if err := c.Bind().Body(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	err := h.UserService.Register(c.Context(), input.Name, input.Email, input.Password)
	if err != nil {
		switch {
		case errors.Is(err, ErrInvalidEmail),
			errors.Is(err, ErrPasswordEmpty),
			errors.Is(err, ErrEmptyName),
			errors.Is(err, ErrPasswordTooShort):
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": err.Error(),
			})

		case errors.Is(err, ErrEmailExists):
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": err.Error()})

		default:
			fmt.Println(err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal server error"})
		}
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "user registered successfully",
	})
}

func (h *UserHandler) Login(c fiber.Ctx) error {
	var input LoginReq

	if err := c.Bind().Body(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	token, err := h.UserService.Login(c.Context(), input.Password, input.Email)
	if err != nil {
		switch {
		case errors.Is(err, ErrPasswordorEmail):
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": err.Error(),
			})

		default:
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal server error"})
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"accesstoken":  token.AccessToken,
		"refreshtoken": token.RefreshToken,
		"refreshId":    token.RefreshID,
	})
}

func (h *UserHandler) GetMe(c fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}

	user, err := h.UserService.GetMe(c.Context(), userID)
	if err != nil {
		if errors.Is(err, ErrUserNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "user not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal server error"})
	}

	return c.Status(fiber.StatusOK).JSON(UserResponse{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
		Role:  string(user.Role),
	})
}