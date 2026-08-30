package service

import (
	"context"
	"errors"
	"fmt"
	"net/mail"

	"github.com/google/uuid"

	models "github.com/moncef-an/ecom/internal/User/Models"
	"github.com/moncef-an/ecom/internal/User/Repository"
	"github.com/moncef-an/ecom/internal/auth"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrPasswordEmpty    = errors.New("password cannot be empty")
	ErrPasswordTooShort = errors.New("password must be at least 8 characters long")
	ErrInvalidEmail = errors.New("invalid email")
	ErrPasswordorEmail = errors.New("invalid email or password")
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


func (s *UserService)Login(ctx context.Context , password , email string)(auth.Token,error){

	user ,err := s.repo.GetUserByEmail(ctx, email)

	if err != nil {
		if errors.Is(err,Repository.ErrUserNotFound){
			return auth.Token{},ErrPasswordorEmail
		}

		return auth.Token{}, fmt.Errorf("Login %w",err)
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
	if err !=nil{
		return auth.Token{}, ErrPasswordorEmail
	}

	token ,err := auth.GenerateToken(user.ID,user.Role)

	if err !=nil{
		return auth.Token{}, fmt.Errorf("generate tokens: %w", err)
	}

	return *token,nil

}

func (s *UserService) GetMe(ctx context.Context, userID string) (*models.User, error) {
    user, err := s.repo.GetUserByID(ctx, userID)
    if err != nil {
        if errors.Is(err, Repository.ErrUserNotFound) {
            return nil, err
        }
        return nil, fmt.Errorf("GetMe: %w", err)
    }
    return user, nil
}