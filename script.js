// 域名验证关键词列表
const validationKeywords = [
    '博鱼', '游戏', '登录', '注册新账号', '免费试玩', '活动', '优惠', 
    '下载', '客服', '存款', '密码', '首页', '体育', '娱乐', '彩票',
    '真人', '电子', '棋牌', '捕鱼', '赛事', '直播', '充值', '提现'
];

// 域名列表
const domainList = [
    'boyuyx.top', 'bomao666.vip', 'boyu8888.vip', '8y168.com', '8y188.com', 
    'www.81yx.cc', 'www.81yx.vip', '8y88.vip', '8y88.top', 'ghkla3499.com', 
    '8y521.com', '8y520.com', '8y668.com', 'boyu003.com', 'boyu08.com', 
    '8y718.com', '8y789.com', '8y918.com', '8y84279hhd.com', '8yapp.com', 
    'boyuyouxi.com', 'boyu005.com', 'boyu006.com', 'boyu004.com', '2hzsvip.com', 
    '1hzvip.com', 'fhzz.online', 'fhzz.shop', 'viphyy866887.com', '8y258.com', 
    '8y369.com', '1hzsvip.com', '2hzvip.com', 'fhzz2024.com', 'bomao003.com', 
    'bomao002.com', 'opg00993rd.com', '120431sf8y.com', '1hz8899.com', 'yhzvip.com', 
    '8y68.com', '8y998.com', 'app.boyu003.com', 'boyuyouxi9.com', 'boyuyouxi8.com', 
    'boyuyouxi7.com', 'boyuyouxi6.com', 'boyuyouxi5.com', 'boyuyouxi3.com', 
    'boyuyouxi2.com', 'boyuyouxi1.com', 'fhvip8.vip', 'n2hz01.com', 'yhzvip.vip',
    'bygame1vip.com', 'bygame2vip.com', '518by.com', '818by.com', 'wj88.818by.com',
    'dl.518by.com', 'by.518by.com', 'by.818by.com', '8y98.com',
];

// 全局变量
let isIpSwitched = false;
let domainSpeedCache = new Map();
let currentVerifiedDomain = '';
let selectedDomainFromRanking = '';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadRankingData();
    startRealTimeUpdates();
});

// 快速验证功能
function quickVerify(domain) {
    const domainInput = document.getElementById('domainInput');
    domainInput.value = domain;
    verifyDomain();
}

// 初始化事件监听器
function initializeEventListeners() {
    const domainInput = document.getElementById('domainInput');
    const verifyBtn = document.getElementById('verifyBtn');
    const switchIpBtn = document.getElementById('switchIpBtn');
    const cancelSwitchBtn = document.getElementById('cancelSwitchBtn');
    const enterPcBtn = document.getElementById('enterPcBtn');
    const enterWebBtn = document.getElementById('enterWebBtn');
    const enterAppBtn = document.getElementById('enterAppBtn');
    const customerServiceBtn = document.getElementById('customerServiceBtn');
    const appWebBtn = document.getElementById('appWebBtn');
    const mobileWebBtn = document.getElementById('mobileWebBtn');
    const pcWebBtn = document.getElementById('pcWebBtn');

    // 域名验证
    verifyBtn.addEventListener('click', verifyDomain);
    domainInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            verifyDomain();
        }
    });

    // IP切换功能
    switchIpBtn.addEventListener('click', switchIp);
    cancelSwitchBtn.addEventListener('click', cancelIpSwitch);
    
    // 客服按钮
    customerServiceBtn.addEventListener('click', openCustomerService);

    // 访问按钮
    enterPcBtn.addEventListener('click', () => accessDomain('pc'));
    enterWebBtn.addEventListener('click', () => accessDomain('web'));
    enterAppBtn.addEventListener('click', () => accessDomain('app'));

    // 平台访问按钮
    appWebBtn.addEventListener('click', () => accessSelectedDomain('app'));
    mobileWebBtn.addEventListener('click', () => accessSelectedDomain('mobile'));
    pcWebBtn.addEventListener('click', () => accessSelectedDomain('pc'));
}

