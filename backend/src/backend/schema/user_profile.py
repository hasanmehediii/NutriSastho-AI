from pydantic import BaseModel, Field
from typing import Optional


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=120)
    phone: Optional[str] = Field(None, min_length=1, max_length=30)
    blood_group: Optional[str] = Field(None, min_length=1, max_length=10)
    location: Optional[str] = Field(None, min_length=1, max_length=120)
