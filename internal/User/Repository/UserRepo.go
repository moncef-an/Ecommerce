package Repository

import (
	"context"
	"errors"
	"fmt"

	models "github.com/moncef-an/ecom/internal/User/Models"
	"gorm.io/gorm"
)


var (
	ErrUserNotFound = errors.New("user not found")
	ErrEmailExists  = errors.New("user email already exists")
)

type UserRepository interface {
	CreateUser(ctx context.Context, user *models.User) error
	GetUserByEmail(ctx context.Context, email string) (models.User, error)
	GetUserByID(ctx context.Context, id string) (models.User, error)
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) CreateUser(ctx context.Context, user *models.User) error {
	if err := r.db.WithContext(ctx).Create(user).Error; err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return ErrEmailExists
		}
		
		return fmt.Errorf("userRepository.CreateUser: %w", err)
	}
	return nil
}

func (r *userRepository) GetUserByEmail(ctx context.Context, email string) (models.User, error) {
	var u models.User

	if err := r.db.WithContext(ctx).Where("email = ?", email).First(&u).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.User{}, ErrUserNotFound
		}
		return models.User{}, fmt.Errorf("userRepository.GetUserByEmail: %w", err)
	}

	return u, nil
}

func (r *userRepository) GetUserByID(ctx context.Context, id string) (models.User, error) {
	var u models.User

	if err := r.db.WithContext(ctx).First(&u, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.User{}, ErrUserNotFound
		}
		return models.User{}, fmt.Errorf("userRepository.GetUserByID: %w", err)
	}

	return u, nil
}