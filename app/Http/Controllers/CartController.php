<?php

namespace App\Http\Controllers;

use App\Order;
use App\OrderDetail;
use App\Product;
use Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use League\Flysystem\Exception;

class CartController extends GeneralController
{
    /**
     * Danh sách sản phẩm trong giỏ hàng
     */
    public function cart()
    {
        $cart = Cart::content();
        $totalPrice = Cart::total(0,",","."); // lấy tổng giá của sản phẩm

        return view('frontend.cart', [
            'cart' => $cart,
            'totalPrice' => $totalPrice
        ]);
    }

    /**
     * Thêm sản phẩm vào giỏ hàng
     * @param Request $request
     * @param $id
     */
    public function addToCart(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $cartInfo = [
            'id' => $product->id,
            'name' => $product->name,
            'qty' => 1,
            'price' => $product->sale,
            'options' => [
                'image' => $product->image
            ]
        ];

        // gọi đến thư viện thêm sản phẩm vào giỏ hàng
        Cart::add($cartInfo);

        session(['totalItem' => Cart::count()]);

        // chuyển về trang danh sách
        return redirect()->route('shop.cart');
    }

    // Hủy đơn hàng
    public function destroy(Request $request)
    {
        // remove session
        Cart::destroy();

        return redirect('/');
    }

    /**
     * Đặt hàng
     */
    public function order()
    {
        $totalCount = Cart::count();
        $totalPrice = Cart::total(0,",","."); // lấy tổng giá của sản phẩm

        // Kiểm tra xem có sản phẩm nào trong giỏ hàng
        if ($totalCount <= 0) {
            return back()->with('msg', 'Bạn chưa có sản phẩm nào trong giỏ hàng');
        }

        return view('frontend.cart.order', [
            'totalCount' => $totalCount,
            'totalPrice' => $totalPrice,
            'is'
        ]);
    }

    /**
     * Xử lý lưu đơn đặt hàng
     */
    public function postOrder(Request $request)
    {
        $request->validate([
            'fullname' => 'required|max:255',
            'phone' => 'required',
            'email' => 'required|email',
            'address' => 'required',
        ]);

        $cart = Cart::content();
        $totalCount = Cart::count();
        $totalPrice = Cart::total(0,",","."); // lấy tổng giá của sản phẩm

        // Kiểm tra tồn tại giỏ hàng cũ
        try {
            // Lưu vào bảng đơn đặt hàng - orders
            $order = new Order();
            $order->fullname = $request->input('fullname');
            $order->phone = $request->input('phone');
            $order->email = $request->input('email');
            $order->address = $request->input('address');
            $order->note = $request->input('note');
            $order->total = $totalPrice;
            $order->order_status_id = 1; // 1 = mới
            // Lưu vào bảng chỉ tiết đơn đặt hàng
            if ($order->save()) {
                $maDonHang = 'DH-'.$order->id.'-'.date('d').date('m').date('Y'); // Tạo mã đơn hàng
                $order->code = $maDonHang;
                $order->save();

                if (count($cart) >0) {
                    foreach ($cart as $key => $item) {
                        $_detail = new OrderDetail();
                        $_detail->order_id = $order->id;
                        $_detail->name = $item->name;
                        $_detail->image = $item->options->image;
                        $_detail->product_id = $item->id;
                        $_detail->qty = $item->qty;
                        $_detail->price = $item->price;
                        $_detail->save();
                    }
                }

                // Xóa thông tin giỏ hàng Hiện tại sau khi đặt hàng thành công
                Cart::destroy();

                return redirect()->route('shop.cart.completedOrder')->with('msg', 'Cảm ơn bạn đã đặt hàng. Mã đơn hàng của bạn : #'.$order->code);
            }

        } catch (Exception $e) {
            return redirect()->route('shop.cart.completedOrder')->with('msg', 'Đã xảy ra lỗi, vui lòng thử lại');
        }
    }

    /**
     * Xóa sản phảm khỏi giỏ hàng
     * @param $id Product Id
     */
    public function removeToCart($rowId)
    {
        // xóa sản phẩm trong giỏ
        Cart::remove($rowId);

        $cart = Cart::content();
        $totalPrice = Cart::total(0,",","."); // lấy tổng giá của sản phẩm

        return view('frontend.components.cart', [
            'cart' => $cart,
            'totalPrice' => $totalPrice
        ]);
    }

    /**
     * Cập nhật số lượng sản phẩm trong giỏ
     */
    public function updateToCart(Request $request)
    {
        // check nhập số lượng không đúng định dạng
        $validator = Validator::make($request->all(), [
            'qty' => 'required|numeric|min:1',
        ]);

        // check số lượng lỗi
        if ($validator->fails()) {
            return false;
        }

        $rowId = $request->input('rowId');
        $qty = (int) $request->input('qty');

        // cập nhật lại số lương
        Cart::update($rowId, $qty);

        $cart = Cart::content();
        $totalPrice = Cart::total(0,",","."); // lấy tổng giá của sản phẩm


        return view('frontend.components.cart', [
            'cart' => $cart,
            'totalPrice' => $totalPrice
        ]);
    }

    /**
     * Form Hiển thị hoàn tất đơn đặt hàng
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function completedOrder()
    {
        return view('frontend.cart.completed');
    }
}
