package product

import (
	"context"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/moncef-an/ecom/internal/categories"
	"github.com/moncef-an/ecom/internal/models"
)

var (
	ErrInvalidID         = errors.New("invalid product id")
	ErrInvalidName       = errors.New("product name cannot be empty")
	ErrInvalidPrice      = errors.New("product price cannot be negative")
	ErrInvalidStock      = errors.New("product stock cannot be negative")
	ErrInvalidPagination = errors.New("invalid pagination parameters")
)

type ProductService struct {
	repo     ProductRepoInterface
	category categories.CategoryRepositoryInterface
	cache ProductCache
}

func NewProductService(r ProductRepoInterface, c categories.CategoryRepositoryInterface, cache ProductCache) *ProductService {
	return &ProductService{
		repo:     r,
		category: c,
		cache: cache,
	}
}

func (s *ProductService) AddNewProduct(
	ctx context.Context,
	sellerID, name, desc, categoryName string,
	price float64,
	stock int,
) (*models.Product, error) {

	name = strings.TrimSpace(name)
	if name == "" {
		return nil, ErrInvalidName
	}

	sellerID = strings.TrimSpace(sellerID)
	if sellerID == "" {
		return nil, errors.New("seller ID is required")
	}

	if price < 0 {
		return nil, ErrInvalidPrice
	}

	if stock < 0 {
		return nil, ErrInvalidStock
	}

	categoryName = strings.TrimSpace(categoryName)
	if categoryName == "" {
		return nil, ErrCategoryNotFound
	}

	cat, err := s.category.GetCategoryByName(ctx, categoryName)
	if err != nil {
		if errors.Is(err, categories.ErrCategoryNotFound) {
			return nil, ErrCategoryNotFound
		}
		return nil, fmt.Errorf("failed to fetch category: %w", err)
	}

	product := models.Product{
		ID:          uuid.New().String(),
		SellerID:    sellerID,
		Name:        name,
		Description: desc,
		Stock:       stock,
		CategoryID:  cat.ID,
		Price:       price,
	}

	if err := s.repo.Create(ctx, &product); err != nil {
		return nil, fmt.Errorf("error in creating the product: %w", err)
	}

	if err:= s.cache.DeleteByPattern(ctx, "products:list:*");err != nil {
		log.Printf("[Redis Warning] failed to invalidate product list cache on add: %v", err)
	}

	return &product, nil
}

func (s *ProductService) ListProducts(ctx context.Context, limit, offset int, categoryID string) ([]models.Product, int64, error) {

	if limit <= 0 || limit > 100 {
		limit = 10
	}
	if offset < 0 {
		offset = 0
	}

	categoryID = strings.TrimSpace(categoryID)

	cacheKey := fmt.Sprintf("products:list:limit=%d:offset=%d:category=%s", limit, offset, categoryID)

	cachedResault ,err := s.cache.Get(ctx,cacheKey)
	if err == nil && cachedResault != nil{
		return cachedResault.Products,cachedResault.Total,nil
	}

	if err != nil && errors.Is(err,ErrCacheMiss){
		log.Printf("[Redis Warning] failed to read cache key %s: %v", cacheKey, err)
	}

	products, total, err := s.repo.List(ctx, limit, offset, categoryID)
	if err != nil {
		return nil, 0, fmt.Errorf("service failed to list products: %w", err)
	}

	toCache := ProductListResult{
		Products: products,
		Total: total,
	}
	if cacheErr := s.cache.Set(ctx,cacheKey,toCache,5 * time.Minute);cacheErr!=nil{
		log.Printf("[Redis Warning] failed to set cache key %s: %v", cacheKey, cacheErr)
	}

	return products, total, nil
}

func (s *ProductService) UpdateProduct(ctx context.Context, product models.Product, sellerID string) error {
	product.ID = strings.TrimSpace(product.ID)
	if product.ID == "" {
		return ErrInvalidID
	}

	product.Name = strings.TrimSpace(product.Name)
	if product.Name == "" {
		return ErrInvalidName
	}

	if product.Price < 0 {
		return ErrInvalidPrice
	}

	if product.Stock < 0 {
		return ErrInvalidStock
	}

	if err := s.repo.Update(ctx, &product, sellerID); err != nil {
		if errors.Is(err, ErrProductNotFound) {
			return ErrProductNotFound
		}
		return fmt.Errorf("service failed to update product: %w", err)
	}

	if err := s.cache.DeleteByPattern(ctx, "products:list:*"); err != nil {
		log.Printf("[Redis Warning] failed to invalidate product list cache on update: %v", err)
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
		if errors.Is(err, ErrProductNotFound) {
			return ErrProductNotFound
		}
		return fmt.Errorf("service failed to delete product: %w", err)
	}
	if err := s.cache.DeleteByPattern(ctx, "products:list:*"); err != nil {
		log.Printf("[Redis Warning] failed to invalidate product list cache on delete: %v", err)
	}

	return nil
}