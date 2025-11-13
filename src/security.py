from passlib.context import CryptContext
import datetime
from typing import Dict, Optional
from loguru import logger

import jwt
from fastapi import Depends, HTTPException, status, Cookie
from fastapi.security import SecurityScopes, HTTPAuthorizationCredentials, HTTPBearer
from src.configuration import config

# argon for password hashing
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# Prehash is not needed with argon2 as it handles any length password natively
# def _prehash_password(password: str) -> str:
#     """
#     Pre-hash password with SHA-256 to:
#     1. Remove bcrypt's 72-byte limitation
#     2. Ensure consistent input length
#     3. Add extra security layer
#     """
#     # Hash with SHA-256
#     sha256_hash = hashlib.sha256(password.encode('utf-8')).digest()
#     # Base64 encode to make it bcrypt-friendly (44 characters)
#     return base64.b64encode(sha256_hash).decode('ascii')


def hash_password(password: str) -> str:
    """
    Hash password using argon2
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    data: dict, expires_delta: Optional[datetime.timedelta] = None
) -> str:
    """
    Create JWT access token using RS256
    For native ephmrl users (not Auth0)
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.datetime.now(datetime.UTC) + expires_delta
    else:
        expire = datetime.datetime.now(datetime.UTC) + datetime.timedelta(
            minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update(
        {
            "exp": expire,
            "iat": datetime.datetime.now(datetime.UTC),
            "iss": config.JWT_ISSUER,
            "aud": config.JWT_AUDIENCE,
            "type": "access",
        }
    )

    # Sign with RS256 using your private key (bytes)
    private_key_bytes = (
        config.JWT_PRIVATE_KEY.encode("utf-8")
        if isinstance(config.JWT_PRIVATE_KEY, str)
        else config.JWT_PRIVATE_KEY
    )

    encoded_jwt = jwt.encode(to_encode, private_key_bytes, algorithm="RS256")
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """Create refresh token with longer expiry"""
    to_encode = data.copy()
    expire = datetime.datetime.now(datetime.UTC) + datetime.timedelta(
        days=config.REFRESH_TOKEN_EXPIRE_DAYS
    )

    to_encode.update(
        {
            "exp": expire,
            "iat": datetime.datetime.now(datetime.UTC),
            "iss": config.JWT_ISSUER,
            "aud": config.JWT_AUDIENCE,
            "type": "refresh",
        }
    )

    # Sign with RS256 using your private key (bytes)
    private_key_bytes = (
        config.JWT_PRIVATE_KEY.encode("utf-8")
        if isinstance(config.JWT_PRIVATE_KEY, str)
        else config.JWT_PRIVATE_KEY
    )

    encoded_jwt = jwt.encode(to_encode, private_key_bytes, algorithm="RS256")
    return encoded_jwt


class UnauthorizedException(HTTPException):
    def __init__(self, detail: str, **kwargs):
        """Returns HTTP 403"""
        super().__init__(status.HTTP_403_FORBIDDEN, detail=detail)


class UnauthenticatedException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Requires authentication"
        )


