-- CreateTable
CREATE TABLE "authentications" (
    "token" VARCHAR(500) NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "authentications_pkey" PRIMARY KEY ("token")
);

-- AddForeignKey
ALTER TABLE "authentications" ADD CONSTRAINT "authentications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
