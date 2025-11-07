class SessionManager:
    def __init__(self):
        self.sessions = {}

    def create_session(self, websocket):
        self.sessions[websocket] = {}

    def set_session(self, websocket, key, value):
        if websocket not in self.sessions:
            raise TypeError("Session does not exists")

        self.sessions[websocket][key] = value

    def get_session(self, websocket):
        return self.sessions.setdefault(websocket, {})
    
    def remove_session(self, websocket):
        self.sessions.pop(websocket, None) 

# Single global instance
session_manager = SessionManager()