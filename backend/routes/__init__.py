from .auth import bp as auth_bp
from .tasks import bp as tasks_bp
from .scheduler import bp as scheduler_bp
from .analytics_new import bp as analytics_bp

def register_blueprints(app):
    """Register all blueprints with the Flask application."""
    app.register_blueprint(auth_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(scheduler_bp)
    app.register_blueprint(analytics_bp)
