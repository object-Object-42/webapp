import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import Organisation, OrganisationCreate, OrganisationPublic, OrganisationsPublic, OrganisationUpdate, Message

router = APIRouter()


@router.get("/", response_model=OrganisationsPublic)
def read_organisation(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve organisations.
    """

    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(Organisation)
        count = session.exec(count_statement).one()
        statement = select(Organisation).offset(skip).limit(limit)
        organisations = session.exec(statement).all()
    else:
        count_statement = (
            select(func.count())
            .select_from(Organisation)
        )
        count = session.exec(count_statement).one()
        statement = (
            select(Organisation)
            .offset(skip)
            .limit(limit)
        )
        organisations = session.exec(statement).all()

    return OrganisationsPublic(data=organisations, count=count)


@router.get("/{org_id}", response_model=OrganisationPublic)
def read_organisation(session: SessionDep, current_user: CurrentUser, org_id: uuid.UUID) -> Any:
    """
    Get organisation by ID.
    """
    organistaion = session.get(Organisation, org_id)
    if not organistaion:
        raise HTTPException(status_code=404, detail="Organistaion not found")
    if not current_user.is_superuser :
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return organistaion


@router.post("/", response_model=OrganisationPublic)
def create_organisation(
    *, session: SessionDep, current_user: CurrentUser, organisation_in: OrganisationCreate
) -> Any:
    """
    Create new organisation.
    """
    organisation = Organisation.model_validate(organisation_in)
    session.add(organisation)
    session.commit()
    session.refresh(organisation)
    return organisation


@router.put("/{org_id}", response_model=OrganisationPublic)
def update_organisation(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    org_id: uuid.UUID,
    organisation_in: OrganisationUpdate,
) -> Any:
    """
    Update an organisation.
    """
    organisation = session.get(Organisation, org_id)
    if not organisation:
        raise HTTPException(status_code=404, detail="Organistaion not found")
    if not current_user.is_superuser:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    update_dict = organisation_in.model_dump(exclude_unset=True)
    organisation.sqlmodel_update(update_dict)
    session.add(organisation)
    session.commit()
    session.refresh(organisation)
    return organisation


@router.delete("/{org_id}")
def delete_organisation(
    session: SessionDep, current_user: CurrentUser, org_id: uuid.UUID
) -> Message:
    """
    Delete an organisation.
    """
    print(org_id)
    organisation = session.get(Organisation, org_id)
    if not organisation:
        raise HTTPException(status_code=404, detail="Organistaion not found")
    if not current_user.is_superuser :
        raise HTTPException(status_code=400, detail="Not enough permissions")
    session.delete(organisation)
    session.commit()
    return Message(message="Organistaion deleted successfully")
