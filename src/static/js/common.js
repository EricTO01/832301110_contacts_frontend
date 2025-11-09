// 通用工具函数
class ContactManager {
    // 显示消息提示
    static showMessage(message, type = 'success') {
        // 移除现有消息
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
            ${message}
            <button class="message-close" onclick="this.parentElement.remove()">&times;</button>
        `;
        
        const container = document.getElementById('message-container') || document.body;
        container.appendChild(messageDiv);
        
        // 5秒后自动消失
        setTimeout(() => {
            if (messageDiv.parentElement) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // 表单验证
    static validateForm(formData, rules) {
        const errors = [];
        
        for (const [field, rule] of Object.entries(rules)) {
            const value = formData.get(field)?.toString().trim() || '';
            
            if (rule.required && !value) {
                errors.push(`${rule.label}不能为空`);
                continue;
            }
            
            if (value && rule.minLength && value.length < rule.minLength) {
                errors.push(`${rule.label}至少${rule.minLength}位`);
            }
            
            if (value && rule.maxLength && value.length > rule.maxLength) {
                errors.push(`${rule.label}不能超过${rule.maxLength}位`);
            }
            
            if (value && rule.pattern && !rule.pattern.test(value)) {
                errors.push(rule.errorMessage || `${rule.label}格式不正确`);
            }
        }
        
        return errors;
    }

    // 加载状态
    static setLoading(button, isLoading) {
        if (isLoading) {
            button.dataset.originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 处理中...';
            button.disabled = true;
        } else {
            button.innerHTML = button.dataset.originalText || button.textContent;
            button.disabled = false;
        }
    }

    // 防抖函数
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 格式化日期
    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// 通用错误处理
function handleApiError(error, defaultMessage = '操作失败，请重试') {
    console.error('API Error:', error);
    ContactManager.showMessage(defaultMessage, 'error');
}

// 导出功能（如果需要）
function exportContacts(contacts, filename = 'contacts') {
    const csvContent = "姓名,电话,地址\n" + 
        contacts.map(c => `"${c.name}","${c.phone}","${c.address || ''}"`).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    ContactManager.showMessage('联系人已导出', 'success');
}