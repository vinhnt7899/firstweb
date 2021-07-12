<div class="py-1 bg-primary">
    <div class="container">
        <div class="row no-gutters d-flex align-items-start align-items-center px-md-0">
            <div class="col-lg-12 d-block">
                <div class="row d-flex">
                    <div class="col-md pr-4 d-flex topper align-items-center">
                        <div class="icon mr-2 d-flex justify-content-center align-items-center"><span
                                class="icon-phone2"></span></div>
                        <span class="text">{{ $setting->phone }}</span>
                    </div>
                    <div class="col-md pr-4 d-flex topper align-items-center">
                        {{--<div class="icon mr-2 d-flex justify-content-center align-items-center"><span
                                class="icon-paper-plane"></span></div>--}}
                        <span class="text"></span>
                    </div>
                    <div class="col-md-5 pr-4 d-flex topper align-items-center text-lg-right">
                        <span class="text">{{ $setting->email }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<nav class="navbar navbar-expand-lg navbar-dark ftco_navbar bg-dark ftco-navbar-light" id="ftco-navbar">
    <div class="container">
        <a class="navbar-brand" href="/"><img class="img-fluid" src="{{ asset($setting->image) }}" width="80px" alt=""></a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#ftco-nav"
                aria-controls="ftco-nav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="oi oi-menu"></span>
        </button>

        <div class="collapse navbar-collapse" id="ftco-nav">
            <ul class="navbar-nav ml-auto" style="margin-left: 0px !important;">
                <li class="nav-item active"><a href="/" class="nav-link" style="font-weight: 600;font-size: 14px">Trang chủ</a></li>

                <li class="nav-item active dropdown">
                    <a class="nav-link dropdown-toggle" style="font-weight: 600;font-size: 14px" href="" id="dropdown01" data-toggle="dropdown"
                       aria-haspopup="true" aria-expanded="false">CỬA HÀNG</a>
                    <div class="dropdown-menu" aria-labelledby="dropdown01">
                        <a class="dropdown-item" href="{{ route('shop.cart') }}">Giỏ hàng của tôi</a>
                        <a class="dropdown-item" href="{{ route('shop.cart.checkout') }}">Phương thức thanh toán</a>
                    </div>
                </li>

                {{--@foreach($menu as $item)
                    <li class="nav-item dropdown">
                        @if($item->parent_id == 0)
                    <a class="nav-link dropdown-toggle" href="" id="dropdown02" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{{ $item->name }}</a>

                            <div class="dropdown-menu" aria-labelledby="dropdown02">
                                @foreach($menu as $child)
                                    @if($child->parent_id == $item->id)
                                        <a class="dropdown-item" href="{{ route('shop.shop') }}" title="Cửa hàng">{{$child->name}}</a>
                                    @endif
                                @endforeach
                            </div>
                        @endif
                    </li>
                @endforeach--}}

                {{--<li class="nav-item active dropdown">

                    <a class="nav-link active dropdown-toggle" style="font-weight: 600;font-size: 14px" href="" id="dropdown02" data-toggle="dropdown"
                       aria-haspopup="true" aria-expanded="false">SẢN PHẨM</a>
                    <div class="dropdown-menu" aria-labelledby="dropdown02">
                        @foreach($menu as $item)
                            @if($item->parent_id == 0 && $item->type == 1)
                                <a class="dropdown-item" href="{{ route('shop.category', ['slug' => $item->slug]) }}"
                                   title="{{ $item->name }}">{{ $item->name }}</a>
                            @endif
                        @endforeach
                    </div>
                </li>--}}
                <li class="nav-item active"><a href="/san-pham" class="nav-link" style="font-weight: 600;font-size: 14px" title="Sản phẩm">Sản phẩm</a></li>
                <li class="nav-item active"><a href="{{ route('shop.about') }}" class="nav-link" style="font-weight: 600;font-size: 14px">Giới thiệu</a></li>
                <li class="nav-item active"><a href="{{ route('shop.article') }}" class="nav-link" style="font-weight: 600;font-size: 14px">Tin tức</a></li>
                <li class="nav-item active"><a href="{{ route('shop.contact') }}" class="nav-link" style="font-weight: 600;font-size: 14px">Liên hệ</a></li>
                <li class="nav-item cta cta-colored"><a href="{{ route('shop.cart') }}" style="font-weight: 600;font-size: 14px" class="nav-link">
                        <span class="icon-shopping_cart"></span>[
                        {{ !empty(session('totalItem')) ? session('totalItem') : 0 }}
                        ]</a></li>

            </ul>
            <form action="{{ route('shop.search') }}" method="GET" class="search-form-cat">
                <input value="{{ isset($keyword) ? $keyword : '' }}" style="width: 150px;" type="text" class="form-control search-form" name="tu-khoa" placeholder="Tìm kiếm" />
            </form>
        </div>
    </div>
</nav>
