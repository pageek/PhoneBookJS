PhoneBook
=========

####分享页一键下载app插件

* 主要用于微信分享时，下载app时使用;
* Android可以一键下载并自动安装，可配置默认显示文字、下载、下载中、安装中等不同状态的提示文字;
* iOS访问会打开App Store;
* 安装成功后分享页面中会通过视窗切换监测安装状态，改变提示方案；
* 开发阶段调试代码在url中添加?debug，会在按钮下方显示调试信息；
* 如果只需要下载按钮，直接下载app，在参数中添加downloadType: 'onlyDownload'，只提供下载不监测安装状态；

```  
<!-- 需要绑定的dom -->
<a href="javascript:;" id="shareDownloadButton">我也要分析通话记录</a>

//参数配置
var shareDownloadOption = {
    
    id: '#shareDownloadButton',                       //绑定DOM元素的ID
    
    appName: '微信电话本',                             //应用名
    
    packageName: 'com.tencent.pb',                    //android必填，应用包名
    
    appMD5: '197d998a54c47bb092a40355f86f9a4c',       //android应用的MD5值
    
    downloadAndroidUrl: 'http://dldir1.qq.com/qqcontacts/100015_pb_3.0.0.2250_android.apk',    //安卓应用下载地址
                                                      
    openAndroidAppUrl: 'sharecalllog://url',          //打开安卓应用的地址
    
    packageUrl: 'phonebook://com.tencent.pb',         //iOS必填，xxxx:// 开头的一个scheme 例：phonebook://
    
    downloadIosUrl: 'App Store Url',                  //iOS应用下载地址
    
    openIosAppUrl: 'sharecalllog://url',              //打开iOS应用的地址
    
    defaultInnerHtml: '我也要分析通话记录',           //defaultInnerHtml 默认显示文字
    
    downloadInnerHtml: '下载微信电话本进行分析',      //downloadInnerHtml 未下载文字提示
    
    cancelDownloadInnerHtml: '正在下载微信电话本...', //cancelDownloadInnerHtml 下载中文字提示,点击可取消下载
    
    installAppInnerHtml: '安装微信电话本',            //installAppInnerHtml 下载完成提示文字
    
    downloadType: 'onlyDownload'                      //按钮下载类型
}
PhoneBook.shareDownload(shareDownloadOption);
```

####微信webview中的分享配置
分享给好友、分享到朋友圈时的图片、标题、描述和链接的配置项

```
//分享到微信
var shareToWechatOption = {
    //分享的图片链接地址
    shareImg: "http://dianhua.qq.com/zh_CN/htmledition/dianhuaben/img/mod-share-icon-st.png",
    //标题
    shareTitle: "打电话就用微信电话本，高清免费通话！",
    //描述
    shareDesc: "微信电话本，高清免费通话，专属语音信箱。",
    //URL；
    shareUrl: location.href
}
PhoneBook.shareToWechat(shareToWechatOption);
```

#####感谢meters && borg 贡献微信分享的代码
