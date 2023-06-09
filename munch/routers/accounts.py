from fastapi import (
    Depends,
    HTTPException,
    status,
    Response,
    APIRouter,
    Request,
)
from jwtdown_fastapi.authentication import Token
from authenticator import authenticator
from typing import List, Optional, Union
from pydantic import BaseModel


from queries.accounts import (
    AccountIn,
    AccountOut,
    AccountQueries,
    DuplicateAccountError,
    AccountOutWithPassword,
    Error
)


class AccountForm(BaseModel):
    username: str
    password: str


class AccountToken(Token):
    account: AccountOut


class HttpError(BaseModel):
    detail: str


router = APIRouter()


@router.get("munch/protected", response_model=bool)
async def get_protected(
    account_data: dict = Depends(authenticator.get_current_account_data),
):
    return True


@router.get("/token", response_model=AccountToken | None)
async def get_token(
    request: Request,
    account: AccountOut = Depends(authenticator.try_get_current_account_data)
) -> AccountToken | None:
    if account and authenticator.cookie_name in request.cookies:
        return {
            "access_token": request.cookies[authenticator.cookie_name],
            "type": "Bearer",
            "account": account,
        }


@router.post("/accounts", response_model=AccountToken | HttpError)
async def create_account(
    info: AccountIn,
    request: Request,
    response: Response,
    accounts: AccountQueries = Depends(),
):
    hashed_password = authenticator.hash_password(info.password)
    try:
        account = accounts.create(info, hashed_password)
    except DuplicateAccountError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create an account with those credentials",
        )
    form = AccountForm(username=info.username, password=info.password)
    token = await authenticator.login(response, request, form, accounts)
    return AccountToken(account=account, **token.dict())


@router.delete("/accounts/{id}", response_model=bool)
def delete_account(
    id: int,
    repo: AccountQueries = Depends(),
    account_data: dict = Depends(authenticator.get_current_account_data),
) -> bool:
    if account_data["id"] != id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete another user's account",
        )
    return repo.delete(id)


@router.put("/accounts/{id}", response_model=AccountOut)
def update_account(
    id: int,
    user: AccountIn,
    repo: AccountQueries = Depends(),
    account_data: Optional[dict] = Depends(
        authenticator.try_get_current_account_data
    ),
) -> AccountOutWithPassword:
    existing_user = repo.get_one(id)
    if existing_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if account_data is None:
        raise HTTPException(status_code=401, detail="Unauthorized")
    if existing_user.id != account_data["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    return repo.update(id, user)


@router.get("/accounts/{id}", response_model=AccountOut)
def get_account(
    id: int,
    response: Response,
    repo: AccountQueries = Depends(),
    account_data: Optional[dict] = Depends(
        authenticator.try_get_current_account_data
    ),
) -> AccountOut:
    user = repo.get_one(id)
    if user is not None and account_data is not None:
        return user
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if account_data is None:
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.get("/accounts", response_model=Union[List[AccountOut], Error])
def get_all_accounts(
    repo: AccountQueries = Depends(),
    account_data: dict = Depends(
        authenticator.get_current_account_data),
):
    if account_data is not None:
        return repo.get_all()
    else:
        raise HTTPException(status_code=401, detail="Unauthorized")
