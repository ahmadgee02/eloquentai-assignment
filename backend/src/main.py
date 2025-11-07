from .api import router
from .config import settings
from .setup import create_application

app = create_application(router=router, settings=settings)