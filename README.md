## 다음 코드는 AWS에 배포되어 있습니다.
- 엔드포인트 확인 : http://15.164.48.247:3000/

## 서버 구동 방법 
- 다음과 같은 설정을 하셔야 합니다.

### 1. 환경 변수
- 이메일, 비밀번호, AWS RDS 비밀번호는 환경변수로 뺐습니다.
- 파일에서 'process.env.' 부분을 직접 수정하거나 환경변수 설정을 해줘야 합니다.

#### 윈도우에서
- cmd - 다음과 같이 설정하고 **재시작** 필요합니다.
```
setx AWS_RDS_PSWD "63814110"
setx EMAIL_PASSWORD "본인의_네이버_비밀번호"
setx EMAIL_USER "본인의_네이버_이메일"
```

#### 리눅스에서
- 다음 명령어를 입력하면 됩니다.
```
echo 'export AWS_RDS_PSWD=63814110' >> ~/.bashrc
echo 'export EMAIL_PASSWORD="본인의_네이버_비밀번호"' >> ~/.bashrc
echo 'export EMAIL_USER=본인의_네이버_이메일' >> ~/.bashrc

source ~/.bashrc
```

### 2. nestjs 시작
- 다음 명령어로 npm run을 시작합니다.
```
cd /path/to/ops-test
npm run start
```

### 3. (선택) docker mysql 환경을 선호시
```
docker pull mysql
docker run --name mysql-container -e MYSQL_ROOT_PASSWORD=1234 -e MYSQL_DATABASE=opstest -p 3306:3306 -d mysql
docker exec -it mysql-container mysql -u root -p
```


## 코드 설명
### auth
#### `auth.controller.ts`
인증(Authentication) 관련 기능을 구현한 컨트롤러입니다. 주요 기능은 다음과 같습니다:

1. `signIn`: `@Post('login')` 데코레이터를 통해 HTTP POST 요청을 '/auth/login' 경로로 받습니다. 사용자가 로그인할 때 사용되며, 요청 본문(Body)에서 받은 사용자 이름과 비밀번호를 `AuthService`의 `signIn` 메서드에 전달하여 처리합니다.
2. `changePassword`: `@Patch('change-password')` 데코레이터를 사용하여 HTTP PATCH 요청을 '/auth/change-password' 경로로 받습니다. 이 메서드는 사용자의 비밀번호를 변경하는 기능을 수행합니다. 요청에 포함된 현재 비밀번호와 새 비밀번호를 사용하여 `AuthService`의 `changePassword` 메서드를 호출합니다.
3. `refresh`: `@Post('refresh')` 데코레이터를 사용하여 '/auth/refresh' 경로로 HTTP POST 요청을 받습니다. 이 메서드는 사용자의 리프레시 토큰(Refresh Token)을 사용하여 새로운 액세스 토큰(Access Token)을 발급받는 기능을 수행합니다.
4. `getProfile`: `@Get('profile')` 데코레이터를 통해 HTTP GET 요청을 '/auth/profile' 경로로 받습니다. 이 메서드는 현재 인증된 사용자의 프로필 정보를 반환합니다.

각 메서드는 NestJS의 의존성 주입(Dependency Injection)을 통해 `AuthService`와 `UsersService` 인스턴스에 접근하여 필요한 비즈니스 로직을 수행합니다. 또한, `@Public()` 데코레이터는 특정 경로가 인증되지 않은 요청에도 열려 있음을 나타냅니다.


#### `auth.guard.ts`

AuthGuard라는 클래스는 CanActivate 인터페이스를 구현하며, 특정 경로에 대한 요청이 인증되어야 하는지를 결정하는 로직을 포함하고 있습니다. 주요 기능은 다음과 같습니다:

1. Public 경로 처리: Reflector를 사용하여 현재 경로가 public(즉, 인증 없이 접근 가능)인지 여부를 확인합니다. public 경로의 경우, 인증 검사 없이 접근을 허용합니다.
2. 토큰 추출 및 검증: HTTP 요청 헤더에서 JWT(JavaScript Web Token)를 추출합니다. 토큰이 없거나 유효하지 않은 경우 UnauthorizedException 예외를 발생시켜 요청을 거부합니다.
3. 사용자 인증: 유효한 토큰을 가진 경우, 토큰에 포함된 사용자 정보를 기반으로 데이터베이스에서 해당 사용자를 찾습니다. 사용자의 토큰이 저장된 토큰과 일치하지 않으면 인증에 실패합니다.
4. 특별 경로 처리: 특정 경로(/users/sendcode, /users/confirmcode)에 대해서는 사용자가 이메일 등으로 인증되지 않았어도 접근을 허용합니다. 이는 사용자가 인증 절차를 완료할 수 있도록 하는 예외 처리입니다.
5. 사용자 인증 상태 확인: 모든 검증이 끝난 후, 사용자가 인증된 상태인지 확인합니다. 인증되지 않은 경우 UnauthorizedException을 발생시킵니다.
6. 요청에 사용자 정보 추가: 사용자가 성공적으로 인증되면, 요청 객체에 사용자 정보(payload)를 추가합니다. 이를 통해 후속 컨트롤러나 미들웨어에서 사용자 정보를 사용할 수 있습니다.


#### `auth.service.ts`
AuthService 클래스는 사용자 인증과 관련된 여러 기능을 제공합니다. 주요 기능은 다음과 같습니다:

