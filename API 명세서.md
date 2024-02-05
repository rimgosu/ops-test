## AWS로 배포되어 있습니다.
- 엔드포인트 : http://15.164.48.247:3000/

## UsersController
### 1. GET /users
- 목적: 모든 사용자 정보를 조회합니다.
- url : http://15.164.48.247:3000/users
- request header
```json
{
    "Authorization" : "Bearer [jwt_access_token]"
}
```
- request body: none
- response 예시
```json
{
    "username": "newnyup@gmail.com",
    "sub": 2,
    "role": "ADMIN",
    "iat": 1706359349,
    "exp": 1706359409
}
```
- 제한사항
1. login한 user의 role이 'ADMIN'이어야 합니다.
2. 메일 인증된 사용자여야 합니다.


### 2. POST /users/register
- 목적: 새로운 사용자를 등록합니다.
- url : http://15.164.48.247:3000/users/register
- request header: none
- request body : RegisterDto
```json
{
    "username" : "newnyup@gmail.com",
    "password" : "1234",
    "role" : "ADMIN" // role 생략시 기본값: "MEMBER"
}
```
- response 예시
```json
{
    "username": "newnyup@gmail.com"
}
```
- 제한사항
1. 이미 등록된 username과 중복되면 안됩니다.


### 3. POST /users/sendcode
- 목적: 사용자에게 인증 코드를 보냅니다.
- url : http://15.164.48.247:3000/users/sendcode
- request header
```json
{
    "Authorization" : "Bearer [jwt_access_token]"
}
```
- request body
```json
{
    "verificationCode": "i0p7yytf"
}
```
- response
```json
{
    "isVerified": true
}
```

### 4. POST /users/confirmcode
- 목적: 인증 코드를 확인합니다.
- url : http://15.164.48.247:3000/users/confirmcode
- request header
```json
{
    "Authorization" : "Bearer [jwt_access_token]"
}
```
- request body
```json
{
    "verificationCode": "i0p7yytf"
}
```
- response
```json
{
    "isVerified": true
}
```
- 제한사항
1. 수신 메일의 인증 코드와 같아야 합니다.


## AuthController
### 1. POST /auth/login
- 목적: 로그인을 수행합니다.
- url : http://15.164.48.247:3000/auth/login
- request header: none
- request body: LoginDto
```json
{
    "username" : "newnyup@gmail.com",
    "password" : "1234"
}
```
- response 예시
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im5ld255dXBAZ21haWwuY29tIiwic3ViIjoyLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MDYzNTkzNDksImV4cCI6MTcwNjM1OTQwOX0.Lzmh4CVZKngSUwLwZ3kHJxwZTIDzgTQWV4sUhxFgnrw",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im5ld255dXBAZ21haWwuY29tIiwic3ViIjoyLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MDYzNTkzNDksImV4cCI6MTcwNjk2NDE0OX0.QLAhOOYTweCp4Qc4OiFyo-VbTRTMa25ekR6bOaQr2uw"
}
```
- 제한사항
1. 메일 인증된 사용자여야 합니다.


### 2. PATCH /auth/change-password
- 목적: 비밀번호 변경을 수행합니다.
- url : http://15.164.48.247:3000/auth/change-password
- request header
```json
{
    "Authorization" : "Bearer [jwt_access_token]"
}
```
- request body: ChangePasswordDto
```json
{
    "currentPassword" : "1234",
    "newPassword" : "12345"
}
```
- response 예시
```json
{
    "message": "비밀번호가 변경되었습니다."
}
```
- 제한사항
1. 메일 인증된 사용자여야 합니다.
2. currentPassword가 유저의 비밀번호와 일치해야합니다.


### 3. POST /auth/refresh
- 목적: 액세스 토큰을 새로고침합니다.
- url : http://15.164.48.247:3000/auth/refresh
- request header: none
- request body
```json
{
    "refresh_token": "[jwt_refresh_token]"
}
```
- response 예시
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im5ld255dXBAZ21haWwuY29tIiwic3ViIjoyLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MDYzNjA0MDQsImV4cCI6MTcwNjM2MDQ2NH0.3DLDG9hU5rQ_207c5H3KtWJNP840EuZ8KzKEGoPobls"
}
```
- 제한사항
1. user 테이블의 refreshToken 값 중 하나와 같아야합니다.


### 4. GET /auth/profile
- 목적: 현재 사용자의 프로필 정보를 조회합니다.
- url : http://15.164.48.247:3000/auth/profile
- request header
```json
{
    "Authorization" : "Bearer [jwt_access_token]"
}
```
- request body: none
- response 예시
```json
{
    "username": "newnyup@gmail.com",
    "sub": 2,
    "role": "ADMIN",
    "iat": 1706363055,
    "exp": 1706363115
}
```
- 제한사항
1. 이메일 인증이 되어있어야 합니다.






