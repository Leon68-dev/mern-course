class User{
    constructor(email, password){
        this.Email = email;
        this.Password = password;
        this.ID = 0;
        this.DateCreated = new Date();
    }
}

module.exports = User;