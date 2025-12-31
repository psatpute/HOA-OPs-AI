from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
import logging
import certifi
import ssl
import os

logger = logging.getLogger(__name__)

# Global database client
client: AsyncIOMotorClient | None = None
database = None


async def connect_to_mongo():
    """Connect to MongoDB Atlas."""
    global client, database
    try:
        # Workaround for Python 3.13 + OpenSSL 3.x TLS issue
        # Point to custom OpenSSL config that allows legacy renegotiation
        import pathlib
        config_path = pathlib.Path(__file__).parent / 'openssl_legacy.cnf'
        os.environ['OPENSSL_CONF'] = str(config_path.absolute())
        
        logger.info(f"Using OpenSSL config: {os.environ['OPENSSL_CONF']}")
        
        # Add TLS/SSL settings for Python 3.13 compatibility
        client = AsyncIOMotorClient(
            settings.mongodb_uri,
            tls=True,
            tlsCAFile=certifi.where(),
            tlsAllowInvalidCertificates=False,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000
        )
        database = client.hoaops
        # Ping the database to verify connection
        await client.admin.command('ping')
        logger.info("Successfully connected to MongoDB Atlas")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        logger.warning("Server will continue without database connection. Some features may be unavailable.")
        # Don't raise - allow server to start without DB for AI chatbot functionality


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