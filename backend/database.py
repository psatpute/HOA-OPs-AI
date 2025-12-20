from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
import logging

logger = logging.getLogger(__name__)

# Global database client
client: AsyncIOMotorClient | None = None
database = None


async def connect_to_mongo():
    """Connect to MongoDB Atlas."""
    global client, database
    try:
        client = AsyncIOMotorClient(settings.mongodb_uri)
        database = client.get_database()
        # Ping the database to verify connection
        await client.admin.command('ping')
        logger.info("Successfully connected to MongoDB Atlas")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Close MongoDB connection."""
    global client
    if client:
        client.close()
        logger.info("Closed MongoDB connection")


async def ping_database() -> bool:
    """Ping database to check connection status."""
    try:
        if client:
            await client.admin.command('ping')
            return True
        return False
    except Exception as e:
        logger.error(f"Database ping failed: {e}")
        return False