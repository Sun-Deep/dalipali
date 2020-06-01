module.exports = function Cart(oldCard) {
    this.items = oldCard.items || {};
    this.totalQty = oldCard.totalQty || 0;
    this.totalPrice = oldCard.totalPrice || 0;
    this.add = function (item, id) {
        var storedItem = this.items[id];
        if (!storedItem) {
            storedItem = this.items[id] = { item: item, qty: 0, price: 0 };
            storedItem.qty++;
            storedItem.price = storedItem.item[0].price * storedItem.qty;
            this.totalQty++;
            this.totalPrice += storedItem.item[0].price;  
        }
    };
    this.reduceByone = function (id) {
        this.items[id].qty--;
        this.items[id].price -= this.items[id].item[0].price;
        this.totalQty--;
        this.totalPrice -= this.items[id].item[0].price;
        if (this.items[id].qty <= 0) {
            delete this.items[id];
        }
    }
    this.addByone = function (id) {
        this.items[id].qty++;
        this.items[id].price += this.items[id].item[0].price;
        this.totalQty++;
        this.totalPrice += this.items[id].item[0].price;

    }
    this.generateArray = function () {
        var arr = [];
        for (var id in this.items) {
            arr.push(this.items[id]);
        }

        return arr;
    }

};