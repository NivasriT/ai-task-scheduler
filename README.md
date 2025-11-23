# AI-Powered Smart Task Scheduler

An intelligent task management web application that uses AI to help users organize tasks, estimate workload, reduce stress, and optimize their schedule automatically.

## Features

- 📝 Natural language task creation
- 🧠 AI-powered smart scheduling
- 📊 Productivity analytics and insights
- 🔄 Automatic task prioritization
- 📱 Responsive web interface
- 🔒 User authentication and data security

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript, React
- **Backend**: Python, Flask
- **AI/ML**: spaCy, scikit-learn
- **Database**: SQLite (development), PostgreSQL (production)
- **Deployment**: Docker, Heroku/Render

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 16+ (for frontend)
- pip (Python package manager)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-task-scheduler.git
   cd ai-task-scheduler
   ```

2. Set up the backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   ```

3. Set up the frontend:
   ```bash
   cd ../frontend
   npm install
   ```

4. Create a `.env` file in the backend directory with the following variables:
   ```
   FLASK_APP=app.py
   FLASK_ENV=development
   SECRET_KEY=your-secret-key-here
   DATABASE_URL=sqlite:///app.db
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   flask run
   ```

2. In a new terminal, start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
ai-task-scheduler/
├── backend/               # Flask backend
│   ├── ai/               # AI and ML models
│   ├── models/           # Database models
│   ├── static/           # Static files
│   ├── templates/        # Flask templates
│   ├── __init__.py       # Application factory
│   ├── config.py         # Configuration
│   └── routes.py         # API routes
├── frontend/             # React frontend
│   ├── public/           # Static files
│   └── src/              # React components
├── .gitignore
├── README.md
└── requirements.txt      # Python dependencies
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all open-source projects that made this possible.
- Special thanks to the spaCy and Flask communities for their amazing tools.
