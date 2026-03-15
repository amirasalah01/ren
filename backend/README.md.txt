# 🏠 RENTIFY - Rental Property Management API

A comprehensive Django REST Framework API for managing rental properties, messaging, and reviews.

## 🚀 Features

- **Authentication**: JWT-based authentication
- **Properties**: Full CRUD operations with advanced search and filtering
- **Messaging**: User-to-user messaging system
- **Reviews**: Rating and review system with average calculations
- **Favorites**: Bookmark favorite properties
- **Search & Filter**: Advanced search with multiple filter options
- **Admin Panel**: Django admin for data management
- **API Documentation**: Swagger/OpenAPI integration

## 📋 Requirements

- Python 3.8+
- Django 4.0+
- Django REST Framework
- PostgreSQL (optional, SQLite for dev)

## 🔧 Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd rentify/backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/Scripts/activate  # Windows
source venv/bin/activate      # Mac/Linux
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Apply migrations**
```bash
python manage.py migrate
```

5. **Create superuser**
```bash
python manage.py createsuperuser
```

6. **Run server**
```bash
python manage.py runserver
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/logout/` - Logout user
- `POST /api/auth/refresh/` - Refresh token

### Properties
- `GET /api/properties/list/` - List all properties
- `POST /api/properties/list/` - Create property
- `GET /api/properties/<id>/` - Get property detail
- `PUT /api/properties/<id>/` - Update property
- `DELETE /api/properties/<id>/` - Delete property
- `GET /api/properties/search/` - Search & filter properties

### Reviews
- `GET /api/properties/<id>/reviews/` - List reviews
- `POST /api/properties/<id>/reviews/` - Create review
- `GET /api/properties/<id>/rating/` - Get average rating

### Messaging
- `GET /api/messages/inbox/` - Get inbox messages
- `GET /api/messages/sent/` - Get sent messages
- `POST /api/messages/send/` - Send message

### Favorites
- `GET /api/properties/favorites/` - Get favorite properties
- `POST /api/properties/favorites/` - Add favorite
- `DELETE /api/properties/favorite/<id>/` - Remove favorite

## 📖 API Documentation

- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **Schema**: http://localhost:8000/api/schema/

## 🧪 Testing

Run all tests:
```bash
python manage.py test
```

## 🔐 Security

- JWT authentication
- CORS protection
- XSS protection
- CSRF protection
- Rate limiting

## 📦 Deployment

See `DEPLOYMENT.md` for production deployment guide.

## 👨‍💻 Author

Built with ❤️ during 6-day intensive development

## 📄 License

MIT License