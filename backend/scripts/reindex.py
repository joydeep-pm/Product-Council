from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.db.init_db import init_db
from app.db.session import get_db_session
from app.rag.ingestion import IngestionService

if __name__ == "__main__":
    init_db()
    service = IngestionService()
    with get_db_session() as db:
        stats = service.reindex(db)
    print(
        {
            "documents_indexed": stats.documents_indexed,
            "documents_skipped": stats.documents_skipped,
            "chunks_indexed": stats.chunks_indexed,
        }
    )
