import { DAO } from "../dao";

export class Category {
    private parent: Category | undefined
    private name: string;

    constructor(name: string) {
        this.name = name;
    }

    createSubcategory(name: string): Category {
        let sub = new Category(name);
        sub.parent = this;
        return sub;
    }

    getName(): string {
        return this.name;
    }

    setName(name: string): void {
        this.name = name;
    }

    getParent(): Category | undefined {
        return this.parent;
    }

    getSubcategories(): Category[] {
        return DAO.getSubcategories(this);
    }
}