from backend.database.db import SessionLocal, engine, Base
from backend.models.user import User

print('DB exists and engine connects')
Base.metadata.create_all(bind=engine)

s = SessionLocal()
try:
    print('User table count:', s.query(User).count())
    u = User(email='test2@example.com', hashed_password='x')
    s.add(u)
    s.commit()
    print('Added user id', u.id)
    s.delete(u)
    s.commit()
    print('Cleanup successful')
finally:
    s.close()
