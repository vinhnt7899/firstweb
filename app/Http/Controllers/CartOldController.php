<?php

namespace App\Http\Controllers;

use App\CartOld;
use App\Product;
use Illuminate\Http\Request;

class CartOldController extends GeneralController
{
    public function cart(Request $request)
    {
        return view('frontend.cart');
    }

    public function addToCart(Request $request, $id)
    {// remove session

        $product = Product::find($id);

//        dd($product);

        // Kiểm tra tồn tại giỏ hàng cũ
        $_cart = session('cart') ? session('cart') : '';
        // Khởi tạo giỏ hàng
        $_cart = new CartOld($_cart);
        // Thêm sản phẩm vào giỏ hàng
        $_cart->add($product);
        // Lưu thông tin vào session
        $request->session()->put('cart', $_cart);

        return redirect()->route('shop.cart');
    }

    // Xóa sp khỏi giỏ hàng
    public function removeToCart(Request $request, $id)
    {
        // Kiểm tra tồn tại giỏ hàng cũ
        $_cart = session('cart') ? session('cart') : '';
        // Khởi tạo giỏ hàng
        $cart = new CartOld($_cart);
        $cart->remove($id);

        if (count($cart->products) > 0) {
            // Lưu thông tin vào session
            $request->session()->put('cart', $cart);
        } else {
            $request->session()->forget('cart');
        }

        return view('frontend.components.cart');
    }

    public function checkout(){
        return view('frontend.checkout');
    }
}
