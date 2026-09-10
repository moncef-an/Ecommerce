package service

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/moncef-an/ecom/internal/models"
	"github.com/moncef-an/ecom/internal/Categories/repository"
)

var (
	ErrEmptyName = errors.New("category name cannot be empty or contain only whitespace")
	ErrCategoryNotFound = errors.New("category not found")
	ErrInvalidID        = errors.New("category ID cannot be empty")

)

type CategoryService struct {
	repo repository.CategorieRepoInterface
}

func NewCategoryService(repo repository.CategorieRepoInterface) *CategoryService {
	return &CategoryService{
		repo: repo,
	}
}

func (s *CategoryService) CreateCategory(ctx context.Context, name string) error {

	if strings.TrimSpace(name) == "" {
		return ErrEmptyName
	}

	newCategory := &models.Category{
		ID:        uuid.New().String(),
		Name:      name,
	}

	if err := s.repo.CreateCategory(ctx, newCategory); err != nil {
		return fmt.Errorf("failed to create category: %w", err)
	}

	return nil
}
func (s *CategoryService) GetAllCategories(ctx context.Context, limit int) ([]models.Category, error) {
	if limit <= 0 {
		limit = 10
	}

	categories, err := s.repo.GetAllCategories(ctx, limit)
	if err != nil {
		return nil, fmt.Errorf("service failed to get categories: %w", err)
	}

	return categories, nil
}

func (s *CategoryService) UpdateCategory(ctx context.Context, id, name string) (*models.Category, error) {
	trimmedName := strings.TrimSpace(name)
	if trimmedName == "" {
		return nil, ErrEmptyName
	}

	cat, err := s.repo.GetCategoryByID(ctx, id)
	if err != nil {
		return nil, ErrCategoryNotFound
	}

	cat.Name = trimmedName

	if err := s.repo.UpdateCategory(ctx, cat); err != nil {
		return nil, fmt.Errorf("service failed to update category: %w", err)
	}

	return cat, nil
}


func (s *CategoryService) DeleteCategory(ctx context.Context, id string) error {

	id = strings.TrimSpace(id)
	if id == "" {
		return ErrInvalidID
	}


	_, err := s.repo.GetCategoryByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to verify category existence: %w", err)
	}


	if err := s.repo.DeleteCategory(ctx, id); err != nil {
		return fmt.Errorf("failed to delete category: %w", err)
	}

	return nil
}