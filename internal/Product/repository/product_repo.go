package repository

import (
	"context"
	"strings"

	"errors"

	"github.com/moncef-an/ecom/internal/models"
	"gorm.io/gorm"
)

var (
	ErrProductNotFound  = errors.New("product not found")
	ErrCategoryNotFound = errors.New("category not found")
	ErrProductConflict  = errors.New("product with this name already exists")
)

type ProductRepoInterface interface {
	Create(ctx context.Context, product *models.Product) error
	GetByID(ctx context.Context, id string) (*models.Product, error)
	List(ctx context.Context, limit, offset int,categoryId string) ([]models.Product, int64, error)
	Update(ctx context.Context, product *models.Product,SellerID string) error
	Delete(ctx context.Context, productID string, userID string, userRole models.Role) error
}

type productStruct struct {
	db *gorm.DB
}

func NewRepo(db *gorm.DB) ProductRepoInterface{
	return &productStruct{
		db: db,
	}
}

func (r *productStruct)Create(ctx context.Context, product *models.Product)error{
	resault := r.db.WithContext(ctx).Create(product)
	if resault.Error != nil{
		return resault.Error
	}
	return nil 
}

func (r *productStruct)GetByID(ctx context.Context,id string)(*models.Product,error){
	var product models.Product
	query := r.db.WithContext(ctx).
	Preload("category").Preload("Seller").
	First(&product,"id = ?",id)

	if errors.Is(query.Error, gorm.ErrRecordNotFound) {
	return nil, ErrProductNotFound
	}

	if query.Error != nil {
		return nil, query.Error
	}

	return &product, nil
}

func (r *productStruct) List(ctx context.Context, limit, offset int, categoryID string) ([]models.Product, int64, error) {
	var products []models.Product
	var total int64

	query := r.db.WithContext(ctx).Model(&models.Product{})

	if strings.TrimSpace(categoryID) != "" {
		query = query.Where("category_id = ?", categoryID)
	}


	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.
		Preload("Category"). 
		Preload("Seller").   
		Limit(limit).
		Offset(offset).
		Order("created_at DESC").
		Find(&products).Error

	if err != nil {
		return nil, 0, err
	}

	return products, total, nil
}

func (r *productStruct) Update(ctx context.Context, product *models.Product, sellerID string) error {
    result := r.db.WithContext(ctx).
        Model(&models.Product{}).
        Where("id = ? AND seller_id = ?", product.ID, sellerID).
        Select("*").       
        Omit("CreatedAt").  
        Updates(product)

    if result.Error != nil {
        return result.Error
    }

    if result.RowsAffected == 0 {
        return ErrProductNotFound
    }

    return nil
}

func (r *productStruct) Delete(ctx context.Context, productID string, userID string, userRole models.Role) error {
	query := r.db.WithContext(ctx).Where("id = ?", productID)

	if userRole != models.RoleAdmin {
		query = query.Where("seller_id = ?", userID)
	}

	result := query.Delete(&models.Product{})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return ErrProductNotFound 
	}

	return nil
}