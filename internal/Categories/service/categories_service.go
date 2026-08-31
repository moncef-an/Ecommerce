package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/moncef-an/ecom/internal/Categories/models"
	"github.com/moncef-an/ecom/internal/Categories/repository"
)

var (
	ErrEmptyName = errors.New("category name cannot be empty or contain only whitespace")
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
		CreatedAt: time.Now(),
	}

	if err := s.repo.CreateCategory(ctx, newCategory); err != nil {
		return fmt.Errorf("failed to create category: %w", err)
	}

	return nil
}

func (s *CategoryService) GetAllCategories(ctx context.Context,){
	``
}
