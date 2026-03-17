from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.rag.ingestion import IngestionService

if __name__ == "__main__":
    stats = IngestionService().seed_free_data()
    print({"fetched": stats.fetched, "skipped": stats.skipped, "failed": stats.failed})
