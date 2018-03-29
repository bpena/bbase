export class User {
    constructor(
        public username: string,
        public password: string,
        public email?: string,
        public firstname?: string,
        public lastname?: string,
        public createdAt?: number,
        public id?: string
    ) {
        this.createdAt = Date.now();
    }
    
}