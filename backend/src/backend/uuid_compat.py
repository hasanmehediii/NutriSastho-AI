"""UUID v7 default factory: stdlib on 3.13+, uuid6 package on older Python."""

try:
    from uuid import uuid7
except ImportError:
    from uuid6 import uuid7

__all__ = ["uuid7"]