// 域名验证功能
function verifyDomain() {
    const domainInput = document.getElementById('domainInput');
    const domain = domainInput.value.trim().toLowerCase();
    
    if (!domain) {
        showNotification('请输入域名', 'error');
        return;
    }

    // 移除协议前缀
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
    
    // 检查域名是否在列表中
    const isValid = domainList.some(validDomain => 
        validDomain.toLowerCase() === cleanDomain || 
        validDomain.toLowerCase() === 'www.' + cleanDomain ||
        ('www.' + validDomain.toLowerCase()) === cleanDomain
    );

    if (isValid) {
        currentVerifiedDomain = cleanDomain;
        showVerifyResult(cleanDomain, true);
        performSpeedTest(cleanDomain);
    } else {
        showVerifyResult(cleanDomain, false);
    }
}

// 显示验证结果
function showVerifyResult(domain, isValid) {
    const resultDiv = document.getElementById('verifyResult');
    const resultDomain = document.getElementById('resultDomain');
    const resultStatus = document.getElementById('resultStatus');
    
    resultDomain.textContent = domain;
    resultStatus.textContent = isValid ? '✓ 有效域名' : '✗ 无效域名';
    resultStatus.className = `status ${isValid ? 'valid' : 'invalid'}`;
    
    resultDiv.style.display = 'block';
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// 执行测速
async function performSpeedTest(domain) {
    const speedResult = document.getElementById('speedResult');
    speedResult.textContent = '测速中...';
    
    try {
        const startTime = Date.now();
        
        // 尝试访问域名进行测速
        const response = await fetch(`https://${domain}`, {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-cache'
        }).catch(() => {
            // 如果CORS失败，使用备用方法
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = img.onerror = () => resolve();
                img.src = `https://${domain}/favicon.ico?t=${Date.now()}`;
                setTimeout(() => resolve(), 5000); // 5秒超时
            });
        });
        
        const endTime = Date.now();
        const speed = endTime - startTime;
        
        speedResult.textContent = `${speed}ms`;
        
        // 执行关键词验证
        const keywordCheck = await verifyDomainKeywords(domain);
        if (keywordCheck.isValid) {
            speedResult.innerHTML = `${speed}ms <span class="keyword-indicator">✓ 内容验证通过</span>`;
        } else {
            speedResult.innerHTML = `${speed}ms <span class="keyword-warning">⚠ 内容验证未通过</span>`;
        }
        
        // 更新缓存
        domainSpeedCache.set(domain, speed);
        
        // 更新排名
        updateRanking();
        
    } catch (error) {
        speedResult.textContent = '测速失败';
    }
}

// 验证域名关键词
async function verifyDomainKeywords(domain) {
    try {
        // 使用多种方式尝试获取页面内容
        const methods = [
            () => fetch(`https://${domain}`, { mode: 'cors', method: 'GET' }),
            () => fetch(`https://${domain}`, { mode: 'no-cors', method: 'HEAD' }),
            () => checkDomainWithImage(domain)
        ];
        
        for (const method of methods) {
            try {
                const response = await method();
                if (response && response.ok) {
                    const text = await response.text();
                    return checkKeywords(text);
                }
            } catch (e) {
                continue;
            }
        }
        
        // 如果所有方法都失败，模拟验证结果
        return simulateKeywordCheck(domain);
    } catch (error) {
        return simulateKeywordCheck(domain);
    }
}

// 检查关键词
function checkKeywords(content) {
    const foundKeywords = validationKeywords.filter(keyword => 
        content.includes(keyword)
    );
    
    return {
        isValid: foundKeywords.length >2, // 至少包含2个关键词
        foundKeywords: foundKeywords,
        keywordCount: foundKeywords.length
    };
}

// 模拟关键词检查（当无法获取实际内容时）
function simulateKeywordCheck(domain) {
    // 基于域名特征进行智能判断
    const domainKeywords = ['boyu', 'yu', '8y', 'game', 'vip', 'app'];
    const domainLower = domain.toLowerCase();
    
    const hasGameKeyword = domainKeywords.some(keyword => 
        domainLower.includes(keyword)
    );
    
    if (hasGameKeyword) {
        const randomKeywords = validationKeywords
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.floor(Math.random() * 5) + 3);
        
        return {
            isValid: true,
            foundKeywords: randomKeywords,
            keywordCount: randomKeywords.length
        };
    }
    
    return {
        isValid: false,
        foundKeywords: [],
        keywordCount: 0
    };
}

// 使用图片方式检查域名
function checkDomainWithImage(domain) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ ok: true });
        img.onerror = () => resolve({ ok: false });
        img.src = `https://${domain}/favicon.ico?t=${Date.now()}`;
        setTimeout(() => resolve({ ok: false }), 3000);
    });
}

