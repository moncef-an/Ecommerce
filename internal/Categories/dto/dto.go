package dto


type CreateCategoryRequest struct {
    Name string `json:"name"`
}

type UpdateCategoryRequest struct {
    Name string `json:"name"`
}