1. signIn: 사용자 로그인을 처리합니다. 사용자 이름과 비밀번호를 받아 사용자를 찾고, 비밀번호가 일치하는지 확인합니다. 비밀번호가 일치하면, 액세스 토큰과 리프레시 토큰을 생성하여 반환합니다.
2. refreshAccessToken: 리프레시 토큰을 사용하여 새 액세스 토큰을 생성합니다. 리프레시 토큰이 유효한지 확인한 후, 새 액세스 토큰을 생성하여 반환합니다.
3. changePassword: 사용자의 비밀번호를 변경합니다. 현재 비밀번호가 맞는지 확인한 후, 새 비밀번호로 업데이트합니다.
4. hashPassword: 비밀번호를 해시화합니다. 주어진 비밀번호에 대해 bcrypt를 사용하여 해시를 생성합니다.
5. comparePasswords: 저장된 해시와 제공된 비밀번호를 비교합니다. bcrypt를 사용하여 두 값이 일치하는지 확인합니다.
6. incrementLoginAttempts, resetLoginAttempts: 로그인 시도 횟수를 관리합니다. 로그인 실패 시 로그인 시도 횟수를 증가시키고, 성공적으로 로그인하면 시도 횟수를 리셋합니다.
7. createTokens: 액세스 토큰과 리프레시 토큰을 생성합니다. 사용자 정보를 바탕으로 JWT 토큰을 생성하여 반환합니다.

### users

#### `users.controller.ts`
이 컨트롤러는 사용자 등록, 사용자 목록 조회, 인증 코드 발송 및 확인 등의 기능을 제공합니다. 주요 메서드는 다음과 같습니다:

1. getAllUsers: @Get() 데코레이터를 사용하여 GET 요청을 '/users' 경로로 받습니다. 이 메서드는 UsersService의 getAllUsers 메서드를 호출하여 모든 사용자 정보를 조회합니다. 이 기능은 사용자의 역할에 따라 제한될 수 있습니다.
2. register: @Post('register') 데코레이터를 사용하여 POST 요청을 '/users/register' 경로로 받습니다. 사용자 등록을 위한 메서드로, 요청 본문(Body)에서 받은 데이터(RegisterDto)를 사용하여 새로운 사용자를 등록합니다.
3. sendCode: @Post('sendcode') 데코레이터를 사용하여 POST 요청을 '/users/sendcode' 경로로 받습니다. 이 메서드는 @GetUser() 데코레이터를 사용하여 JWT 토큰에서 사용자 정보를 추출하고, UsersService의 sendVerificationCode 메서드를 호출하여 인증 코드를 발송합니다.
4. confirmCode: @Post('confirmcode') 데코레이터를 사용하여 POST 요청을 '/users/confirmcode' 경로로 받습니다. 이 메서드는 사용자가 제공한 인증 코드를 검증합니다. 요청 본문에서 인증 코드(verificationCode)를 받고, @GetUser() 데코레이터를 사용하여 JWT 토큰에서 사용자 정보를 추출하여 UsersService의 confirmVerificationCode 메서드를 호출합니다.


#### `email.service.ts` 
이 서비스는 Node.js의 nodemailer 라이브러리를 사용하여 이메일을 보내는 기능을 제공합니다. 주요 구성 요소와 기능은 다음과 같습니다:

1. EmailOptions 인터페이스: 이메일을 보내기 위한 옵션을 정의합니다. 보내는 사람(from), 받는 사람(to), 메일 제목(subject), HTML 형식의 메일 본문(html)을 포함합니다.
2. transporter 객체: nodemailer.createTransport 함수를 사용하여 이메일 전송을 위한 transporter 객체를 생성합니다. 이 객체는 'naver' 서비스를 사용하며, 환경 변수에서 이메일 사용자 이름(EMAIL_USER)과 비밀번호(EMAIL_PASSWORD)를 가져와 인증에 사용합니다.
3. sendVerificationToEmail 메서드: 이메일 주소와 인증 코드를 받아 인증 이메일을 보내는 기능을 수행합니다. 이메일 옵션을 설정하고 transporter.sendMail 메서드를 사용하여 실제로 이메일을 전송합니다.


#### `users.service.ts`
이 클래스는 사용자와 관련된 여러 기능을 제공하는 서비스 레이어를 구현합니다. 주요 기능은 다음과 같습니다:

1. 사용자 찾기: findByUsername과 findByRefreshToken 메서드를 통해 사용자 이름이나 리프레시 토큰으로 사용자를 찾습니다.
2. 사용자 생성: createUser 메서드는 새로운 사용자를 데이터베이스에 저장합니다.
3. 비밀번호 업데이트: updatePassword 메서드는 사용자의 비밀번호를 업데이트합니다.
4. 모든 사용자 조회: findAll 메서드는 데이터베이스에 저장된 모든 사용자를 조회합니다.
5. 인증 코드 발송: sendVerificationCode 메서드는 사용자에게 인증 코드를 이메일로 발송합니다. 이메일 발송은 EmailService를 사용하여 처리됩니다.
6. 인증 코드 확인: confirmVerificationCode 메서드는 사용자가 제공한 인증 코드를 확인하고, 사용자의 인증 상태를 업데이트합니다.
7. 관리자 전용 사용자 조회: getAllUsers 메서드는 사용자 역할이 관리자일 경우에만 모든 사용자 정보를 조회합니다.
8. 사용자 등록: register 메서드는 새로운 사용자를 등록합니다. 이메일 중복 검사, 비밀번호 해싱 및 사용자 정보 저장을 포함합니다.

## /attempts
- 다음 디렉토리에 제가 문제를 풀었던 해결 과정이 들어있습니다.

## 마치며
- 옵스테크의 백엔드 개발자 역량 테스트를 진행하며 재밌었고 많이 배울 수 있었습니다.
- Spring을 지금껏 공부해오다 nestjs는 처음 접해봤는데 꽤 유사하다는 느낌을 받았습니다.
- 감사합니다.