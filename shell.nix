{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs;
    [ 
      python312Full
      python312Packages.fastapi
      python312Packages.requests
      python312Packages.pip
      python312Packages.sqlmodel
      python312Packages.python-multipart
      python312Packages.email-validator
      python312Packages.passlib
      python312Packages.tenacity
      python312Packages.pydantic
      python312Packages.fastapi-mail
      python312Packages.jinja2
      python312Packages.alembic
      python312Packages.httpx
      python312Packages.psycopg
      python312Packages.bcrypt
      python312Packages.pydantic-settings
      python312Packages.sentry-sdk
      python312Packages.pyjwt
      nodejs_22
    ];
} 
