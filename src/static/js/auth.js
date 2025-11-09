// 登录注册页面交互
document.addEventListener('DOMContentLoaded', function() {
    console.log('auth.js 已加载，开始初始化表单');
    initializeAuthForms();
});

function initializeAuthForms() {
    console.log('初始化认证表单...');
    
    // 登录表单
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        console.log('找到登录表单，绑定提交事件');
        loginForm.addEventListener('submit', handleLogin);
    } else {
        console.error('错误：未找到ID为"login-form"的表单元素！');
        console.log('当前页面中的表单元素：', document.querySelectorAll('form'));
    }
}

async function handleLogin(e) {
    console.log('登录表单提交事件触发');
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    
    console.log('表单数据：', {
        username: formData.get('username'),
        password: formData.get('password') ? '***' : '空'
    });
    
    // 基础验证
    const username = formData.get('username') || '';
    const password = formData.get('password') || '';
    
    if (!username.trim()) {
        showMessage('请输入用户名', 'error');
        return;
    }
    
    if (!password.trim()) {
        showMessage('请输入密码', 'error');
        return;
    }
    
    // 显示加载状态
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 登录中...';
    submitButton.disabled = true;
    
    try {
        console.log('发送登录请求到服务器...');
        const response = await fetch('/login', {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        console.log('收到响应，状态码：', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP错误! 状态: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('服务器响应数据：', data);
        
        if (data.success) {
            showMessage(data.message, 'success');
            console.log('登录成功，3秒后跳转到仪表盘...');
            
            // 延迟跳转，让用户看到成功消息
            setTimeout(() => {
                console.log('执行跳转：/dashboard');
                window.location.href = '/dashboard';
            }, 1000);
            
        } else {
            showMessage(data.message || '登录失败', 'error');
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    } catch (error) {
        console.error('登录过程发生错误：', error);
        showMessage('网络错误：' + error.message, 'error');
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

// 消息提示函数
function showMessage(message, type = 'success') {
    console.log('显示消息：', type, message);
    
    // 移除现有消息
    const existingMsg = document.querySelector('.custom-message');
    if (existingMsg) existingMsg.remove();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `custom-message message-${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
        ${message}
    `;
    
    // 添加到页面
    const authCard = document.querySelector('.auth-card');
    if (authCard) {
        authCard.insertBefore(messageDiv, authCard.querySelector('.auth-form'));
    }
    
    // 自动消失
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, 3000);
}