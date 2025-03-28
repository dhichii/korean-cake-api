-- CreateTable
CREATE TABLE "orders" (
    "id" VARCHAR(255) NOT NULL,
    "userId" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "layer" INTEGER,
    "isUseTopper" BOOLEAN NOT NULL,
    "pickupTime" BIGINT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "downPayment" DOUBLE PRECISION NOT NULL,
    "remainingPayment" DOUBLE PRECISION NOT NULL,
    "telp" VARCHAR(15) NOT NULL,
    "notes" TEXT,
    "text" VARCHAR(255) NOT NULL,
    "textColor" VARCHAR(120) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pictures" (
    "id" VARCHAR(255) NOT NULL,
    "orderId" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "pictures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processes" (
    "id" VARCHAR(255) NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "step" INTEGER NOT NULL,

    CONSTRAINT "processes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_progresses" (
    "orderId" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "isFinish" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "order_progresses_pkey" PRIMARY KEY ("orderId","processId")
);

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pictures" ADD CONSTRAINT "pictures_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processes" ADD CONSTRAINT "processes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_progresses" ADD CONSTRAINT "order_progresses_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_progresses" ADD CONSTRAINT "order_progresses_processId_fkey" FOREIGN KEY ("processId") REFERENCES "processes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
