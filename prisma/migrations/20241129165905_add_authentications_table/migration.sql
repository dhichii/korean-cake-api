-- CreateTable
CREATE TABLE "authentications" (
    "token" VARCHAR(500) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "authentications_pkey" PRIMARY KEY ("token")
);
