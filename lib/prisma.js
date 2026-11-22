// Bu dosya, projede tek bir Prisma bağlantısı kullanmamızı sağlar.
// Özellikle Next.js development modunda dosyalar tekrar tekrar reload olur.
// Eğer bunu yapmazsak çok fazla database bağlantısı açılabilir.
// Bu dosya, merkezi database erişim noktasıdır.


// The concept of a singleton Prisma Client in a Next.js application is used to ensure
// that only one instance of the Prisma Client is created and reused throughout the application.

// Prisma Client:
// npx prisma generate -> Schema'yı okur, buna göre JS kodu üretir. 
// generated klasörü aslında Schema'nın JS karşılığıdır. Örneğin biz Product Model'ını oluşturduktan sonra,
// generated klasörü bize 'prisma.product.findMany()' gibi bir çok metodu otomatik olarak oluşturuyor.

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ?? // Daha önce global.prisma oluşturuldu mu? Hayır ise yeni oluştur.
  new PrismaClient({
    adapter,
  });

/** Next.js Development Modunda: Yukarıdaki kod şöyle olsaydı: 'export const prisma = new PrismaClient();'
 *  Her 'CTRL + S' yaptığımızda server yeniden başlatılacaktı
 *  ve her kaydettiğimizde: DB bağlantısı -> DB bağlantısı -> DB bağlantısı,
 *  şeklinde yeni bağlantılar açılacaktı. Bir süre sonra PostgreSQL bize 200 tane bağlantı açmışsın diyecekti.
 *  İşte bu yüzden singleton yazıyoruz.
 *  Peki neden her dosyada 'new PrismaClient()' demiyoruz?
 *  Çünkü 'login API', 'register API', 'order API' gibi tüm dosyaların hepsi her yeni request'te bir bağlantı açacaktı.
 *  Onun yerine heryerde: import { prisma } from '@/lib/prisma;' kullanacağız.
 */



if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/* import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
} */