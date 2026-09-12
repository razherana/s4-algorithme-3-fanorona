from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

db = SQLAlchemy()


def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS for all routes

    # Configuration (use .env for secrets)
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    # SQLite by default
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize extensions
    db.init_app(app)

    # Register blueprints
    from app.routes import main_bp
    app.register_blueprint(main_bp)

    return app
