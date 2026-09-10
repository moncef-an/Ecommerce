package service

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/moncef-an/ecom/internal/Product/models"
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
	if strings.TrimSpace(name) == ""{
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

func (s *ProductService)ListProducts(ctx context.Context,limit int,offset int)(*[]models.Product,int64,error){
	if limit <=0 {
		limit = 10 
	}

	if offset < 0 {
        offset = 0
    }

	products, total, err := s.repo.List(ctx, limit, offset)
    if err != nil {
        return nil, 0, fmt.Errorf("service failed to list products: %w", err)
    }

	return &products,total,nil
}

func (s *ProductService) UpdateProduct(ctx context.Context, product models.Product) error {
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

    if err := s.repo.Update(ctx, &product); err != nil {
        return fmt.Errorf("service failed to update product: %w", err)
    }

    return nil
}

func (s *ProductService)DeleteProduct(ctx context.Context, id string)error{
	id = strings.TrimSpace(id)
    if id == "" {
        return ErrInvalidID
    }

    if err := s.repo.Delete(ctx, id); err != nil {
        if errors.Is(err, repository.ErrProductNotFound) {
            return ErrProductNotFound
        }
        return fmt.Errorf("service failed to delete product: %w", err)
    }

    return nil
}