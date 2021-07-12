<?php

namespace App\Http\Controllers;

use App\Article;
use App\Banner;
use App\Brand;
use App\Category;
use App\Contact;
use App\Product;
use App\Setting;
use App\Vendor;
use Illuminate\Http\Request;
use Cart;

class ShopController extends GeneralController
{
    public function __construct()
    {
        parent::__construct();
    }

    public function index()
    {
        $banners = Banner::where('is_active', 1)->orderBy('position', 'ASC')
            ->orderBy('id', 'DESC')->get();

        $hotProducts= Product::where(['is_active'=>1],['is_hot'=>1])
                                ->limit(12)
                                ->orderBy('id','desc')
                                ->get();
        $categories = Category::where([
            'is_active' => 1,
            'parent_id' => 0
        ])->orderBy('position', 'ASC')->get();

//        dd($hotProducts);

        return view('frontend.index', [
            //'cart' => $cart,
            'banners' => $banners,
            'hotProducts' => $hotProducts,
            'categories' => $categories
        ]);
    }

    public function contact()
    {
        return view('frontend.contact');
    }

    public function postContact(Request $request)
    {
        //validate
        $request->validate([
            'name' => 'required|max:255',
            'email' => 'required|email'
        ], [
            'name.required' => 'Bạn cần nhập vào tên',
            'email.required' => 'Bạn cần nhập vào địa chỉ email',
            'email.email' => 'Địa chỉ email không hợp lệ'
        ]);

        $contact = new Contact();
        $contact->name = $request->input('name');
        $contact->phone = $request->input('phone');
        $contact->email = $request->input('email');
        $contact->content = $request->input('content');
        $contact->save();
        return redirect()->route('shop.contact')->with('msg', 'Bạn đã gửi tin nhắn thành công');
    }

    public function product(){

        $brands = Brand::where(['is_active' => 1])->get();

        $products = Product::where(['is_active' => 1])
            ->orderBy('id', 'desc')
            ->paginate(12);

        return view('frontend.product.all_product',[
            'brands' => $brands,
            'products' => $products
        ]);
    }

    public function detailProduct($slug){
        $product = Product::where(['is_active' => 1,'slug' => $slug])->first();

        $sameProducts= Product::where(['is_active'=>1],['is_hot'=>1])
            ->limit(4)
            ->orderBy('id','desc')
            ->get();
        return view('frontend.product.detail',[
            'product' => $product,
            'sameProducts' => $sameProducts
        ]);
    }

    public function category($slug){

        $category = Category::where(['slug' => $slug])->first();

        $brands = Brand::where(['is_active' => 1])->get();

        $products_by_cat = Product::where(['is_active' => 1,'parent_id' => $category->id ])
            ->orderBy('id', 'desc')
            ->paginate(12);

        $products_by_cat_child = Product::where(['is_active' => 1,'category_id' => $category -> id])
            ->orderBy('id', 'desc')
            ->paginate(12);

        return view('frontend.product.cat',[
            'products_by_cat' => $products_by_cat,
            'products_by_cat_child' => $products_by_cat_child,
            'brands' => $brands,
            'category' => $category,
        ]);
    }

    public function categoryChild($slug){
        $category = Category::where(['slug' => $slug])->first();

        $brands = Brand::where(['is_active' => 1])->get();
    }

    public function brand($slug){
        $brands = Brand::where(['slug' => $slug])->first();

        $products_by_brand = Product::where(['is_active' => 1, 'brand_id' => $brands -> id])
            ->orderBy('id', 'desc')
            ->paginate(12);

        return view('frontend.product.brand',[
            'brands' => $brands,
            'products_by_brand' => $products_by_brand
        ]);
    }

    public function about()
    {
        $settings = Setting::where('id', 1)->get();
        return view('frontend.about', [
            'settings' => $settings
        ]);
    }

    public function article()
    {

        $categories = Category::where([
            'type' => 2,
            'is_active' => 1,
            'parent_id' => 0
        ])->orderBy('position', 'ASC')->get();

//         $articles = Article::latest()->paginate(5);
//        $articles = Article::where('is_active', 1)->orderBy('position', 'ASC')->orderBy('id', 'DESC')->get();
        $articles = Article::where('is_active', 1)->orderBy('position', 'DESC')->orderBy('id', 'DESC')->paginate(3);

        $articles_limit = Article::where('is_active',1)->orderBy('position', 'ASC')->orderBy('id', 'ASC')->limit(3)->get();

//        dd($articles_limit);

        return view('frontend.article.article', [
            'articles' => $articles,
            'categories' => $categories,
            'limit' => $articles_limit
        ]);

    }

    public function articleCategory($slug){

        $category = Category::where([
            'type' => 2,
            'is_active' => 1,
            'slug' => $slug
        ])->first();

        $article_by_cat = Article::where(['is_active' => 1, 'category_id' => $category -> id])->paginate(3);

        $articles_limit = Article::where('is_active',1)->orderBy('position', 'ASC')->orderBy('id', 'ASC')->limit(3)->get();


        return view('frontend.article.article_by_cat',[
            'article_by_cat' => $article_by_cat,
            'category' => $category,
            '$articles_limit' => $articles_limit
        ]);
    }

    public function articleDetail($slug)
    {
        $article = Article::where([
            'slug' => $slug,
            'is_active' => '1'
        ])->first();
//        if(!$article){
//            return view('errors.404');
//        }
        return view('frontend.article.article_detail',[
            'article' => $article
        ]);
    }

    public function search(Request $request)
    {
        // b1. Lấy từ khóa tìm kiếm
        $keyword = $request->input('tu-khoa');

        $slug = str_slug($keyword);

        //$sql = "SELECT * FROM products WHERE is_active = 1 AND slug like '%$keyword%'";

        $products = Product::where([
            ['slug', 'like', '%' . $slug . '%'],
            ['is_active', '=', 1]
        ])->paginate(12);

        $totalResult = $products->total(); // số lượng kết quả tìm kiếm

        return view('frontend.search_product', [
            'products' => $products,
            'totalResult' => $totalResult,
            'keyword' => $keyword ? $keyword : ''
        ]);
    }

    public function searchArticles(Request $request)
    {
        $categories = Category::where([
            'type' => 2,
            'is_active' => 1,
            'parent_id' => 0
        ])->orderBy('position', 'ASC')->get();

        $articles_limit = Article::where('is_active',1)->orderBy('position', 'ASC')->orderBy('id', 'ASC')->limit(3)->get();

        // b1. Lấy từ khóa tìm kiếm
        $keyword = $request->input('tu-khoa');

        $slug = str_slug($keyword);

        //$sql = "SELECT * FROM products WHERE is_active = 1 AND slug like '%$keyword%'";

        $articles = Article::where([
            ['slug', 'like', '%' . $slug . '%'],
            ['is_active', '=', 1]
        ])->paginate(5);

        $totalResult = $articles->total(); // số lượng kết quả tìm kiếm

        return view('frontend.search_article', [
            'categories' => $categories,
            'limit' => $articles_limit,
            'articles' => $articles,
            'totalResult' => $totalResult,
            'keyword' => $keyword ? $keyword : ''
        ]);
    }

    public function private()
    {
        $settings = Setting::where('id', 1)->get();
        return view('frontend.privacy_policy', [
            'settings' => $settings
        ]);
    }

    // Không tìm thấy trang
    public function notfound()
    {
        return view('frontend.404');
    }
}
