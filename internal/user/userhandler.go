package user

import (
	"errors"
	"fmt"
	"strings"

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

// Register godoc
// @Summary Register a new user
// @Description Register a new user in the system
// @Tags auth
// @Accept json
// @Produce json
// @Param request body RegisterReq true "Registration Request"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 409 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /auth/register [post]
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

// Login godoc
// @Summary Login user
// @Description Authenticates a user and returns tokens
// @Tags auth
// @Accept json
// @Produce json
// @Param request body LoginReq true "Login Request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /auth/login [post]
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


// RefreshToken godoc
// @Summary Refresh access token
// @Description Refresh the JWT access token using a refresh token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body RefreshReq true "Refresh Token Request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /auth/refresh [post]
func (h *UserHandler) RefreshToken(c fiber.Ctx) error {
	var input RefreshReq

	if err := c.Bind().Body(&input); err != nil || strings.TrimSpace(input.RefreshToken) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "refresh token is required",
		})
	}

	token, err := h.UserService.RefreshAccessToken(c.Context(), input.RefreshToken)
	if err != nil {
		if errors.Is(err, ErrInvalidRefreshToken) {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "invalid or expired refresh token",
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "internal server error",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"accesstoken":  token.AccessToken,
		"refreshtoken": token.RefreshToken,
		"refreshId":    token.RefreshID,
	})
}


// Logout godoc
// @Summary Logout user
// @Description Logs out a user by invalidating the refresh token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body LogoutReq true "Logout Request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /auth/logout [post]
func (h *UserHandler) Logout(c fiber.Ctx) error {
	var input LogoutReq

	if err := c.Bind().Body(&input); err != nil || strings.TrimSpace(input.RefreshID) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "refreshId is required",
		})
	}

	if err := h.UserService.Logout(c.Context(), input.RefreshID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "internal server error",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "logged out successfully",
	})
}