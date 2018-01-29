#### vm
    一套简单web版阅片框架

#### 模块
1. c++ image server: 图片服务器
2. node web server: web服务器
3. web 前端HTML/JS/CSS

#### 安装方法
##### c++ image server
+ 安装boost
+ 在c++路径下执行
```
make
```

##### node web server
+ 安装node.js
+ 在node的路径下执行
```
npm install
```


#### 部署/运行方法
##### 启动c++ image server
+ 参数为port，如
```
./server 8001
```

##### 启动node wen server
+ 参数为 host port（这里的host和port是图片服务器的地址）
```
node server.js 127.0.0.1 8001
```

##### 浏览网页
+ 在浏览器中输入web server的地址：127.0.0.1:8080
