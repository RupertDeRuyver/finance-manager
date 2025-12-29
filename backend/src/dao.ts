import { PrismaClient } from "@prisma/client";
import { Category } from "./Entities/category";

export class DAO {

    private db: PrismaClient;

    static getSubcategories(category: Category): Category[] {
        // TODO
        return [];
    }

}