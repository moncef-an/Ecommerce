package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/moncef-an/ecom/internal/models"
	"gorm.io/gorm"
)

type CategorieRepoInterface interface {
	CreateCategory(ctx context.Context, category *models.Category) error
	GetAllCategories(ctx context.Context, limit int) ([]models.Category, error)
	GetCategoryByID(ctx context.Context, id string) (*models.Category, error)
	GetCategoryByName(ctx context.Context, name string) (*models.Category, error)
	UpdateCategory(ctx context.Context, category *models.Category) error
	DeleteCategory(ctx context.Context, id string) error
}

type CategorieRepoStruct struct {
	db *gorm.DB
}

func NewCategorieRepo(db *gorm.DB) CategorieRepoInterface {
	return &CategorieRepoStruct{
		db: db,
	}
}

func (r *CategorieRepoStruct) CreateCategory(ctx context.Context, category *models.Category) error {
	if err := r.db.WithContext(ctx).Create(category).Error; err != nil {
		return fmt.Errorf("failed to create category: %w", err)
	}
	return nil
}

func (r *CategorieRepoStruct) GetAllCategories(ctx context.Context, limit int) ([]models.Category, error) {
	var categories []models.Category

	err := r.db.WithContext(ctx).Limit(limit).
		Find(&categories).Error

	if err != nil {
		return nil, fmt.Errorf("failed to fetch categories: %w", err)
	}
	return categories, nil

}

func (r *CategorieRepoStruct) GetCategoryByID(ctx context.Context, id string) (*models.Category, error) {
	var category models.Category
	if err := r.db.WithContext(ctx).First(&category, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		return nil, fmt.Errorf("failed to get category by id: %w", err)
	}
	return &category, nil
}

func (r *CategorieRepoStruct) GetCategoryByName(ctx context.Context, name string) (*models.Category, error) {
	var category models.Category
	if err := r.db.WithContext(ctx).Where("name = ?", name).First(&category).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		return nil, fmt.Errorf("failed to get category by name: %w", err)
	}
	return &category, nil
}

func (r *CategorieRepoStruct) UpdateCategory(ctx context.Context, category *models.Category) error {
	if err := r.db.WithContext(ctx).Save(category).Error; err != nil {
		return fmt.Errorf("failed to update category: %w", err)
	}
	return nil
}

func (r *CategorieRepoStruct) DeleteCategory(ctx context.Context, id string) error {
	result := r.db.WithContext(ctx).Delete(&models.Category{}, "id = ?", id)
	if result.Error != nil {
		return fmt.Errorf("failed to delete category: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}
