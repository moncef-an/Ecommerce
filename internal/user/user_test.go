package user

import (
	"errors"
	"testing"

	models "github.com/moncef-an/ecom/internal/models"
)


var ErrTestDB = errors.New("db connection lost")
func TestRegister(t *testing.T) {
	tests := []struct {
		name        string
		setupRepo   func(repo *FakeUserRepository)
		input       RegisterReq
		expectedErr error
	}{
		
		{
			name:        "invalid email",
			setupRepo:   func(repo *FakeUserRepository) {},
			input:       RegisterReq{Name: "moncef", Email: "invalidemail", Password: "securePassword123"},
			expectedErr: ErrInvalidEmail,
		},
		{
			name:        "empty name",
			setupRepo:   func(repo *FakeUserRepository) {},
			input:       RegisterReq{Name: "   ", Email: "moncef@example.com", Password: "securePassword123"},
			expectedErr: ErrEmptyName,
		},
		{
			name:        "empty password",
			setupRepo:   func(repo *FakeUserRepository) {},
			input:       RegisterReq{Name: "moncef", Email: "moncef@example.com", Password: ""},
			expectedErr: ErrPasswordEmpty,
		},
		{
			name:        "short password",
			setupRepo:   func(repo *FakeUserRepository) {},
			input:       RegisterReq{Name: "moncef", Email: "moncef@example.com", Password: "123"},
			expectedErr: ErrPasswordTooShort,
		},

	
		{
			name:        "successful registration",
			setupRepo:   func(repo *FakeUserRepository) {},
			input:       RegisterReq{Name: "moncef", Email: "moncef@example.com", Password: "securePassword123"},
			expectedErr: nil,
		},
		{
			name: "email already exists",
			setupRepo: func(repo *FakeUserRepository) {
				repo.users["moncef@example.com"] = &models.User{
					Name:  "moncef",
					Email: "moncef@example.com",
				}
			},
			input:       RegisterReq{Name: "moncef", Email: "moncef@example.com", Password: "securePassword123"},
			expectedErr: ErrEmailExists,
		},
		{
			name: "repository error",
			setupRepo: func(repo *FakeUserRepository) {
				repo.errToReturn = ErrTestDB
			},
			input:       RegisterReq{Name: "moncef", Email: "moncef@example.com", Password: "securePassword123"},
			expectedErr: ErrTestDB,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			
			fakeRepo := NewTestRepo()
			tt.setupRepo(fakeRepo)

	
			service := NewUserService(fakeRepo, nil)

			
			err := service.Register(t.Context(), tt.input.Name, tt.input.Email, tt.input.Password)

			if !errors.Is(err, tt.expectedErr) {
				t.Fatalf("Register() error = %v, expectedErr %v", err, tt.expectedErr)
			}

			if tt.expectedErr == nil {
				savedUser, getErr := fakeRepo.GetUserByEmail(t.Context(), tt.input.Email)
				if getErr != nil || savedUser == nil {
					t.Fatalf("user was not saved to repository: %v", getErr)
				}

				if savedUser.Name != tt.input.Name {
					t.Errorf("got name %q, want %q", savedUser.Name, tt.input.Name)
				}
				if savedUser.Email != tt.input.Email {
					t.Errorf("got email %q, want %q", savedUser.Email, tt.input.Email)
				}
				if savedUser.PasswordHash == "" {
					t.Error("password hash is empty")
				}
				if savedUser.PasswordHash == tt.input.Password {
					t.Error("password was stored as plain text")
				}
			}
		})
	}
}