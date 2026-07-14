import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL?.includes('?')
  ? `${process.env.DATABASE_URL}&uselibpqcompat=true`
  : `${process.env.DATABASE_URL}?uselibpqcompat=true`

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export default prisma