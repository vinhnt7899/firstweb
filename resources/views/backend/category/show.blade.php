@extends('backend.layouts.main')

@section('content')
    <section class="content-header">
        <h1>
            Chi tiết danh mục <a href="{{route('admin.category.index')}}" class="btn bg-purple pull-right"><i class="fa fa-list"></i> Danh Sách</a>
        </h1>
    </section>

    <section class="content">
        <div class="row">
            <!-- left column -->
            <div class="col-md-12">
                <!-- general form elements -->

                <div class="box box-primary">
                    <div class="box-header with-border">
                        <h3 class="box-title">Thông tin danh mục</h3>
                    </div>
                    <!-- /.box-header -->
                    <div class="box-body">
                        <table class="table table-bordered">
                            <tbody>
                            <tr>
                                <td><b>Tên danh mục</b></td>
                                <td>{{ $data->name }}</td>
                            </tr>
                            <tr>
                                <td><b>Hình ảnh</b></td>
                                <td><img src="{{ asset($data->image) }}" width="500" alt=""></td>
                            </tr>
                            <tr>
                                <td><b>Dạnh mục cha</b></td>
                                <td>{{ $data->parent->name or 'Unknown' }}</td>
                            </tr>
                            <tr>
                                <td><b>Vị trí</b></td>
                                <td>{{ $data->position }}</td>
                            </tr>
                            <tr>
                                <td><b>Trạng thái</b></td>
                                <td>{{ ($data->is_active == 1) ? 'Hiển thị' : 'Ẩn' }}</td>
                            </tr>
                            <tr>
                                <td><b>Loại</b></td>
                                <td>{{ ($data->type == 1) ? 'Sản phẩm' : 'Tin tức' }}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <!-- form start -->
                </div>
                <!-- /.box -->
            </div>
            <!--/.col (right) -->
        </div>
        <!-- /.row -->
    </section>
@endsection



