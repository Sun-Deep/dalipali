var removeCart = document.getElementsByClassName('btn-dangers');
for (var i = 0; i <= removeCart.length; i++) {
    var button = removeCart[i]
    button.addEventListener('click',function (event) {
        var buttonClicked = event.target
        buttonClicked.parentElement.parentElement.remove()
        // updateCartTotal()
    })
}
function updateCartTotal() {
    var cartItemContiner = document.getElementsByClassName('cart-items')[0]
    var cartRow = cartItemContiner.getElementsByClassName('cart-row')
    var total = 0
    console.log(carRow)
    for (var i = 0; i < cartRow.length;i++){
        var carRows = cartRow[i];
        var priceElement = carRows.getElementsByClassName('cart-item-price')[0]
        var quantityElement = carRows.getElementsByClassName('cart-quantity-input')[0]
        var price = parseFloat( priceElement.innerText.replace('Rs',''))
        var quantity=quantityElement.value
        total = total+ price * quantity
    }
    console.log(total)
}