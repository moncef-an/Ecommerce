package handler

import (
	"errors"
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/moncef-an/ecom/internal/Product/dto"
	"github.com/moncef-an/ecom/internal/Product/service"
	"github.com/moncef-an/ecom/internal/models"
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

func (h *ProductHandler)UpdateProduct(c fiber.Ctx)error{

	productID := c.Params("id")
	if productID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "product id is required",
		})
	}

	sellerID,ok := c.Locals("user_id").(string)
	if !ok || sellerID == ""{
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "unauthorized: missing user context",
		})
	}

	var input dto.UpdateProductReq

	if err :=c.Bind().Body(&input) ; err !=nil{
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body format",
		})
	} 

	product := models.Product{
		ID: productID,
		Name: input.Name,
		Description: input.Description,
		Price: input.Price,
		Stock: input.Stock,
	}

	err := h.service.UpdateProduct(c.Context(),product,sellerID)
	if err !=nil{
		switch {
			case errors.Is(err, service.ErrProductNotFound):
				return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
					"error": "product not found or you do not have permission to update it",
				})
			case errors.Is(err, service.ErrInvalidID),
				errors.Is(err, service.ErrInvalidName),
				errors.Is(err, service.ErrInvalidPrice),
				errors.Is(err, service.ErrInvalidStock):
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": err.Error(),
				})
			default:
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "an unexpected internal error occurred",
				})
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "product updated successfully",
		"data": product,
	})


}

func (h *ProductHandler)DeleteProduct(c fiber.Ctx)error{
	productID := c.Params("id")
	if productID == ""{
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "product id is required",
		})
	}

	userRole, ok := c.Locals("role").(string)
	if !ok || userRole == "" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "forbidden: missing or invalid user role",
		})
	}

	sellerID , ok := c.Locals("user_id").(string)
	if !ok || sellerID == ""{
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "unauthorized: missing user context",
		})
	}

	err := h.service.DeleteProduct(c.Context(),productID,sellerID,models.Role(userRole))

	if err != nil{
		switch{
			case errors.Is(err, service.ErrProductNotFound):
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "product not found or you do not have permission to delete it",
			})
		case errors.Is(err, service.ErrInvalidID):
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": err.Error(),
			})
		default:
			if strings.Contains(err.Error(), "unauthorized") {
				return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
					"error": err.Error(),
				})
			}

			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "an unexpected internal error occurred",
			})
		}
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "product deleted successfully",
	})
}