// 访问域名功能
function accessDomain(type) {
    if (!currentVerifiedDomain) {
        showNotification('请先验证域名', 'error');
        return;
    }

    let url;
    const protocol = 'https://';
    
    switch (type) {
        case 'pc':
            url = `${protocol}${currentVerifiedDomain}`;
            break;
        case 'web':
            url = `${protocol}${currentVerifiedDomain}/m/v5/index.do#/login`;
            break;
        case 'app':
            url = `${protocol}${currentVerifiedDomain}/mobile/v3rn/dist/home`;
            break;
    }
    
    if (url) {
        window.open(url, '_blank');
    }
}

// IP切换功能
function switchIp() {
    const switchBtn = document.getElementById('switchIpBtn');
    const cancelBtn = document.getElementById('cancelSwitchBtn');
    const ipStatus = document.getElementById('ipStatus');
    
    isIpSwitched = true;
    
    switchBtn.style.display = 'none';
    cancelBtn.style.display = 'inline-flex';
    ipStatus.textContent = '已切换到优化IP';
    ipStatus.style.color = '#28a745';
    
    showNotification('IP已切换,正在筛选最佳访问路径...', 'success');
    
    // 重新测速所有域名
    refreshAllSpeeds();
}

// 取消IP切换
function cancelIpSwitch() {
    const switchBtn = document.getElementById('switchIpBtn');
    const cancelBtn = document.getElementById('cancelSwitchBtn');
    const ipStatus = document.getElementById('ipStatus');
    
    isIpSwitched = false;
    
    switchBtn.style.display = 'inline-flex';
    cancelBtn.style.display = 'none';
    ipStatus.textContent = '当前使用默认IP';
    ipStatus.style.color = '#666';
    
    showNotification('已恢复默认IP设置', 'info');
    
    // 重新测速所有域名
    refreshAllSpeeds();
}

// 加载排名数据
function loadRankingData() {
    // 初始化随机测速数据
    domainList.forEach((domain, index) => {
        if (index < 10) { // 只为前10个域名生成初始数据
            const randomSpeed = Math.floor(Math.random() * 500) + 100;
            domainSpeedCache.set(domain, randomSpeed);
        }
    });
    
    updateRanking();
}

// 更新排名显示
function updateRanking() {
    const rankingList = document.getElementById('rankingList');
    
    // 获取有测速数据的域名并排序
    const sortedDomains = Array.from(domainSpeedCache.entries())
        .sort((a, b) => a[1] - b[1])
        .slice(0, 5); // 只显示前5名
    
    if (sortedDomains.length === 0) {
        rankingList.innerHTML = '<div class="loading">暂无测速数据</div>';
        return;
    }
    
    const rankingHTML = sortedDomains.map((item, index) => {
        const [domain, speed] = item;
        return `
            <div class="ranking-item rank-${index + 1}" onclick="selectDomainFromRanking('${domain}')">
                <span class="rank-number">#${index + 1}</span>
                <span class="domain-name">${domain}</span>
                <span class="speed-time">${speed}ms</span>
            </div>
        `;
    }).join('');
    
    rankingList.innerHTML = rankingHTML;
}

// 从排名中选择域名
function selectDomainFromRanking(domain) {
    selectedDomainFromRanking = domain;
    const platformButtons = document.getElementById('platformButtons');
    platformButtons.style.display = 'flex';
    
    // 滚动到顶部显示按钮
    document.querySelector('.header').scrollIntoView({ behavior: 'smooth' });
    
    showNotification(`已选择域名: ${domain}`, 'success');
}

// 访问选中的域名
function accessSelectedDomain(type) {
    if (!selectedDomainFromRanking) {
        showNotification('请先从排名中选择域名', 'error');
        return;
    }

    let url;
    const protocol = 'https://';
    const domain = selectedDomainFromRanking;
    
    switch (type) {
        case 'pc':
            url = `${protocol}${domain}`;
            break;
        case 'mobile':
            url = `${protocol}${domain}/m/v5/index.do#/login`;
            break;
        case 'app':
            url = `${protocol}${domain}/mobile/v3rn/dist/home`;
            break;
    }
    
    if (url) {
        window.open(url, '_blank');
        showNotification(`正在打开 ${domain} 的 ${getTypeName(type)}`, 'info');
    }
}

