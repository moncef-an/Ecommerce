package handler

import (
	"github.com/gofiber/fiber/v3"
	"github.com/moncef-an/ecom/internal/Categories/dto"
	"github.com/moncef-an/ecom/internal/Categories/service"
)

type CategoryHandlerStruct struct {
	service service.CategoryService
}

func NewCategoryHandler(s service.CategoryService) CategoryHandlerStruct{
	return CategoryHandlerStruct{
		service: s,
	}
}

func (h *CategoryHandlerStruct)CreateCategory(c fiber.Ctx)error{
	var input dto.CreateCategoryRequest

	if err := c.Bind().Body(&input) ; err !=nil{
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error" : err.Error(),
		})
	}

	res := h.service.CreateCategory(c.Context(),input.Name)

	if res !=nil{
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error" : res.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
			"Done" : "the category has been created",
		})
}

func (h *CategoryHandlerStruct)GetAllCategory(c fiber.Ctx)error{
	limit := fiber.Query(c,"page",10)

	res,err := h.service.GetAllCategories(c.Context(),limit)

	if err !=nil{
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(res)
}

func (h *CategoryHandlerStruct)UpdateCategory(c fiber.Ctx)error{
	var input dto.UpdateCategoryRequest

	if err := c.Bind().Body(&input) ; err !=nil{
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error ": err.Error(),
		})
	}
	id := c.Params("id")
	resault,err := h.service.UpdateCategory(c.Context(),id,input.Name)
	
	if err !=nil{
		return c.Status(500).JSON(err)
	}

	return c.Status(200).JSON(fiber.Map{
		"message" : "the category has been updated",
		"Category" : resault,
	})

}

