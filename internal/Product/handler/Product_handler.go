package handler

import (
	"errors"

	"github.com/gofiber/fiber/v3"
	"github.com/moncef-an/ecom/internal/Product/dto"
	"github.com/moncef-an/ecom/internal/Product/service"
)

type ProductHandler struct {
	service service.ProductService
}

func NewProductHandler(s service.ProductService) *ProductHandler{
	return &ProductHandler{
		service: s,
	}
}

func(h *ProductHandler)CreateProduct(c fiber.Ctx)error{
	var input dto.CreateProductReq

	if err := c.Bind().Body(&input) ; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error" : err.Error(),
		})
	}
	sellerID, ok := c.Locals("user_id").(string)
	if !ok || sellerID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "unauthorized: missing user context",
		})
	}

	product ,err := h.service.AddNewProduct(
		c.Context(),
		sellerID,
		input.Name,
		input.Description,
		input.Category,
		input.Price,
		input.Stock)

	if err !=nil{
		switch{
		case errors.Is(err,service.ErrCategoryNotFound):
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
       			 "error": "invalid category_id: referenced category does not exist",
   		 	})
		default :
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
       			 "error": "an unexpected internal error occurred",
   		 	})
		}
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message":"product created successfully",
		"data": product,
	})
}

func (h *ProductHandler) ListProducts(c fiber.Ctx) error {

	input := dto.ListProductsReq{
		Limit:  10,
		Offset: 0,
	}

	if err := c.Bind().Query(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid query parameters",
		})
	}

	products, total, err := h.service.ListProducts(c.Context(), input.Limit, input.Offset, input.CategoryID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "an unexpected internal error occurred while fetching products",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"data": products,
		"meta": fiber.Map{
			"total":  total,
			"limit":  input.Limit,
			"offset": input.Offset,
		},
	})
}