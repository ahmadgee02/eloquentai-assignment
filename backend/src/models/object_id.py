

from typing_extensions import Annotated
from pydantic.functional_validators import BeforeValidator
from pydantic import PlainSerializer
from bson import ObjectId

def to_object_id(v):
    if v is None:
        return None
    if isinstance(v, ObjectId):
        return v
    try:
        return ObjectId(str(v))
    except Exception:
        raise ValueError("Invalid ObjectId")

# Reusable type for any ObjectId field
PyObjectId = Annotated[
    ObjectId,
    BeforeValidator(to_object_id),               # accept str/ObjectId
    PlainSerializer(lambda v: str(v), str),      # emit as string in JSON
]