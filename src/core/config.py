import yaml
from pathlib import Path

def load_config():
    """Load config.yaml from project root."""
    project_root = Path(__file__).resolve().parents[2]
    config_path = project_root / "config.yaml"
    if not config_path.exists():
        raise FileNotFoundError(f"❌ config.yaml not found at {config_path}")
    with open(config_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}

def get_store_file() -> Path:
    """Return absolute Path to store_file defined in config.yaml."""
    cfg = load_config()
    store_path = cfg.get("paths", {}).get("store_file")
    if not store_path:
        raise KeyError("❌ 'store_file' not defined in config.yaml")
    return Path(store_path).expanduser().resolve()

def get_applies_dir() -> Path:
    """Return applies_dir from config.yaml."""
    cfg = load_config()
    applies_path = cfg.get("paths", {}).get("applies_dir")
    if not applies_path:
        raise KeyError("❌ 'applies_dir' not defined in config.yaml")
    return Path(applies_path).expanduser().resolve()


def get_current_apply_dir() -> Path:
    cfg = load_config()
    current_dir = cfg.get("current_apply_dir")
    if not current_dir:
        raise KeyError("❌ 'current_apply_dir' not found in config.yaml. Run apply.sh first.")
    return Path(current_dir).expanduser().resolve()
