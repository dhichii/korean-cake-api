-- CreateTable
CREATE TABLE "authentications" (
    "token" VARCHAR(300) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "authentications_pkey" PRIMARY KEY ("token")
);
