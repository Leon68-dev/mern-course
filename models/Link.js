class Link{
    constructor(){
        this.ID = 0;
        this.From_ = "";
        this.To_ = "";
        this.Code = "";
        this.Click = 0;
        this.OwnerId = 0;
        this.DateCreated = new Date();
    }
}

module.exports = Link;