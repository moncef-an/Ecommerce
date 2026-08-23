package handlers

import (
	"errors"

	"github.com/gofiber/fiber/v3"
	"github.com/moncef-an/ecom/internal/User/Repository"
	service "github.com/moncef-an/ecom/internal/User/Service"
	"github.com/moncef-an/ecom/internal/User/dto"
)

type UserHandler struct {
	UserService service.UserService
}

func NewUserHandler (s service.UserService)*UserHandler{
	return &UserHandler{
		UserService: s,
	}
}

func (h *UserHandler)Register(c fiber.Ctx)error{
	var input dto.RegisterReq

	if err := c.Bind().Body(&input);err !=nil{
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
        "error": err.Error(),
	
		})
	}

	err := h.UserService.Register(c.Context(),input.Name,input.Email,input.Password)

	if err !=nil{ 
		switch {
			case errors.Is(err,service.ErrInvalidEmail),
				 errors.Is(err, service.ErrPasswordEmpty),
		 		 errors.Is(err, service.ErrPasswordTooShort):
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error" : err.Error(),
			})

			case errors.Is(err,Repository.ErrEmailExists):
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": err.Error()})

			default :
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal server error"})

		}
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
    	"message": "user registered successfully",
	})
}
