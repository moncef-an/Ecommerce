package handlers

import (
	"errors"
	"fmt"

	"github.com/gofiber/fiber/v3"
	"github.com/moncef-an/ecom/internal/User/Repository"
	service "github.com/moncef-an/ecom/internal/User/Service"
	"github.com/moncef-an/ecom/internal/User/dto"
)

type UserHandler struct {
	UserService *service.UserService
}

func NewUserHandler (s *service.UserService)*UserHandler{
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
				 errors.Is(err,service.ErrEmptyName),
		 		 errors.Is(err, service.ErrPasswordTooShort):
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error" : err.Error(),
			})

			case errors.Is(err,Repository.ErrEmailExists):
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": err.Error()})

			default :
			fmt.Println(err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal server error"})

		}
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
    	"message": "user registered successfully",
	})
}


func (h *UserHandler)Login(c fiber.Ctx)error{
	var input dto.LoginReq

	if err := c.Bind().Body(&input);err !=nil{
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
       		"error": "invalid request body",
		})
	}

	token ,err := h.UserService.Login(c.Context(),input.Password,input.Email)

	if err !=nil{
		switch {
		case errors.Is(err,service.ErrPasswordorEmail):
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error" : err.Error(),
		 	})

		default :
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal server error"})
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"accesstoken" : token.AccessToken ,
		"refreshtoken" : token.RefreshToken,
		"refreshId" : token.RefreshID,
	})

}

func (h *UserHandler) GetMe(c fiber.Ctx) error {
    userID := c.Locals("user_id").(string)

    user, err := h.UserService.GetMe(c.Context(), userID)
    if err != nil {
        if errors.Is(err, Repository.ErrUserNotFound) {
            return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "user not found"})
        }
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal server error"})
    }

    return c.Status(fiber.StatusOK).JSON(dto.UserResponse{
        ID:    user.ID,
        Name:  user.Name,
        Email: user.Email,
        Role:  string(user.Role),
    })
}