import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'default_fallback_key')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///site.db')