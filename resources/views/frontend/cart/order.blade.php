@extends('frontend.layouts.main')

@section('content')
    <div class="hero-wrap hero-bread" style="background-image: url('frontend/images/bg_1.jpg');">
        <div class="container">
            <div class="row no-gutters slider-text align-items-center justify-content-center">
                <div class="col-md-9 ftco-animate text-center">
                    <p class="breadcrumbs"><span class="mr-2"><a href="index.html">Trang chủ</a></span>
                        <span>Giỏ hàng</span></p>
                    <h1 class="mb-0 bread">My Cart</h1>
                </div>
            </div>
        </div>
    </div>
    <div id="order">
        <section class="ftco-section">
            <div class="container">
                <div class="row justify-content-center">
                    @if(!session('msg'))
                        <div class="col-xl-7 ftco-animate">
                            <form action="{{ route('shop.cart.postOrder') }}" class="billing-form" method="post">
                                @csrf
                                <h3 class="mb-4 billing-heading">Thông tin đặt hàng</h3>
                                <div class="row align-items-end">
                                    <div class="col-md-12">
                                        <div class="form-group">
                                            <label for="firstname">Họ và tên</label>
                                            <input name="fullname" type="text" class="form-control" placeholder="">
                                            @if ($errors->has('fullname'))
                                                <span class="invalid-feedback" role="alert" style="color:red;">{{ $errors->first('fullname') }}</span>
                                            @endif
                                        </div>
                                    </div>
                                    <div class="w-100"></div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="phone">Điện thoại</label>
                                            <input name="phone" type="text" class="form-control" placeholder="Nhập số điện thoại">
                                            @if ($errors->has('phone'))
                                                <span class="invalid-feedback" role="alert" style="color:red;">{{ $errors->first('phone') }}</span>
                                            @endif
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="email">Email</label>
                                            <input name="email" type="text" class="form-control" placeholder="Nhập email của bạn">
                                            @if ($errors->has('email'))
                                                <span class="invalid-feedback" role="alert" style="color:red;">{{ $errors->first('email') }}</span>
                                            @endif
                                        </div>
                                    </div>
                                    <div class="w-100"></div>
                                    <div class="col-md-12">
                                        <div class="form-group">
                                            <label for="towncity">Địa chỉ nhận hàng</label>
                                            <input type="text" class="form-control" placeholder="" name="address">
                                            @if ($errors->has('address'))
                                                <span class="invalid-feedback" role="alert" style="color:red;">{{ $errors->first('address') }}</span>
                                            @endif
                                        </div>
                                    </div>
                                    <div class="w-100"></div>
                                    <div class="col-md-12">
                                        <div class="form-group">
                                            <label for="phone">Ghi chú</label>
                                            <input type="text" class="form-control" placeholder="">
                                        </div>
                                    </div>
                                    <div class="col-md-12">
                                        <div class="cart-detail p-3 p-md-4">
                                            <div class="form-group">
                                                <div class="col-md-12">
                                                    <div class="checkbox">
                                                        <label><input type="checkbox" value="" class="mr-2"> Tôi đã đọc và chấp nhận chính sách mua hàng.</label>
                                                    </div>
                                                </div>
                                            </div>
                                            <p><button type="submit" class="btn btn-primary py-3 px-4">Đặt Hàng</button></p>
                                        </div>
                                    </div>
                                </div>
                            </form><!-- END -->
                        </div>
                        <div class="col-xl-5">
                            <div class="row mt-5 pt-3">
                                <div class="col-md-12 d-flex mb-5">
                                    <div class="cart-detail cart-total p-3 p-md-4">
                                        <h3 class="billing-heading mb-4">Đơn hàng</h3>
                                        <p class="d-flex">
                                            <span>Số lượng SP</span>
                                            <span>{{ $totalCount }}</span>
                                        </p>
                                        <p class="d-flex">
                                            <span>Thanh toán</span>
                                            <span class="">{{ $totalPrice }} đ</span>
                                        </p>
                                    </div>
                                </div>
                                <div class="col-md-12">
                                    <p>
                                        <a href="/gio-hang" class="btn btn-black py-2 px-2">
                                            <span class="icon-shopping_cart"></span> Xem giỏ hàng
                                        </a>
                                        <a href="/" class="btn btn-warning py-2 px-2" style="float: right">
                                            <i class="icon-long-arrow-right"></i> Tiếp tục mua hàng
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div> <!-- .col-md-8 -->
                    @else
                        {{ session('msg') ? session('msg') : '' }}
                    @endif
                </div>
            </div>
        </section>
    </div>
@endsection