class VerifyToken:
    def __init__(self):
        self.config = config

        # JWKS client for Auth0 tokens
        jwks_url = f"https://{self.config.AUTH0_DOMAIN}/.well-known/jwks.json"
        self.jwks_client = jwt.PyJWKClient(jwks_url)

    def _verify_native_token(self, token: str, token_type: str | None = None) -> Dict:
        """
        Verify native (non-Auth0) JWT token signed with your RS256 keys

        Args:
            token: JWT token string
            token_type: Expected token type ('access' or 'refresh'), None for any

        Returns:
            Decoded payload

        Raises:
            jwt.exceptions: If token is invalid
        """
        try:
            # Encode public key to bytes
            public_key_bytes = (
                self.config.JWT_PUBLIC_KEY.encode("utf-8")
                if isinstance(self.config.JWT_PUBLIC_KEY, str)
                else self.config.JWT_PUBLIC_KEY
            )

            payload = jwt.decode(
                token,
                public_key_bytes,
                algorithms=["RS256"],
                audience=self.config.JWT_AUDIENCE,
                issuer=self.config.JWT_ISSUER,
            )
            # Verify token type if specified
            if token_type and payload.get("type") != token_type:
                raise jwt.InvalidTokenError(
                    f"Invalid token type. Expected {token_type}, got {payload.get('type')}"
                )

            return payload

        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, jwt.DecodeError):
            raise

    def _verify_auth0_token(self, token: str) -> Dict:
        """
        Verify Auth0 OAuth token

        Args:
            token: JWT token string

        Returns:
            Decoded payload

        Raises:
            Exception: If token is invalid
        """
        try:
            # Get the signing key from Auth0's JWKS
            signing_key = self.jwks_client.get_signing_key_from_jwt(token).key

            payload = jwt.decode(
                token,
                signing_key,
                algorithms=self.config.AUTH0_ALGORITHMS,
                audience=self.config.AUTH0_API_AUDIENCE,
                issuer=self.config.AUTH0_ISSUER,
            )

            return payload

        except jwt.exceptions.PyJWKClientError as error:
            raise UnauthorizedException(str(error))
        except jwt.exceptions.DecodeError as error:
            raise UnauthorizedException(str(error))
        except Exception as error:
            raise UnauthorizedException(str(error))

    async def verify(
        self,
        security_scopes: SecurityScopes,
        token: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer()),
    ) -> Dict:
        """
        Verify access token (both native and Auth0).
        Use this as a dependency for protected routes.

        Args:
            security_scopes: FastAPI security scopes (not used currently)
            token: Authorization token from request header

        Returns:
            Decoded token payload

        Raises:
            UnauthenticatedException: If no token provided
            UnauthorizedException: If token is invalid
        """
        if token is None:
            raise UnauthenticatedException()
        if isinstance(token, HTTPAuthorizationCredentials):
            token_str = token.credentials
        else:
            token_str = token

        # Try native token first (more common)
        try:
            payload = self._verify_native_token(token_str, token_type="access")
            return payload
        except (
            jwt.ExpiredSignatureError,
            jwt.InvalidTokenError,
            jwt.DecodeError,
        ) as native_error:
            # If native verification fails, try Auth0
            try:
                logger.error(f"Native token verification failed: {str(native_error)}")
                payload = self._verify_auth0_token(token_str)
                return payload
            except Exception as error:
                logger.error(f"Auth0 token verification failed: {str(error)}")
                # Both failed, raise unauthorized
                raise UnauthorizedException(f"Invalid token {str(error)}")

    def verify_refresh_token_string(self, token: str) -> Dict:
        """
        Verify refresh token string (for body-based refresh).

        Args:
            token: JWT token string from request body

        Returns:
            Decoded token payload

        Raises:
            UnauthorizedException: If token is invalid or not a refresh token
        """
        try:
            payload = self._verify_native_token(token, token_type="refresh")
            return payload
        except jwt.ExpiredSignatureError:
            raise UnauthorizedException("Refresh token has expired")
        except jwt.InvalidTokenError as error:
            raise UnauthorizedException(f"Invalid refresh token: {str(error)}")
        except jwt.DecodeError as error:
            raise UnauthorizedException(f"Invalid refresh token format: {str(error)}")

    async def verify_from_cookie(self, access_token: str = Cookie(None)) -> Dict:
        """
        Verify access token (both native and Auth0) from HttpOnly cookie.
        Use this as a dependency for protected routes.

        Args:
            security_scopes: FastAPI security scopes (not used currently)
            token: Authorization token from request header

        Returns:
            Decoded token payload

        Raises:
            UnauthenticatedException: If no token provided
            UnauthorizedException: If token is invalid
        """
        if access_token is None:
            raise UnauthenticatedException()

        # Try native token first (more common)
        try:
            payload = self._verify_native_token(access_token, token_type="access")
            return payload
        except (
            jwt.ExpiredSignatureError,
            jwt.InvalidTokenError,
            jwt.DecodeError,
        ) as native_error:
            # If native verification fails, try Auth0
            try:
                logger.error(f"Native token verification failed: {str(native_error)}")
                payload = self._verify_auth0_token(access_token)
                return payload
            except Exception as error:
                logger.error(f"Auth0 token verification failed: {str(error)}")
                # Both failed, raise unauthorized
                raise UnauthorizedException(f"Invalid token {str(error)}")


auth = VerifyToken()
