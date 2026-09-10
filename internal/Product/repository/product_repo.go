package repository

import (
	"context"

	"github.com/moncef-an/ecom/internal/models"
	"gorm.io/gorm"
	"errors"
)

var (
	ErrProductNotFound  = errors.New("product not found")
	ErrCategoryNotFound = errors.New("category not found")
	ErrProductConflict  = errors.New("product with this name already exists")
)

type ProductRepoInterface interface {
	Create(ctx context.Context, product *models.Product) error
	GetByID(ctx context.Context, id string) (*models.Product, error)
	List(ctx context.Context, limit, offset int) ([]models.Product, int64, error)
	Update(ctx context.Context, product *models.Product) error
	Delete(ctx context.Context, id string) error
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
	querry := r.db.WithContext(ctx).
	Preload("categories").
	First(&product,"id = ?",id)

	if querry.Error !=nil{
		return nil,ErrProductNotFound
	}

	return &product, nil
}

func (r *productStruct)List(ctx context.Context, limit,offset int)([]models.Product,int64,error){

	var products []models.Product
	var total int64

	if err := r.db.WithContext(ctx).Model(&models.Product{}).Count(&total).Error ;err !=nil{
		return nil,0 , err
	}

	err := r.db.WithContext(ctx).
	Preload("categories").
	Limit(limit).
	Offset(offset).
	Find(&products).Error

	if err !=nil {
		return nil ,0 , err
	}

	return products,total,nil
}

func (r *productStruct)Update(ctx context.Context, product *models.Product) error{
	result := r.db.WithContext(ctx).
		Model(&models.Product{}).
		Where("id = ?", product.ID).
		Updates(product)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return ErrProductNotFound
	}

	return nil
		
}

func (r *productStruct)	Delete(ctx context.Context, id string) error{
	result := r.db.WithContext(ctx).Delete(&models.Product{}, "id = ?", id)
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return ErrProductNotFound
	}

	return nil
}