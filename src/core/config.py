import yaml
from pathlib import Path


def load_config() -> dict:
    """Load config.yaml from the project root directory."""
    project_root = Path(__file__).resolve().parents[2]
    config_path = project_root / "config.yaml"
    if not config_path.exists():
        raise FileNotFoundError(f"❌ config.yaml not found at {config_path}")

    with open(config_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def get_value(cfg: dict, *keys: str):
    """
    Get a nested key from config (tries both flat and 'paths.*' formats).
    Example:
      get_value(cfg, "applies_dir") or get_value(cfg, "paths", "applies_dir")
    """
    # Try flat key first
    if keys[0] in cfg:
        return cfg[keys[0]]
    # Try nested under "paths"
    if "paths" in cfg and keys[-1] in cfg["paths"]:
        return cfg["paths"][keys[-1]]
    return None


def get_store_file() -> Path:
    """Return absolute Path to the Excel store_file defined in config.yaml."""
    cfg = load_config()
    value = get_value(cfg, "store_file")
    if not value:
        raise KeyError("❌ 'store_file' not found in config.yaml.")
    return Path(value).expanduser().resolve()


def get_applies_dir() -> Path:
    """Return absolute Path to applies_dir defined in config.yaml."""
    cfg = load_config()
    value = get_value(cfg, "applies_dir")
    if not value:
        raise KeyError("❌ 'applies_dir' not found in config.yaml.")
    return Path(value).expanduser().resolve()


def get_current_apply_dir() -> Path:
    """Return absolute Path to current_apply_dir defined in config.yaml."""
    cfg = load_config()
    value = get_value(cfg, "current_apply_dir")
    if not value:
        raise KeyError("❌ 'current_apply_dir' not found in config.yaml. Run apply.sh first.")
    return Path(value).expanduser().resolve()
