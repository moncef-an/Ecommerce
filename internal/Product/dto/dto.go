package dto

type CreateProductReq struct{
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Price       float64   `json:"price"`
	Stock       int 	  `json:"stock"`
	Category string `json:"category"`}

type ListProductsReq struct {
	Limit      int    `query:"limit"`
	Offset     int    `query:"offset"`
	CategoryID string `query:"category_id"`
}

type UpdateProductReq struct{
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Price       float64   `json:"price"`
	Stock       int 	  `json:"stock"`
}