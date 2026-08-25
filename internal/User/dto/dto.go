package dto


type RegisterReq struct {
    Email    string `json:"email"`
    Password string `json:"password"`
    Name     string `json:"name"`
}

type LoginReq struct {
    Email    string `json:"email"`
    Password string `json:"password"`
}