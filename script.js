// 获取页面元素
const imageInput = document.getElementById('imageInput');
const sourceImage = document.getElementById('sourceImage');
const previewImage = document.getElementById('previewImage');
const downloadBtn = document.getElementById('downloadBtn');
const sourceSizeSpan = document.getElementById('sourceSize');
const previewSizeSpan = document.getElementById('previewSize');
const ratioButtons = document.querySelectorAll('.ratio-buttons button');

let cropper = null; // 裁剪器实例

// 监听图片上传
imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        alert('请上传图片文件！');
        return;
    }

    // 创建文件阅读器
    const reader = new FileReader();
    reader.onload = function(e) {
        // 显示原始图片
        sourceImage.src = e.target.result;
        
        // 获取并显示原始图片尺寸
        const img = new Image();
        img.onload = function() {
            sourceSizeSpan.textContent = `${img.width} × ${img.height} 像素`;
        };
        img.src = e.target.result;

        // 初始化裁剪器
        if (cropper) {
            cropper.destroy();
        }
        
        // 创建新的裁剪器
        cropper = new Cropper(sourceImage, {
            aspectRatio: 1, // 默认1:1
            viewMode: 2,    // 限制裁剪框不超出图片
            preview: '#previewImage', // 预览区域
            crop: function(event) {
                // 更新裁剪后的尺寸信息
                const width = Math.round(event.detail.width);
                const height = Math.round(event.detail.height);
                previewSizeSpan.textContent = `${width} × ${height} 像素`;
            }
        });

        // 启用下载按钮
        downloadBtn.disabled = false;
    };
    reader.readAsDataURL(file);
});

// 处理裁剪比例按钮点击
ratioButtons.forEach(button => {
    button.addEventListener('click', function() {
        // 移除其他按钮的active类
        ratioButtons.forEach(btn => btn.classList.remove('active'));
        // 添加当前按钮的active类
        this.classList.add('active');

        if (!cropper) return;

        // 设置裁剪比例
        const ratio = this.dataset.ratio;
        if (ratio === 'free') {
            cropper.setAspectRatio(NaN);
        } else {
            const [width, height] = ratio.split(':');
            cropper.setAspectRatio(width / height);
        }
    });
});

// 处理图片下载
downloadBtn.addEventListener('click', function() {
    if (!cropper) return;

    // 获取裁剪后的图片数据
    const canvas = cropper.getCroppedCanvas();
    if (!canvas) {
        alert('无法获取裁剪后的图片！');
        return;
    }

    // 将Canvas转换为Blob
    canvas.toBlob(function(blob) {
        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '裁剪后的图片.png'; // 下载文件名
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 'image/png');
}); 