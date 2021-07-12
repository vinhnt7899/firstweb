@extends('backend.layouts.main')

@section('content')
    <section class="content-header">
        <h1>
            Danh sách sản phẩm <a href="{{route('admin.product.create')}}" class="btn bg-purple"><i class="fa fa-plus"></i> Thêm sản phẩm</a>
        </h1>
        <ol class="breadcrumb">
            <li><a href="#"><i class="fa fa-dashboard"></i>Home</a></li>
            <li><a href="#">Bảng</a></li>
            <li class="active">Products</li>
        </ol>
    </section>

    <section class="content">
        <div class="row">
            <div class="col-xs-12">
                <div class="box">
                    <div class="box-header">
                        <h3 class="box-title">Thông tin danh sách sản phẩm</h3>
                    </div>
                    <!-- /.box-header -->
                    <div class="box-body">
                        <table id="example1" class="table table-bordered table-striped">
                            <thead>
                            <tr>
                                <th>TT</th>
                                <th width="20%">Tên sản phẩm</th>
                                <th>Danh mục</th>
                                <th>Hình ảnh</th>
                                <th>Người tạo</th>
                                <th>Giá Gốc</th>
                                <th>Giá KM</th>
                                <th>Vị trí</th>
                                <th>Sản phẩm hot</th>
                                <th>Trạng thái</th>
                                <th class="text-center">Hành động</th>
                            </tr>
                            </thead>
                            <tbody>
                                @foreach($data as $key => $item)
                                    <tr class="item-{{ $item->id }}">
                                        <td>{{ $key + 1 }}</td>
                                        <td>{{ $item -> name }}</td>
                                        <td>{{ @$item->category->name}}</td>
                                        <td>
                                            @if($item->image)
                                                {{--                                               Kiểm tra hình ảnh tồn tại --}}
                                                <img src="{{ asset($item->image) }}" width="75" height="50" alt="">
                                            @endif
                                        </td>
                                        <td>Lịch Trần</td>
                                        <td>{{ $item->price }}</td>
                                        <td>{{ $item->sale }}</td>
                                        <td>{{ $item->position }}</td>
                                        <td>{{ $item->is_hot == 1 ? 'Có' : 'Không' }}</td>
                                        <td>{{ $item->is_active == 1 ? 'Hiển thị' : 'Ẩn' }}</td>
                                        <td class="text-center">
                                            <a href="{{ route('admin.product.edit', ['id' => $item->id ]) }}" class="btn btn-flat bg-purple">
                                                <i class="fa fa-pencil-square"></i>
                                            </a>
                                            <button onclick="deleteItem('product',{{$item->id}})" class="btn btn-danger"><i class="fa fa-trash"></i></button>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                    <!-- /.box-body -->
                </div>
            </div>
            <!-- /.col -->
        </div>
        <!-- /.row -->
    </section>

@endsection

@section('script')
    <script>
        $(function () {
            $('#example1').DataTable();
            $('#example2').DataTable({
                'paging'      : true,
                'lengthChange': false,
                'searching'   : false,
                'ordering'    : true,
                'info'        : true,
                'autoWidth'   : false
            })
        })
    </script>
@endsection
