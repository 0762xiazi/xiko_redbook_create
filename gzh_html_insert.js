// ==UserScript==
// @name         公众号HTML代码插入工具（增强版）
// @namespace    https://github.com/yourusername/
// @version      2.0
// @description  在微信公众号编辑器中插入HTML代码，自动清理不兼容的CSS特性
// @author       Your Name
// @match        https://mp.weixin.qq.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 创建浮动面板
    function createFloatPanel() {
        const panel = document.createElement('div');
        panel.id = 'htmlInsertPanel';
        panel.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            width: 400px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 99999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; font-size: 18px; color: #333;">HTML代码插入工具</h3>
                <button id="closePanel" style="background: #f5f5f5; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 14px;">关闭</button>
            </div>
            <textarea id="htmlInput" placeholder="请粘贴HTML代码到这里..." style="width: 100%; height: 200px; margin-bottom: 15px; padding: 12px; border: 1px solid #ddd; border-radius: 8px; resize: vertical; font-family: monospace; font-size: 13px; line-height: 1.5;"></textarea>
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <button id="insertHtml" style="flex: 1; background: linear-gradient(135deg, #07c160, #06ae56); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: 500;">插入HTML（自动清理）</button>
                <button id="insertHtmlRaw" style="background: #2196F3; color: white; border: none; padding: 12px 16px; border-radius: 8px; cursor: pointer; font-size: 14px;">原始插入</button>
                <button id="previewHtml" style="background: #FF9800; color: white; border: none; padding: 12px 16px; border-radius: 8px; cursor: pointer; font-size: 14px;">预览</button>
                <button id="clearHtml" style="background: #f5f5f5; border: none; padding: 12px 16px; border-radius: 8px; cursor: pointer; font-size: 14px;">清空</button>
            </div>
            <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; font-size: 12px; color: #666;">
                <p style="margin: 0 0 8px; font-weight: 600; color: #333;">使用说明：</p>
                <ul style="margin: 0; padding-left: 18px; line-height: 1.8;">
                    <li>将HTML代码粘贴到文本框中</li>
                    <li><strong>插入HTML（自动清理）</strong>：自动转换vw/clamp等不支持的特性</li>
                    <li><strong>原始插入</strong>：不修改任何代码，直接插入</li>
                    <li>如果清理后样式不对，试试"原始插入"</li>
                </ul>
            </div>
        `;

        document.body.appendChild(panel);

        // 添加事件监听器
        document.getElementById('closePanel').addEventListener('click', () => {
            panel.style.display = 'none';
        });

        document.getElementById('insertHtml').addEventListener('click', () => insertHTML(true));
        document.getElementById('insertHtmlRaw').addEventListener('click', () => insertHTML(false));
        document.getElementById('clearHtml').addEventListener('click', () => {
            document.getElementById('htmlInput').value = '';
        });
        document.getElementById('previewHtml').addEventListener('click', previewHTML);
    }

    // 预览HTML效果
    function previewHTML() {
        const htmlCode = document.getElementById('htmlInput').value;
        if (!htmlCode.trim()) {
            alert('请先输入HTML代码');
            return;
        }

        // 清理HTML
        const cleanHtml = convertToCompatibleHTML(htmlCode);

        // 创建预览窗口
        const previewWindow = window.open('', '_blank', 'width=800,height=600');
        previewWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>HTML预览</title>
                <style>
                    body { margin: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif; }
                    .preview-container { max-width: 680px; margin: 0 auto; }
                </style>
            </head>
            <body>
                <div class="preview-container">
                    <div style="background: #f0f0f0; padding: 15px; margin-bottom: 20px; border-radius: 8px;">
                        <h4 style="margin: 0 0 10px;">预览效果（公众号中显示样式会略有不同）</h4>
                        <button onclick="window.close()" style="padding: 8px 16px; cursor: pointer;">关闭预览</button>
                    </div>
                    ${cleanHtml}
                </div>
            </body>
            </html>
        `);
        previewWindow.document.close();
    }

    // 插入HTML代码（使用公众号编辑器API）
    function insertHTML(autoClean = true) {
        const htmlCode = document.getElementById('htmlInput').value;
        if (!htmlCode.trim()) {
            alert('请输入HTML代码');
            return;
        }

        try {
            // 转换HTML为兼容版本
            const compatibleHtml = autoClean ? convertToCompatibleHTML(htmlCode) : htmlCode;

            // 等待编辑器准备就绪并重试机制
            let retryCount = 0;
            const maxRetries = 3;

            function attemptInsert() {
                // 尝试找到编辑器内容区域
                const editorContent = findEditorContentArea();
                if (!editorContent) {
                    if (retryCount < maxRetries) {
                        retryCount++;
                        console.log(`编辑器区域未找到，第${retryCount}次重试...`);
                        setTimeout(attemptInsert, 1000);
                        return;
                    } else {
                        alert('未找到编辑器内容区域，请确保在公众号编辑器页面');
                        return;
                    }
                }

                // 确保编辑器获得焦点
                editorContent.focus();

                // 等待DOM更新
                setTimeout(() => {
                    // 尝试多种插入方法（新增公众号API方法）
                    let success = false;
                    let errorMsg = '';
                    let method = '';

                    // 方法1：使用微信公众号编辑器API（新增方法）
                    if (!success) {
                        try {
                            if (window.__MP_Editor_JSAPI__ && window.__MP_Editor_JSAPI__.invoke) {
                                window.__MP_Editor_JSAPI__.invoke({
                                    apiName: 'mp_editor_insert_html',
                                    apiParam: {
                                        html: compatibleHtml,
                                        isSelect: false
                                    },
                                    sucCb: (res) => {
                                        success = true;
                                        method = 'MP Editor JSAPI';
                                        console.log('方法1成功：微信公众号编辑器API');
                                        showNotification(`HTML代码已成功插入到编辑器中！（使用${method}）`);
                                    },
                                    errCb: (err) => {
                                        console.log('方法1失败（API回调错误）:', err);
                                        errorMsg = 'MP Editor JSAPI: ' + (err ? err.message || JSON.stringify(err) : 'Unknown error');
                                        // 继续尝试其他方法
                                        attemptOtherMethods();
                                    }
                                });
                                // 如果API调用成功（回调会被调用），这里不需要额外处理
                                // 如果API不存在或调用失败，会通过回调或异常跳转到其他方法
                                return; // 等待API回调，不继续执行其他方法
                            } else {
                                console.log('方法1不可用：__MP_Editor_JSAPI__未找到');
                            }
                        } catch (e) {
                            errorMsg = 'MP Editor JSAPI: ' + e.message;
                            console.log('方法1失败:', e);
                        }
                    }

                    // 继续尝试其他方法（如果API方法未成功）
                    attemptOtherMethods();

                    function attemptOtherMethods() {
                        // 方法2：使用execCommand（传统方法）
                        if (!success && document.queryCommandSupported('insertHTML')) {
                            try {
                                success = document.execCommand('insertHTML', false, compatibleHtml);
                                if (success) {
                                    method = 'execCommand';
                                    console.log('方法2成功：execCommand');
                                }
                            } catch (e) {
                                errorMsg = 'execCommand: ' + e.message;
                                console.log('方法2失败:', e);
                            }
                        }

                        // 方法3：使用Range API
                        if (!success) {
                            try {
                                const selection = window.getSelection();
                                if (selection.rangeCount > 0) {
                                    const range = selection.getRangeAt(0);
                                    // 确保Range在编辑器内
                                    if (editorContent.contains(range.commonAncestorContainer)) {
                                        // 插入内容
                                        const div = document.createElement('div');
                                        div.innerHTML = compatibleHtml;
                                        range.deleteContents();

                                        // 逐个插入节点
                                        while (div.firstChild) {
                                            range.insertNode(div.firstChild);
                                        }

                                        success = true;
                                        method = 'Range API';
                                        console.log('方法3成功：Range API');
                                    }
                                }
                            } catch (e) {
                                errorMsg = 'Range API: ' + e.message;
                                console.log('方法3失败:', e);
                            }
                        }

                        // 方法4：insertAdjacentHTML
                        if (!success) {
                            try {
                                // 先将光标移到编辑器末尾
                                const range = document.createRange();
                                range.selectNodeContents(editorContent);
                                range.collapse(false);
                                const selection = window.getSelection();
                                selection.removeAllRanges();
                                selection.addRange(range);

                                editorContent.insertAdjacentHTML('beforeend', compatibleHtml);
                                success = true;
                                method = 'insertAdjacentHTML';
                                console.log('方法4成功：insertAdjacentHTML');
                            } catch (e) {
                                errorMsg = 'insertAdjacentHTML: ' + e.message;
                                console.log('方法4失败:', e);
                            }
                        }

                        // 方法5：作为最后手段，直接appendChild
                        if (!success) {
                            try {
                                const tempDiv = document.createElement('div');
                                tempDiv.innerHTML = compatibleHtml;
                                while (tempDiv.firstChild) {
                                    editorContent.appendChild(tempDiv.firstChild);
                                }
                                success = true;
                                method = 'appendChild';
                                console.log('方法5成功：appendChild');
                            } catch (e) {
                                errorMsg = 'appendChild: ' + e.message;
                                console.log('方法5失败:', e);
                            }
                        }

                        // 显示结果
                        if (success) {
                            showNotification(`HTML代码已成功插入到编辑器中！（使用${method}）`);
                        } else {
                            alert(`所有插入方法都失败了。\n错误信息：${errorMsg}\n\n已复制到剪贴板，请手动粘贴。`);
                            copyToClipboard(compatibleHtml);
                        }
                    }
                }, 500); // 等待500ms确保编辑器准备好
            }

            // 开始尝试插入
            attemptInsert();

        } catch (error) {
            console.error('插入HTML失败:', error);
            alert('插入HTML失败，错误信息：' + error.message + '\n\n已复制到剪贴板，请手动粘贴。');
            copyToClipboard(autoClean ? convertToCompatibleHTML(htmlCode) : htmlCode);
        }
    }

    // 显示通知
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #07c160;
            color: white;
            padding: 15px 30px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 100000;
            font-size: 15px;
            font-weight: 500;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // 复制到剪贴板
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            console.log('已复制到剪贴板');
        } catch (err) {
            console.error('复制失败:', err);
        }
        document.body.removeChild(textarea);
    }

    // 查找编辑器内容区域
    function findEditorContentArea() {
        // 微信公众号编辑器常见的内容区域选择器（按优先级排序）
        const selectors = [
            '.rich_media_content',
            '.edui-body-container',
            '#js_editor_insertarea',
            '.ProseMirror',
            '.editor_content',
            '#editor_content',
            '[contenteditable="true"]'
        ];

        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element && element.offsetHeight > 0 && element.offsetWidth > 0) {
                console.log('找到编辑器区域:', selector);
                return element;
            }
        }

        // 如果没有找到，尝试查找所有可编辑元素
        const editableElements = document.querySelectorAll('[contenteditable="true"]');
        for (const element of editableElements) {
            if ((element.tagName === 'DIV' || element.tagName === 'BODY') &&
                element.offsetHeight > 0 && element.offsetWidth > 0 &&
                element.textContent.trim().length > 0) {
                console.log('找到可编辑元素:', element.tagName);
                return element;
            }
        }

        console.warn('未找到编辑器内容区域');
        return null;
    }

    // 将HTML转换为公众号兼容版本（简化版，减少误删）
    function convertToCompatibleHTML(html) {
        let clean = html;

        // 1. 移除DOCTYPE声明
        clean = clean.replace(/<!DOCTYPE[^>]*>/gi, '');

        // 2. 移除HTML/Body标签及其属性（保留内容）
        clean = clean.replace(/<html[^>]*>/gi, '');
        clean = clean.replace(/<\/html>/gi, '');
        clean = clean.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
        clean = clean.replace(/<body[^>]*>/gi, '');
        clean = clean.replace(/<\/body>/gi, '');

        // 3. 转换div标签为section标签（语义化改进）
        // 匹配带属性的div标签
        clean = clean.replace(/<div\b([^>]*)>/gi, '<section$1>');
        // 匹配闭合的div标签
        clean = clean.replace(/<\/div>/gi, '</section>');

        // 4. 只移除SVG动画元素，保留SVG结构和渐变
        clean = clean.replace(/<animate[^>]*\/>/gi, '');
        clean = clean.replace(/<animateTransform[^>]*\/>/gi, '');
        clean = clean.replace(/<set[^>]*\/>/gi, '');
        clean = clean.replace(/<animate[^>]*>[\s\S]*?<\/animate>/gi, '');
        clean = clean.replace(/<animateTransform[^>]*>[\s\S]*?<\/animateTransform>/gi, '');

        // 5. 只移除危险的事件属性（保留正常的属性）
        clean = clean.replace(/\s*onclick\s*=\s*["'][^"']*["']/gi, '');
        clean = clean.replace(/\s*onload\s*=\s*["'][^"']*["']/gi, '');
        clean = clean.replace(/\s*onmouseover\s*=\s*["'][^"']*["']/gi, '');
        clean = clean.replace(/\s*onmouseout\s*=\s*["'][^"']*["']/gi, '');
        clean = clean.replace(/\s*onerror\s*=\s*["'][^"']*["']/gi, '');

        // 6. 转换CSS单位（保留原有结构）
        clean = convertCSSUnits(clean);

        // 7. 只清理最明显的不支持CSS属性，保留其他属性
        clean = clean.replace(/@keyframes[^{]+\{[^{]*\{[^}]*\}[^}]*\}/gi, '');

        // 8. 移除内嵌的script标签（保留style因为公众号可能需要）
        clean = clean.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');

        return clean;
    }

    // 转换CSS单位
    function convertCSSUnits(html) {
        // 转换 vw, vh 单位（假设公众号预览宽度为 680px）
        const baseWidth = 680;

        // 转换 clamp() 函数
        html = html.replace(/clamp\(([^,]+),\s*([^,]+),\s*([^)]+)\)/g, (match, min, val, max) => {
            // 简化处理，取中间值或最大值
            return val.trim();
        });

        // 转换 vw 为 px (1vw ≈ baseWidth / 100)
        html = html.replace(/(\d+(?:\.\d+)?)\s*vw/g, (match, val) => {
            const px = Math.round(parseFloat(val) * baseWidth / 100);
            return px + 'px';
        });

        // 转换 vh 为 px (假设高度为800px)
        const baseHeight = 800;
        html = html.replace(/(\d+(?:\.\d+)?)\s*vh/g, (match, val) => {
            const px = Math.round(parseFloat(val) * baseHeight / 100);
            return px + 'px';
        });

        // 转换 vmin, vmax
        html = html.replace(/(\d+(?:\.\d+)?)\s*vmin/g, (match, val) => {
            const px = Math.round(parseFloat(val) * Math.min(baseWidth, baseHeight) / 100);
            return px + 'px';
        });
        html = html.replace(/(\d+(?:\.\d+)?)\s*vmax/g, (match, val) => {
            const px = Math.round(parseFloat(val) * Math.max(baseWidth, baseHeight) / 100);
            return px + 'px';
        });

        // 转换 rem 为 px (假设 1rem = 16px)
        html = html.replace(/(\d+(?:\.\d+)?)\s*rem/g, (match, val) => {
            const px = Math.round(parseFloat(val) * 16);
            return px + 'px';
        });

        // 转换 em 为 px (保留为em，在某些情况下公众号能处理)
        // em 相对复杂，暂不转换

        return html;
    }

    // 转换flex布局为传统布局
    function convertFlexLayout(html) {
        // 检测并转换 flex 容器
        // 匹配 style 属性中的 flex 相关属性
        const flexPattern = /style\s*=\s*["']([^"']*)display\s*:\s*flex([^"']*)["']/gi;

        html = html.replace(flexPattern, (match, before, after) => {
            // 移除 flex 相关属性，但保留其他属性
            let newStyle = before + after;
            newStyle = newStyle.replace(/display\s*:\s*flex;?/gi, '');
            newStyle = newStyle.replace(/flex-direction\s*:\s*[^;]+;?/gi, '');
            newStyle = newStyle.replace(/justify-content\s*:\s*[^;]+;?/gi, '');
            newStyle = newStyle.replace(/align-items\s*:\s*[^;]+;?/gi, '');
            newStyle = newStyle.replace(/flex-wrap\s*:\s*[^;]+;?/gi, '');
            newStyle = newStyle.replace(/flex\s*:\s*[^;]+;?/gi, '');
            newStyle = newStyle.replace(/align-self\s*:\s*[^;]+;?/gi, '');
            newStyle = newStyle.replace(/order\s*:\s*[^;]+;?/gi, '');

            return `style="${newStyle}"`;
        });

        return html;
    }

    // 添加打开面板的按钮
    function addOpenButton() {
        // 移除已存在的按钮
        const existingBtn = document.querySelector('#htmlInsertOpenBtn');
        if (existingBtn) {
            existingBtn.remove();
        }

        const button = document.createElement('button');
        button.id = 'htmlInsertOpenBtn';
        button.innerHTML = '📝 HTML插入';
        button.style.cssText = `
            position: fixed;
            top: 30px;
            right: 20px;
            background: linear-gradient(135deg, #07c160, #06ae56);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            cursor: pointer;
            z-index: 999999;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(7, 193, 96, 0.4);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            user-select: none;
            outline: none;
        `;

        // 移除hover效果避免兼容性问题
        button.addEventListener('click', () => {
            console.log('HTML插入按钮被点击');
            let panel = document.querySelector('#htmlInsertPanel');
            if (panel) {
                panel.style.display = 'block';
            } else {
                createFloatPanel();
            }
        });

        // 确保按钮被添加到body
        document.body.appendChild(button);
        console.log('HTML插入按钮已添加，按钮ID:', button.id);

        // 验证按钮是否成功添加
        setTimeout(() => {
            const checkBtn = document.querySelector('#htmlInsertOpenBtn');
            if (checkBtn) {
                console.log('按钮验证成功，位置:', checkBtn.getBoundingClientRect());
            } else {
                console.error('按钮添加失败，尝试重新添加');
                addOpenButton();
            }
        }, 100);
    }

    // 监听URL变化（处理单页应用）
    function setupMutationObserver() {
        let lastUrl = location.href;
        const observer = new MutationObserver(() => {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                console.log('URL变化，重新初始化脚本');
                initScript();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // 页面加载完成后执行
    function initScript() {
        console.log('公众号HTML插入脚本初始化...');

        // 移除已存在的面板和按钮
        const existingPanel = document.querySelector('#htmlInsertPanel');
        const existingBtn = document.querySelector('#htmlInsertOpenBtn');
        if (existingPanel) {
            existingPanel.remove();
            console.log('已移除旧面板');
        }
        if (existingBtn) {
            existingBtn.remove();
            console.log('已移除旧按钮');
        }

        // 确保body存在且可访问
        if (!document.body) {
            console.log('body元素不存在，延迟初始化');
            setTimeout(initScript, 500);
            return;
        }

        // 添加按钮
        addOpenButton();

        console.log('公众号HTML插入脚本初始化完成');

        // 额外的验证机制
        setTimeout(() => {
            const verifyBtn = document.querySelector('#htmlInsertOpenBtn');
            if (!verifyBtn) {
                console.log('初始化后按钮缺失，重新添加');
                addOpenButton();
            }
        }, 2000);
    }

    // 确保页面完全加载，包括动态内容
    function safeInit() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(initScript, 1500);
            });
        } else {
            setTimeout(initScript, 1500);
        }
    }

    // 启动
    safeInit();

    // 设置MutationObserver监听页面变化
    setupMutationObserver();

})();