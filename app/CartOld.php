<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class CartOld extends Model
{
    public $products; // danh sản phẩm
    public $totalPrice = 0; // tông
    public $totalQty = 0; // tổng sô SP
    public $discount = 0; // giá giảm
    public $coupon; // Mã giảm giá

    public function __construct($cart)
    {
        parent::__construct();

        if (!empty($cart)) {

            $this->products = $cart->products;
            $this->totalPrice = $cart->totalPrice;
            $this->totalQty = $cart->totalQty;
            $this->discount = $cart->discount;
            $this->coupon = $cart->coupon;
        }
    }

    // Thêm sản phẩm vào giỏ hàng
    public function add($product)
    {

        $_item = [
            'qty' => 0,
            'price' => $product->sale,
            'item' => $product
        ];

        if ($this->products && array_key_exists($product->id, $this->products)) {
            $_item = $this->products[$product->id];
        }

        $_item['qty']++;
        $_item['price'] = $_item['qty'] * $product->sale;

        $this->products[$product->id] = $_item;
        $this->totalPrice = $this->totalPrice + $product->sale;
        $this->totalQty = $this->totalQty + 1; // tăng lên 1 sản phẩm
    }

    public function remove($id)
    {
        // trừ bớt số lượng
        $this->totalQty = $this->totalQty - $this->products[$id]['qty'];
        // trừ giá
        $this->totalPrice = $this->totalPrice - $this->products[$id]['price'];

        unset($this->products[$id]);

    }
}