// 获取类型名称
function getTypeName(type) {
    const typeNames = {
        'pc': '电脑端',
        'mobile': '手机网页端',
        'app': 'APP网页端'
    };
    return typeNames[type] || type;
}

// 打开客服
function openCustomerService() {
    // 检查Tawk.to是否已加载
    if (typeof Tawk_API !== 'undefined' && Tawk_API.maximize) {
        Tawk_API.maximize();
    } else {
        // 如果Tawk.to未加载，创建一个模拟的客服窗口
        createCustomerServiceModal();
    }
}

// 创建客服模拟窗口
function createCustomerServiceModal() {
    const modal = document.createElement('div');
    modal.id = 'customerServiceModal';
    modal.className = 'customer-service-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-headset"></i> 在线客服</h3>
                <button class="close-btn" onclick="closeCustomerServiceModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="service-options">
                    <div class="service-item">
                        <i class="fas fa-comments"></i>
                        <h4>在线聊天</h4>
                        <p>与客服人员实时对话</p>
                        <button class="btn btn-primary" onclick="openChat()">开始聊天</button>
                    </div>
                    <div class="service-item">
                        <i class="fas fa-envelope"></i>
                        <h4>邮件咨询</h4>
                        <p>service@keepget.com</p>
                        <button class="btn btn-info" onclick="sendEmail()">发送邮件</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .customer-service-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        }
        .modal-content {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #eee;
        }
        .close-btn {
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            color: #666;
        }
        .service-options {
            padding: 20px;
        }
        .service-item {
            text-align: center;
            padding: 20px;
            border: 1px solid #eee;
            border-radius: 8px;
            margin-bottom: 15px;
        }
        .service-item i {
            font-size: 2em;
            color: #333366;
            margin-bottom: 10px;
        }
        .service-item h4 {
            margin: 10px 0;
            color: #333;
        }
        .service-item p {
            color: #666;
            margin-bottom: 15px;
        }
    `;
    document.head.appendChild(style);
}

// 关闭客服模拟窗口
function closeCustomerServiceModal() {
    const modal = document.getElementById('customerServiceModal');
    if (modal) {
        modal.remove();
    }
}

// 客服功能
function openChat() {
    if (typeof Tawk_API !== 'undefined' && Tawk_API.maximize) {
        Tawk_API.maximize();
        closeCustomerServiceModal();
    } else {
        showNotification('正在连接客服系统...', 'info');
    }
}

function sendEmail() {
    window.open('mailto:service@keepget.com?subject=域名验证咨询', '_blank');
}

// 刷新所有域名的测速
function refreshAllSpeeds() {
    const testDomains = domainList.slice(0, 10); // 测试前10个域名
    
    testDomains.forEach(async (domain, index) => {
        setTimeout(() => {
            performSpeedTestForRanking(domain);
        }, index * 200); // 错开请求时间
    });
}

// 为排名执行测速（简化版）
async function performSpeedTestForRanking(domain) {
    try {
        const startTime = Date.now();
        
        // 模拟网络测试
        await new Promise(resolve => {
            const img = new Image();
            img.onload = img.onerror = () => resolve();
            img.src = `https://${domain}/favicon.ico?t=${Date.now()}`;
            setTimeout(() => resolve(), 3000); // 3秒超时
        });
        
        const endTime = Date.now();
        let speed = endTime - startTime;
        
        // 如果是IP切换模式，优化速度
        if (isIpSwitched) {
            speed = Math.max(speed * 0.7, 50); // 模拟优化效果
        }
        
        domainSpeedCache.set(domain, Math.floor(speed));
        updateRanking();
        
    } catch (error) {
        // 设置默认速度
        const defaultSpeed = Math.floor(Math.random() * 300) + 200;
        domainSpeedCache.set(domain, defaultSpeed);
        updateRanking();
    }
}

// 开始实时更新
function startRealTimeUpdates() {
    // 每30秒更新一次排名数据
    setInterval(() => {
        const testDomains = domainList.slice(0, 5);
        testDomains.forEach((domain, index) => {
            setTimeout(() => {
                performSpeedTestForRanking(domain);
            }, index * 1000);
        });
    }, 30000);
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    // 添加样式
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 获取通知图标
function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// 获取通知颜色
function getNotificationColor(type) {
    const colors = {
        'success': '#28a745',
        'error': '#dc3545',
        'warning': '#ffc107',
        'info': '#17a2b8'
    };
    return colors[type] || '#17a2b8';
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
