<<<<<<< HEAD
# Rentify
A web app for renting houses with CI/CD and AWS deployment

---

## 📊 Project Status — March 21, 2026

**Current Phase:** Design Phase → entering Development Phase (Mar 25)

According to the [project plan](PROJECT_PLANNING.md), the project runs from **Feb 27 – May 2026** and is currently transitioning from the Design Phase into active development.

---

## ✅ What Has Been Completed

### Infrastructure & DevOps
- [x] Git repository with branch strategy (`main`, `develop`)
- [x] CI pipeline (GitHub Actions) — Django tests run automatically on every push
- [x] Code quality pipeline — flake8, black, isort checks on every push
- [x] Deploy pipeline skeleton — ready for AWS credentials
- [x] SQLite used in CI, PostgreSQL configured for production
- [x] Project planning document with milestones through May 2026

### Backend — Django REST API
- [x] Django 4.2 project scaffolded with REST Framework
- [x] Custom `User` model (phone, avatar, bio, `is_property_owner` flag)
- [x] JWT authentication (Simple JWT) + CORS configured
- [x] `Property` model — full details (type, price, beds, baths, sq ft, availability, view count)
- [x] `Review` model — 1–5 star ratings, title, comment, helpful-vote counter
- [x] `Favorite` model — users can bookmark properties
- [x] `Message` model — direct messaging between users, with property reference and read/unread status
- [x] Migrations in place for all apps
- [x] Pytest test suite with coverage reporting
- [x] API docs with drf-spectacular (OpenAPI/Swagger)
- [x] Pagination, filtering (django-filter), search, and ordering on REST endpoints

### Still Pending (from plan)
- [x] Frontend application (React + Vite)
- [ ] Payment processing integration
- [ ] AWS deployment (EC2 / EB / ECS) — credentials & config needed
- [ ] Full end-to-end test coverage

---

## 🔄 CI/CD Health

| Workflow | Status |
|---|---|
| **CI – Django Backend Tests** | ✅ Passing |
| **Code Quality (flake8 / black / isort)** | ✅ Passing |
| **Deploy to Production** | ⚠️ Placeholder (add AWS credentials to secrets when ready) |

Workflows are defined in `.github/workflows/`:
- `ci.yml` — runs `pytest` with coverage on Python 3.13
- `code-quality.yml` — enforces flake8, black, and isort
- `deploy.yml` — skeleton for AWS deployment

---

## 🚀 Next Steps

Based on the project plan, the immediate next tasks are:

1. **Mar 21** — Implement user dashboard API endpoints
2. **Mar 22** — Set up a notification system (e.g., email on new message)
3. **Mar 23** — Code quality review & refactoring (CI already enforces this)
4. **Mar 24** — Feature demo checkpoint
5. **Mar 25 onward** — Full development sprints (see [PROJECT_PLANNING.md](PROJECT_PLANNING.md))

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 4.2 + Django REST Framework |
| Frontend | React 19 + Vite |
| Auth | Simple JWT |
| Database | SQLite (dev/CI) / PostgreSQL (production) |
| API Docs | drf-spectacular (OpenAPI 3) |
| CI/CD | GitHub Actions |
| Deployment | AWS (planned) |

---

## 🏃 Running Locally

### Backend

```bash
cd backend
pip install -r requirements-dev.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
cp .env.example .env          # Uses http://localhost:8000 by default
npm install
npm run dev                   # → http://localhost:5173
```

Run backend tests:

```bash
cd backend
pytest -v --cov=.
```
=======
# Renty
Renty is a full-stack web application for renting properties, built with Django REST Framework and PostgreSQL. It provides user authentication (JWT), property listings, messaging between users, and a scalable backend architecture.
>>>>>>> 1db41d555410a34d950b8f4af6874b4d14b7425a
