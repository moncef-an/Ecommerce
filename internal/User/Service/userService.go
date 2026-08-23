package service

import (
	"context"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"net/mail"

	models "github.com/moncef-an/ecom/internal/User/Models"
	"github.com/moncef-an/ecom/internal/User/Repository"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrPasswordEmpty    = errors.New("password cannot be empty")
	ErrPasswordTooShort = errors.New("password must be at least 8 characters long")
	ErrInvalidEmail = errors.New("invalid email")
)


type UserService struct {
	repo Repository.UserRepositoryInterface
}

func NewUserService(r Repository.UserRepositoryInterface)*UserService{
	return &UserService{
		repo: r,
	}
}

func (s *UserService)Register(ctx context.Context, name, email, password string)error{

	addr,err := mail.ParseAddress(email)

	if err !=nil || addr.Address != email{
		return ErrInvalidEmail
	}
	


	if len(password) == 0{
		return ErrPasswordEmpty
	}

	if len(password)<8 {
		return ErrPasswordTooShort
	}
	
	_, err = s.repo.GetUserByEmail(ctx, email)

	if err == nil {
		return  Repository.ErrEmailExists
	}

	if !errors.Is(err, Repository.ErrUserNotFound) {
    	return fmt.Errorf("check user email: %w", err)
	}

	hachedpass ,err := bcrypt.GenerateFromPassword([]byte(password),bcrypt.DefaultCost)

	if err !=nil{
		return fmt.Errorf("error in haching the password %w ", err)
	}

	newUser := &models.User{
		ID:           uuid.New().String(),
		Name:         name,
		Email:        email,
		PasswordHash: string(hachedpass),
		Role:         models.RoleUser,
	}


	if err := s.repo.CreateUser(ctx , newUser);err !=nil{
		return err
	}


	return nil
}
