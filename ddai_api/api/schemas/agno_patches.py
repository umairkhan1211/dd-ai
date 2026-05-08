"""
Runtime monkey-patch for Agno Memory v2 to add metadata support
This patches the existing UserMemory class to support metadata parameter
"""
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

def patch_agno_user_memory():
    """
    Monkey-patch the Agno UserMemory class to support metadata
    This must be called before any Agno memory operations
    """
    try:
        # Import the original UserMemory class
        from agno.memory.v2.schema import UserMemory
        
        # Store the original __init__ method
        original_init = UserMemory.__init__
        
        def patched_init(self, memory: str, topics: Optional[List[str]] = None, 
                        input: Optional[str] = None, last_updated: Optional[datetime] = None, 
                        memory_id: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None):
            """Enhanced __init__ that accepts metadata parameter but ignores it for compatibility"""
            # Call the original __init__ without the metadata parameter
            original_init(self, memory=memory, topics=topics, input=input, 
                         last_updated=last_updated, memory_id=memory_id)
            
            # Store metadata as an instance attribute if provided
            if metadata is not None:
                self.metadata = metadata
            else:
                self.metadata = {}
        
        # Replace the __init__ method
        UserMemory.__init__ = patched_init
        
        logger.info("Successfully patched Agno UserMemory class to support metadata")
        return True
        
    except ImportError as e:
        logger.warning(f"Could not import Agno UserMemory for patching: {e}")
        return False
    except Exception as e:
        logger.error(f"Failed to patch Agno UserMemory: {e}")
        return False

def ensure_agno_compatibility():
    """
    Ensure Agno compatibility by applying necessary patches
    This should be called once at application startup
    """
    logger.info("Ensuring Agno Memory v2 compatibility...")
    
    # Apply the UserMemory patch
    if patch_agno_user_memory():
        logger.info("Agno Memory v2 compatibility patches applied successfully")
        return True
    else:
        logger.warning("Some Agno compatibility patches failed - memory system may have limitations")
        return False

# Auto-apply patches when this module is imported
if __name__ != "__main__":
    ensure_agno_compatibility()
