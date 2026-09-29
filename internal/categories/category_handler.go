package categories

import (
	"errors"
	"strconv"

	"github.com/gofiber/fiber/v3"
)

type CategoryHandler struct {
	service *CategoryService
}

func NewCategoryHandler(s *CategoryService) *CategoryHandler {
	return &CategoryHandler{
		service: s,
	}
}

func (h *CategoryHandler) CreateCategory(c fiber.Ctx) error {
	var input CreateCategoryRequest

	if err := c.Bind().Body(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	category,err := h.service.CreateCategory(c.Context(), input.Name)
	if err != nil {
		if errors.Is(err, ErrEmptyName) {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to create category",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
    "message":  "the category has been created",
    "category": category,
})
}

func (h *CategoryHandler) GetAllCategory(c fiber.Ctx) error {
	limitStr := c.Query("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}

	res, err := h.service.GetAllCategories(c.Context(), limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(res)
}

func (h *CategoryHandler) UpdateCategory(c fiber.Ctx) error {
	var input UpdateCategoryRequest

	if err := c.Bind().Body(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	id := c.Params("id")
	result, err := h.service.UpdateCategory(c.Context(), id, input.Name)

	if err != nil {
		switch {
		case errors.Is(err, ErrEmptyName):
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		case errors.Is(err, ErrCategoryNotFound):
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "category not found"})
		default:
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to update category"})
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":  "the category has been updated",
		"category": result,
	})
}

func (h *CategoryHandler) DeleteCategory(c fiber.Ctx) error {
	id := c.Params("id")

	if err := h.service.DeleteCategory(c.Context(), id); err != nil {
		if errors.Is(err, ErrInvalidID) {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "invalid category id",
			})
		}
		if errors.Is(err, ErrCategoryNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "category not found",
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to delete category",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "category deleted successfully",
	})
}