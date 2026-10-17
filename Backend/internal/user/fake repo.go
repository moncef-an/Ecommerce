package user

import (
	"context"

	models "github.com/moncef-an/ecom/internal/models"
)

type FakeUserRepository struct {
	users       map[string]*models.User
	errToReturn error
}

func NewTestRepo() *FakeUserRepository {
	return &FakeUserRepository{
		users: make(map[string]*models.User),
	}
}


func (f *FakeUserRepository)GetUserByEmail(ctx context.Context,email string)(*models.User,error){
	if f.errToReturn != nil{
		return nil , f.errToReturn
	}
	user , exist := f.users[email]
	if !exist{
		return nil,ErrUserNotFound
	}
	return user,nil
}

func (f *FakeUserRepository) CreateUser(ctx context.Context, user *models.User) error {
	if f.errToReturn != nil {
		return f.errToReturn
	}

	f.users[user.Email] = user
	return nil
}


func (f *FakeUserRepository)GetUserByID(ctx context.Context, id string) (*models.User, error){
	if f.errToReturn != nil {
		return nil, f.errToReturn
	}
	for _, user := range f.users {
		if user.ID == id {
			return user, nil
		}
	}
	return nil, ErrUserNotFound
}