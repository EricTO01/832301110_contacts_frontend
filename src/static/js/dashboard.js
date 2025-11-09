document.addEventListener('DOMContentLoaded', function() {
    console.log('dashboard.js 已加载');
    
    // 将API_ENDPOINTS定义为全局变量
    window.API_ENDPOINTS = {
        add_contact: '/api/contacts',
        delete_contact: '/api/contacts/',
        update_contact: '/api/contacts/'
    };
    
    console.log('API端点:', window.API_ENDPOINTS);
    
    // 初始化所有功能
    initializeDashboard();
});

function initializeDashboard() {
    console.log('初始化仪表盘功能');
    
    // 添加联系人功能
    initializeAddContact();
    
    // 删除联系人功能
    initializeDeleteContact();
    
    // 搜索功能
    initializeSearchFunction();
    
    // 内联编辑功能
    initializeEditContact();
    
    // 更新联系人计数
    updateContactCount();
}

function initializeAddContact() {
    const addContactForm = document.getElementById('add-contact-form');
    if (addContactForm) {
        addContactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('添加联系人表单提交');
            
            const formData = new FormData(this);
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            
            // 验证必填字段
            const name = formData.get('name') || '';
            const phone = formData.get('phone') || '';
            
            if (!name.trim()) {
                showMessage('姓名不能为空', 'error');
                return;
            }
            
            if (!phone.trim()) {
                showMessage('电话不能为空', 'error');
                return;
            }
            
            // 显示加载状态
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 添加中...';
            submitButton.disabled = true;
            
            try {
                console.log('发送添加联系人请求到:', API_ENDPOINTS.add_contact);
                const response = await fetch(API_ENDPOINTS.add_contact, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                console.log('收到响应状态:', response.status);
                
                if (!response.ok) {
                    throw new Error(`HTTP错误! 状态: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('响应数据:', data);
                
                if (data.success) {
                    showMessage(data.message, 'success');
                    this.reset();
                    
                    // 延迟刷新显示新联系人
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    showMessage(data.message, 'error');
                }
            } catch (error) {
                console.error('添加联系人错误:', error);
                showMessage('添加失败: ' + error.message, 'error');
            } finally {
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            }
        });
    }
}

function initializeDeleteContact() {
    // 使用事件委托处理删除按钮点击
    document.addEventListener('click', function(e) {
        // 检查点击的元素是否是删除按钮或其子元素
        if (e.target.closest('.btn-delete')) {
            const button = e.target.closest('.btn-delete');
            const contactId = button.getAttribute('data-id');
            const contactName = button.getAttribute('data-name');
            
            if (confirm(`确定要删除联系人 "${contactName}" 吗？`)) {
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                button.disabled = true;
                
                fetch(API_ENDPOINTS.delete_contact + contactId, {
                    method: 'DELETE',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP错误! 状态: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        showMessage(data.message, 'success');
                        // 动画效果移除
                        const contactCard = button.closest('.contact-card');
                        contactCard.style.transform = 'translateX(100%)';
                        contactCard.style.opacity = '0';
                        
                        setTimeout(() => {
                            contactCard.remove();
                            updateContactCount();
                        }, 300);
                    } else {
                        showMessage(data.message, 'error');
                    }
                })
                .catch(error => {
                    console.error('删除错误:', error);
                    showMessage('删除失败: ' + error.message, 'error');
                })
                .finally(() => {
                    button.innerHTML = originalText;
                    button.disabled = false;
                });
            }
        }
    });
}

// 内联编辑功能
function initializeEditContact() {
    console.log('初始化内联编辑功能');
    
    // 使用事件委托处理编辑相关按钮点击
    document.addEventListener('click', function(e) {
        // 编辑按钮点击事件
        if (e.target.closest('.btn-edit')) {
            const button = e.target.closest('.btn-edit');
            const contactId = button.getAttribute('data-id');
            console.log('编辑按钮被点击，联系人ID:', contactId);
            enableEditMode(contactId);
            return;
        }
        
        // 取消编辑按钮点击事件
        if (e.target.closest('.cancel-edit')) {
            const button = e.target.closest('.cancel-edit');
            const contactId = button.getAttribute('data-id');
            console.log('取消编辑按钮被点击，联系人ID:', contactId);
            cancelEdit(contactId);
            return;
        }
    });
    
    // 使用事件委托处理表单提交事件
    document.addEventListener('submit', function(e) {
        // 检查是否是编辑表单的提交事件
        if (e.target.classList.contains('edit-contact-form')) {
            e.preventDefault();
            const form = e.target;
            const contactId = form.querySelector('.save-changes').getAttribute('data-id');
            console.log('保存修改按钮被点击，联系人ID:', contactId);
            saveContactChanges(contactId, form);
        }
    });
}

function enableEditMode(contactId) {
    console.log('进入编辑模式:', contactId);
    
    const contactCard = document.getElementById(`contact-${contactId}`);
    if (!contactCard) {
        console.error('未找到联系人卡片');
        return;
    }
    
    // 切换显示模式
    const viewMode = contactCard.querySelector('.contact-view-mode');
    const editMode = contactCard.querySelector('.contact-edit-mode');
    
    if (viewMode) {
        viewMode.style.display = 'none';
        console.log('已隐藏查看模式');
    }
    
    if (editMode) {
        editMode.style.display = 'block';
        console.log('已显示编辑模式');
        
        // 自动聚焦到姓名输入框
        const nameInput = editMode.querySelector('input[name="name"]');
        if (nameInput) {
            nameInput.focus();
            nameInput.select();
        }
    } else {
        console.error('未找到编辑模式区域');
    }
}

function cancelEdit(contactId) {
    console.log('取消编辑:', contactId);
    
    const contactCard = document.getElementById(`contact-${contactId}`);
    if (!contactCard) return;
    
    // 切换回查看模式
    const viewMode = contactCard.querySelector('.contact-view-mode');
    const editMode = contactCard.querySelector('.contact-edit-mode');
    
    if (viewMode) viewMode.style.display = 'block';
    if (editMode) editMode.style.display = 'none';
    
    console.log('已退出编辑模式');
}

async function saveContactChanges(contactId, form) {
    console.log('保存联系人修改:', contactId);
    
    const contactCard = document.getElementById(`contact-${contactId}`);
    if (!contactCard) return;
    
    const formData = new FormData(form);
    const saveButton = form.querySelector('.btn-primary');
    
    const originalText = saveButton.innerHTML;
    
    // 显示加载状态
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 保存中...';
    saveButton.disabled = true;
    
    try {
        const response = await fetch(API_ENDPOINTS.update_contact + contactId, {
            method: 'PUT',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage(data.message, 'success');
            
            // 更新查看模式下的显示
            updateContactView(contactId, {
                name: formData.get('name'),
                phone: formData.get('phone'),
                address: formData.get('address')
            });
            
            // 退出编辑模式
            cancelEdit(contactId);
            
        } else {
            showMessage(data.message, 'error');
        }
        
    } catch (error) {
        console.error('保存联系人错误:', error);
        showMessage('保存失败: ' + error.message, 'error');
    } finally {
        saveButton.innerHTML = originalText;
        saveButton.disabled = false;
    }
}

function updateContactView(contactId, newData) {
    const contactCard = document.getElementById(`contact-${contactId}`);
    if (!contactCard) return;
    
    // 更新查看模式下的显示
    const viewMode = contactCard.querySelector('.contact-view-mode');
    if (viewMode) {
        // 更新姓名
        const nameElement = viewMode.querySelector('.contact-name');
        if (nameElement) nameElement.textContent = newData.name;
        
        // 更新电话
        const phoneElement = viewMode.querySelector('.contact-phone');
        if (phoneElement) phoneElement.textContent = newData.phone;
        
        // 更新地址 - 使用更兼容的选择器
        const contactFields = viewMode.querySelectorAll('.contact-field');
        let addressElement = null;
        let addressField = null;
        let phoneField = null;
        
        // 查找地址和电话字段
        contactFields.forEach(field => {
            const icon = field.querySelector('i');
            if (icon && icon.classList.contains('fa-map-marker-alt')) {
                addressField = field;
                addressElement = field.querySelector('.contact-address');
            } else if (icon && icon.classList.contains('fa-phone')) {
                phoneField = field;
            }
        });
        
        if (newData.address) {
            if (!addressElement) {
                // 创建新的地址字段
                const newAddressField = document.createElement('p');
                newAddressField.className = 'contact-field';
                newAddressField.innerHTML = `
                    <i class="fas fa-map-marker-alt"></i>
                    <span class="contact-address">${newData.address}</span>
                `;
                
                if (phoneField) {
                    phoneField.parentNode.insertBefore(newAddressField, phoneField.nextSibling);
                }
            } else {
                addressElement.textContent = newData.address;
            }
        } else if (addressField) {
            // 删除地址字段
            addressField.remove();
        }
    }
}

// 搜索功能
function initializeSearchFunction() {
    console.log('初始化搜索功能');
    
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    // 创建防抖版本的搜索函数
    const debouncedSearch = debounce(function(value) {
        performSearch(value);
    }, 300);
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', function() {
            // 直接搜索，不使用防抖
            performSearch(searchInput.value);
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                // 直接搜索，不使用防抖
                performSearch(this.value);
            }
        });
        
        searchInput.addEventListener('input', function() {
            // 使用防抖搜索
            debouncedSearch(this.value);
        });
    }
}

function performSearch(searchTerm) {
    const searchBtn = document.getElementById('search-btn');
    const originalText = searchBtn.innerHTML;
    
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 搜索中...';
    searchBtn.disabled = true;
    
    setTimeout(() => {
        if (!searchTerm.trim()) {
            showAllContacts();
        } else {
            filterContacts(searchTerm);
        }
        
        searchBtn.innerHTML = originalText;
        searchBtn.disabled = false;
    }, 300);
}

function filterContacts(searchTerm) {
    const contactCards = document.querySelectorAll('.contact-card');
    let foundCount = 0;
    const searchLower = searchTerm.toLowerCase();
    
    contactCards.forEach(card => {
        const name = card.querySelector('.contact-name').textContent.toLowerCase();
        const phone = card.querySelector('.contact-phone').textContent.toLowerCase();
        const addressElem = card.querySelector('.contact-address');
        const address = addressElem ? addressElem.textContent.toLowerCase() : '';
        
        const isMatch = name.includes(searchLower) || 
                        phone.includes(searchLower) || 
                        address.includes(searchLower);
        
        if (isMatch) {
            card.style.display = 'block';
            foundCount++;
        } else {
            card.style.display = 'none';
        }
    });
}

function showAllContacts() {
    const contactCards = document.querySelectorAll('.contact-card');
    contactCards.forEach(card => {
        card.style.display = 'block';
    });
}

function updateContactCount() {
    const count = document.querySelectorAll('.contact-card').length;
    const countElement = document.getElementById('contact-count');
    if (countElement) {
        countElement.textContent = count;
    }
}

function showMessage(message, type = 'success') {
    const existingMsg = document.querySelector('.custom-message');
    if (existingMsg) existingMsg.remove();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `custom-message message-${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
        ${message}
        <button class="message-close">×</button>
    `;
    
    document.body.appendChild(messageDiv);
    
    messageDiv.querySelector('.message-close').addEventListener('click', function() {
        messageDiv.remove();
    });
    
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, 3000);
}

function debounce(func, wait) {
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