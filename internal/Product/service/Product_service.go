package service

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/moncef-an/ecom/internal/models"
	"github.com/moncef-an/ecom/internal/Product/repository"
	categoryRepository "github.com/moncef-an/ecom/internal/Categories/repository"
)

var(
	ErrInvalidID         = errors.New("invalid product id")
	ErrInvalidName       = errors.New("product name cannot be empty")
	ErrInvalidPrice      = errors.New("product price must be greater than zero")
	ErrInvalidStock      = errors.New("product stock cannot be negative")
	ErrInvalidPagination = errors.New("invalid pagination parameters")

	ErrProductNotFound      = errors.New("product not found")
	ErrCategoryNotFound     = errors.New("one or more specified categories do not exist")
)



type ProductService struct {
	repo repository.ProductRepoInterface
	category categoryRepository.CategorieRepoInterface
}

func NewProductService (r repository.ProductRepoInterface, c categoryRepository.CategorieRepoInterface)ProductService{
	return ProductService{
		repo: r,
		category: c,
	}
}


func (s *ProductService)AddNewProduct(ctx context.Context, name , desc , categoryName string, price float64 ,stock int)error{

	name = strings.TrimSpace(name)
	if name == ""{
		return ErrInvalidName
	}

	if price < 0 {
		return ErrInvalidPrice
	}

	if stock < 0 {
		return ErrInvalidStock
	}

	cat, err := s.category.GetCategoryByName(ctx,categoryName)
	if err !=nil {
		return ErrCategoryNotFound
	}

	product := models.Product{
		ID: uuid.New().String(),
		Name: name,
		Description: desc,
		Stock: stock,
		CategoryID: cat.ID,
		Price: price,
	}

	err = s.repo.Create(ctx,&product)

	if err != nil {
		return fmt.Errorf("error in creating the product %w", err)
	}

	return nil
}

func (s *ProductService) ListProducts(ctx context.Context, limit, offset int, categoryID string) ([]models.Product, int64, error) {

    if limit <= 0 || limit > 100 {
        limit = 10
    }
    if offset < 0 {
        offset = 0
    }

    categoryID = strings.TrimSpace(categoryID)

    products, total, err := s.repo.List(ctx, limit, offset, categoryID)
    if err != nil {
        return nil, 0, fmt.Errorf("service failed to list products: %w", err)
    }

    return products, total, nil
}

func (s *ProductService) UpdateProduct(ctx context.Context, product models.Product,sellerID string) error {
    product.ID = strings.TrimSpace(product.ID)
    if product.ID == "" {
        return ErrInvalidID
    }

    _, err := s.repo.GetByID(ctx, product.ID)
    if err != nil {
        if errors.Is(err, repository.ErrProductNotFound) {
            return ErrProductNotFound
        }
        return fmt.Errorf("service failed to find product: %w", err)
    }

    product.Name = strings.TrimSpace(product.Name)
    if product.Name == "" {
        return ErrInvalidName
    }

    if product.Price <= 0 {
        return ErrInvalidPrice
    }

    if product.Stock < 0 {
        return ErrInvalidStock
    }

    if err := s.repo.Update(ctx, &product,sellerID); err != nil {
        return fmt.Errorf("service failed to update product: %w", err)
    }

    return nil
}

func (s *ProductService) DeleteProduct(ctx context.Context, productID string, userID string, userRole models.Role) error {
	productID = strings.TrimSpace(productID)
	userID = strings.TrimSpace(userID)

	if productID == "" || userID == "" {
		return errors.New("product ID and user ID are required")
	}

	if userRole != models.RoleAdmin && userRole != models.RoleSeller {
		return errors.New("unauthorized: only admins or sellers can delete products")
	}

	if err := s.repo.Delete(ctx, productID, userID, userRole); err != nil {
		return fmt.Errorf("service failed to delete product: %w", err)
	}

	return nil
}