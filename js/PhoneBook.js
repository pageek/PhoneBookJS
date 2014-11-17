

! function($) {

    window.PhoneBook = window.PhoneBook || {};

    PhoneBook = {
        downloadOption: {},
        ifInstallDirect: false,
        downloadType: '',
        //微信分享下载app
        shareDownload: function(option) {

            //参数有效性验证
            if (!PhoneBook.optionVerification(option) && location.href.match('debug')) {
                return false;
            };

            PhoneBook.downloadType = option.downloadType || '';

            /**
             * @id 按钮绑定的ID
             * @appName 应用名
             * @packageName android必填，应用包名
             * @appMD5 android应用的MD5值
             * @downloadAndroidUrl 安卓应用下载地址
             * @openAndroidAppUrl 打开安卓应用的地址
             * @packageUrl iOS必填，xxxx:// 开头的一个scheme 例：phonebook://
             * @downloadIosUrl iOS应用下载地址
             * @openIosAppUrl 打开iOS应用的地址
             * @defaultInnerHtml 默认显示文字，为空显示为'打开 + appName'
             * @downloadInnerHtml 未下载文字提示，默认为“下载微信电话本进行分析”
             * @cancelDownloadInnerHtml 下载中文字提示，默认为“正在下载微信电话本...” 点击可取消下载
             * @installAppInnerHtml 下载完成提示文字，默认为“安装微信电话本”
             */

            PhoneBook.downloadOption = {
                id: option.id || '#sharDownload',
                appName: option.appName || '我的应用名',
                packageName: option.packageName || '',
                appMD5: option.appMD5 || '',
                downloadAndroidUrl: option.downloadAndroidUrl || '',
                openAndroidAppUrl: option.openAndroidAppUrl || '',
                packageUrl: option.packageUrl || '',
                downloadIosUrl: option.downloadIosUrl || '',
                openIosAppUrl: option.openIosAppUrl || '',
                defaultInnerHtml: option.defaultInnerHtml || '打开' + option.appName,
                downloadInnerHtml: option.downloadInnerHtml || '下载' + option.appName,
                cancelDownloadInnerHtml: option.cancelDownloadInnerHtml || '正在下载' + option.appName + '...',
                installAppInnerHtml: option.installAppInnerHtml || '安装' + option.appName
            }

            //初始化安装检测状态
            PhoneBook.init();

        },
        //微信分享
        shareToWechat: function(option){
            var obj = {};
            obj = {
                //分享的图片链接地址
                img_url: option.shareImg || '',
                //标题
                title: option.shareTitle || '',
                //url
                link: option.shareUrl || '',
                //描述
                desc: option.shareDesc || ''
            };

            PhoneBook._wxBridgeInvoke(function(){
                //分享给好友
                WeixinJSBridge.on('menu:share:appmessage', function () {
                    WeixinJSBridge.invoke('sendAppMessage', obj, function (r) {
                    });
                });
                //分享到朋友圈
                WeixinJSBridge.on('menu:share:timeline', function () {
                    WeixinJSBridge.invoke('shareTimeline', obj, function (r) {
                    });
                });
                
            });
            
        },
        init: function() {

            if(PhoneBook.downloadType == 'onlyDownload'){
                //初始化下载按钮状态
                PhoneBook.showButton('startDownload');

            }else{
                //应用安装状态检测
                PhoneBook._wxBridgeInvoke(PhoneBook.getInstallState);

                //视窗切换状态监测
                PhoneBook.activityStateChange();
            }

            //监听下载状态
            PhoneBook.wxDownloadStateChange();

            //事件绑定
            PhoneBook.bindEvents();

        },
        bindEvents: function() {

            var button = PhoneBook.downloadOption.id;

            $(document).on('click', button, function(e) {
                var that = $(this),
                    type = that.attr('data-type') || '';

                //默认状态
                if (type == 'shareMine') {
                    location.href = thar.attr('href');
                };
                //开始下载
                if (type == 'startDownload') {
                    PhoneBook.startDownload();
                };
                //取消下载
                if (type == 'cancelDownload') {
                    PhoneBook.cancelDownload();
                };
                //安装
                if (type == 'installApp') {
                    PhoneBook.installApp();
                };
                return false;
            });

        },
        log: function(message) {
            var $button = $(PhoneBook.downloadOption.id),
                url = location.href,
                logHtml = '<div class="downloadButtonLog" style="overflow:hidden;width:100%;line-height:25px;text-align:left;">' + message + '</div>';

            //url中包含debug，显示调试信息
            if (url.match('debug')) {
                $button.after(logHtml);
            };
            return false;
        },
        userAgent: function() {
            var ua = navigator.userAgent,
                checker = '';

            if (ua.match(/(iPhone|iPod|iPad)/)) {
                checker = 'ios';
            }
            if (ua.match(/Android/)) {
                checker = 'android';
            }
            return checker;
        },
        getCookie: function(name) {

            if (window.localStorage) {

                return localStorage.getItem(name);

            } else {
                var val = null,
                    r = /^(\s|\u00A0)+|(\s|\u00A0)+$/g;
                if (document.cookie && document.cookie != '') {
                    var h = document.cookie.split(';');

                    for (var g = 0; g < h.length; g++) {

                        var f = (h[g] || '').replace(r, '');
                        if (f.substring(0, name.length + 1) === (name + '=')) {

                            val = decodeURIComponent(f.substring(name.length + 1));
                            break;
                        }
                    }
                }
                return val;
            }
        },
        setCookie: function(name, val, sec, path) {

            if (window.localStorage) {

                localStorage.setItem(name, val);

            } else {
                var exp = new Date();
                exp.setTime(exp.getTime() + sec * 1000);
                document.cookie = name + '=' + val + ';expires=' + exp.toGMTString() + ';path=' + path || '/';
            };
        },
        clearCookie: function(name) {

            if (window.localStorage) {

                localStorage.removeItem(name);
                return;

            } else {
                this.set(name, '', -1);
            };
        },
        //参数合法性验证
        optionVerification: function(option) {
            if (option.id.indexOf('#') < 0) {
                PhoneBook.log('未正确填写id，例：#idName');
                return false;
            };
            if (option.downloadAndroidUrl.indexOf('.apk') < 0) {
                PhoneBook.log('未正确填写downloadAndroidUrl');
                return false;
            };
            if (option.openAndroidAppUrl.indexOf('://') < 0 || option.openAndroidAppUrl.match('http')) {
                PhoneBook.log('未正确填写openAndroidAppUrl');
                return false;
            };
            if (option.packageUrl.indexOf('://') < 0 || option.packageUrl.match('http')) {
                PhoneBook.log('未正确填写packageUrl，例：phonebook://');
                return false;
            };
            if (!option.downloadIosUrl.match('http://')) {
                PhoneBook.log('未正确填写downloadIosUrl，例：http://itunes.apple.com/us/app/id929040357');
                return false;
            };
            if (option.openIosAppUrl.indexOf('://') < 0 || option.openIosAppUrl.match('http')) {
                PhoneBook.log('未正确填写openIosAppUrl');
                return false;
            };
            return true;
        },
        //统一调用函数
        _wxBridgeInvoke: function(callback) {

            if (window.WeixinJSBridge) {

                callback();

            } else {

                if (document.addEventListener) {
                    //Chrome
                    document.addEventListener('WeixinJSBridgeReady', callback, false);

                } else if (document.attachEvent) {
                    //IE
                    document.attachEvent('WeixinJSBridgeReady', callback);
                    document.attachEvent('onWeixinJSBridgeReady', callback);

                }
            }
        },
        //获取之前的下载状态
        queryDownloadTask: function(downloadID) {
            //查询下载状态
            PhoneBook._wxBridgeInvoke(function() {

                WeixinJSBridge.invoke('queryDownloadTask', {

                    'download_id': downloadID

                }, function(res) {

                    PhoneBook.log('Bear call queryDownloadTask Result:' + res.err_msg + ', State:' + res.state);

                    PhoneBook.downloadStateChange(res);

                });

            });
        },
        //检查以前有没有安装过
        checkDownloadState: function() {

            //cookie查询
            var id = PhoneBook.getCookie('downloadID');

            if (id && id != 'undefined') {

                PhoneBook.queryDownloadTask(id);

            } else {

                PhoneBook.showButton('startDownload');

            }
        },
        //获取安装状态
        getInstallState: function() {

            PhoneBook._wxBridgeInvoke(function() {

                var option = PhoneBook.downloadOption,
                    packageUrl = option.packageUrl,
                    packageName = option.packageName,
                    packageName = option.packageName;

                //获取安装状态
                WeixinJSBridge.invoke('getInstallState', {

                        packageUrl: packageUrl,

                        packageName: packageName
                    },

                    function(res) {

                        /*
                         * @err_msg: 'get_install_state:no' 未安装
                         * @err_msg: 'get_install_state:yes' ios 已安装
                         * @err_msg: 'get_install_state:yes_[version]' android 已安装
                         */
                        PhoneBook.log(res.err_msg);

                        var option = PhoneBook.downloadOption,
                            $button = $(option.id),
                            openAndroidAppUrl = option.openAndroidAppUrl,
                            openIosAppUrl = option.openIosAppUrl,
                            msg = res.err_msg,
                            isIstall = msg.match('yes'),
                            version = msg.match(/yes_(\d+)/);

                        if (isIstall) {
                            //存在版本号为android
                            if (version) {

                                $button.attr('href', openAndroidAppUrl);

                            } else {

                                //ios版本
                                $button.attr('href', openIosAppUrl);
                            }

                            PhoneBook.showButton('shareMine');
                        } else {
                            PhoneBook.checkDownloadState();
                        }
                    }
                );
            })
        },
        //显示按钮
        showButton: function(tagID) {

            var option = PhoneBook.downloadOption;
            var $button = $(option.id);

            switch (tagID) {
                //默认状态
                case 'shareMine':

                    $button.attr('data-type', 'shareMine').html(option.defaultInnerHtml);
                    break;

                    //开始下载
                case 'startDownload':
                    $button.attr('data-type', 'startDownload').html(option.downloadInnerHtml);
                    break;

                    //正在下载，点击可取消下载
                case 'cancelDownload':
                    $button.attr('data-type', 'cancelDownload').html(option.cancelDownloadInnerHtml);
                    break;

                    //安装
                case 'installApp':
                    $button.attr('data-type', 'installApp').html(option.installAppInnerHtml);
                    break;
            }

            return false;
        },
        //判断状态入口
        downloadStateChange: function(res) {

            PhoneBook.log(res.state);

            if (res.state == 'default') {

                PhoneBook.showButton('startDownload');

            }

            if (res.state == 'download_succ') {

                PhoneBook.showButton('installApp');

                if (PhoneBook.ifInstallDirect)

                {

                    PhoneBook.installApp();

                    PhoneBook.ifInstallDirect = false;

                }

            }

            if (res.state == 'downloading') {

                PhoneBook.showButton('cancelDownload');

            }

            if (res.state == 'download_fail') {

                PhoneBook.showButton('startDownload');

            }
            return false;

        },
        //开始下载
        startDownload: function() {

            var option = PhoneBook.downloadOption,
                task_name = option.appName,
                task_url = option.downloadAndroidUrl,
                file_md5 = option.appMD5,
                $button = $(option.id),
                ua = PhoneBook.userAgent();

            if (ua == 'ios') {
                location.href = option.downloadIosUrl;
                return false;
            }
            //android download
            WeixinJSBridge.invoke('addDownloadTask', {

                //下载任务的名称，如“微信电话本3.0”
                'task_name': task_name,
                //下载APP的URL
                'task_url': task_url,
                //下载APP的MD5
                'file_md5': file_md5
            }, function(res) {
                
                if(PhoneBook.downloadType == 'onlyDownload'){
                    var startDownloadTip = $('#startDownloadTip');

                    startDownloadTip.fadeIn(400);
                    setTimeout(function(){
                        startDownloadTip.fadeOut(400);
                    }, 2400)
                };

                PhoneBook.log('开始下载：' + 'ID = ' + res.download_id + ', state = ' + res.err_msg);

                //cookie保存24h
                PhoneBook.setCookie('downloadID', res.download_id, 24 * 60 * 60);
                PhoneBook.showButton('cancelDownload');

                PhoneBook.ifInstallDirect = true;

            });

        },
        //取消下载
        cancelDownload: function() {

            WeixinJSBridge.invoke('cancelDownloadTask', {

                'download_id': PhoneBook.getCookie('downloadID')
                
            }, function(res) {

                PhoneBook.showButton('startDownload');
                PhoneBook.log('停止下载：' + res.err_msg);
            });
        },
        //安装
        installApp: function() {

            WeixinJSBridge.invoke('installDownloadTask', {

                'download_id': PhoneBook.getCookie('downloadID')

            }, function(res) {

                PhoneBook.log('安装微信电话本：' + res.err_msg);

            });
        },
        //从其他地方切回来的效果
        activityStateChange: function() {

            PhoneBook._wxBridgeInvoke(function() {

                WeixinJSBridge.on('activity:state_change', function(res) {

                    /*
                     * @res.state: onPause 跳走
                     * @res.state: onResume 跳回
                     */
                    if (res.state == 'onResume') PhoneBook.getInstallState();

                });

            });
        },
        //监听下载状态
        wxDownloadStateChange: function() {

            PhoneBook._wxBridgeInvoke(function() {
                WeixinJSBridge.on('wxdownload:state_change', function(res) {
                        /*
                         * @res.state: default 未下载
                         * @res.state: download_succ 下载成功
                         * @res.state: downloading 下载中
                         * @res.state: download_fail 下载失败
                         */
                        PhoneBook.downloadStateChange(res);

                    }

                )

            });
        }
    };

}(Zepto);


