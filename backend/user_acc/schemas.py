from ninja import Schema

class LoginPayload(Schema):
    username: str
    password: str



class ForgetPasswordPayload(Schema):
    email: str


class SignupPayload(Schema):
    username: str
    email: str
    password: str
    user_type: str
    
